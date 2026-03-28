/**
 * Roku External Control Protocol (ECP) Service
 *
 * The Roku ECP is a REST API running on port 8060 of any Roku device on the LAN.
 * Think of it like a game's admin console — you send HTTP commands and the TV obeys.
 *
 * IMPORTANT: Roku uses plain HTTP (not HTTPS). Android 9+ blocks cleartext by default,
 * so expo-build-properties must set usesCleartextTraffic: true.
 */

import * as Network from "expo-network";

export interface RokuDevice {
	ip: string;
	name: string;
	model: string;
	serialNumber: string;
	softwareVersion: string;
	powerMode: string;
}

export interface RokuApp {
	id: string;
	name: string;
	type: string;
	version: string;
}

// All the keys the Roku ECP supports
export type RokuKey =
	| "Home"
	| "Rev"
	| "Fwd"
	| "Play"
	| "Select"
	| "Left"
	| "Right"
	| "Up"
	| "Down"
	| "Back"
	| "InstantReplay"
	| "Info"
	| "Backspace"
	| "Search"
	| "Enter"
	| "VolumeDown"
	| "VolumeUp"
	| "VolumeMute"
	| "PowerOff"
	| "PowerOn"
	| "Power"
	| "InputTuner"
	| "InputHDMI1"
	| "InputHDMI2"
	| "InputHDMI3"
	| "InputHDMI4"
	| "InputAV1";

const ECP_PORT = 8060;
const TIMEOUT_MS = 4000;
const SCAN_TIMEOUT_MS = 2500;

/**
 * Get the phone's local IP and derive the /24 subnet base.
 * e.g. "192.168.0.105" → "192.168.0"
 */
export async function getLocalSubnet(): Promise<string | null> {
	try {
		const ip = await Network.getIpAddressAsync();
		if (!ip) return null;
		const parts = ip.split(".");
		if (parts.length !== 4) return null;
		return `${parts[0]}.${parts[1]}.${parts[2]}`;
	} catch {
		return null;
	}
}

/**
 * Send a keypress to the Roku device.
 * This is the core "button press" — like clicking a controller button.
 */
export async function sendKeypress(ip: string, key: RokuKey): Promise<boolean> {
	try {
		const response = await fetch(`http://${ip}:${ECP_PORT}/keypress/${key}`, {
			method: "POST",
			headers: { "Content-Length": "0" },
		});
		console.log(`[Roku] keypress ${key} → status ${response.status}`);
		return response.ok;
	} catch (err) {
		console.warn(
			`[Roku] keypress ${key} to ${ip} failed:`,
			JSON.stringify(err),
			err,
		);
		return false;
	}
}

/**
 * Send a literal character for text input (keyboard mode).
 */
export async function sendLiteral(ip: string, char: string): Promise<boolean> {
	try {
		const encoded = encodeURIComponent(char);
		const response = await fetch(
			`http://${ip}:${ECP_PORT}/keypress/Lit_${encoded}`,
			{ method: "POST" },
		);
		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Send a full string of text, character by character.
 */
export async function sendText(ip: string, text: string): Promise<boolean> {
	for (const char of text) {
		const ok = await sendLiteral(ip, char);
		if (!ok) return false;
	}
	return true;
}

/**
 * Query device info — the "inspect element" of the Roku world.
 * Returns XML that we parse for device name, model, etc.
 */
export async function getDeviceInfo(ip: string): Promise<RokuDevice | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

		const response = await fetch(`http://${ip}:${ECP_PORT}/query/device-info`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);

		if (!response.ok) {
			console.warn(`[Roku] device-info ${ip} returned ${response.status}`);
			return null;
		}

		const xml = await response.text();
		return {
			ip,
			name:
				extractXml(xml, "user-device-name") ||
				extractXml(xml, "friendly-device-name") ||
				"Roku Device",
			model: extractXml(xml, "model-name") || "Unknown",
			serialNumber: extractXml(xml, "serial-number") || "",
			softwareVersion: extractXml(xml, "software-version") || "",
			powerMode: extractXml(xml, "power-mode") || "unknown",
		};
	} catch (err) {
		// Only log non-abort errors (aborts are expected for non-Roku IPs)
		if (err instanceof Error && err.name !== "AbortError") {
			console.warn(`[Roku] device-info ${ip} error:`, err.message);
		}
		return null;
	}
}

/**
 * Get list of installed apps.
 */
export async function getInstalledApps(ip: string): Promise<RokuApp[]> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

		const response = await fetch(`http://${ip}:${ECP_PORT}/query/apps`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);

		if (!response.ok) return [];

		const xml = await response.text();
		return parseApps(xml);
	} catch {
		return [];
	}
}

/**
 * Get the currently active/running app.
 */
export async function getActiveApp(ip: string): Promise<RokuApp | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

		const response = await fetch(`http://${ip}:${ECP_PORT}/query/active-app`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);

		if (!response.ok) return null;

		const xml = await response.text();
		const apps = parseApps(xml);
		return apps.length > 0 ? apps[0] : null;
	} catch {
		return null;
	}
}

/**
 * Launch an installed app by ID.
 */
export async function launchApp(ip: string, appId: string): Promise<boolean> {
	try {
		const response = await fetch(`http://${ip}:${ECP_PORT}/launch/${appId}`, {
			method: "POST",
			headers: { "Content-Length": "0" },
		});
		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Scan the local network for Roku devices.
 *
 * Probes every IP on the /24 subnet. Like pinging every door
 * in an apartment building to find your friend's unit.
 */
export async function scanForDevices(
	baseIp: string,
	onFound: (device: RokuDevice) => void,
	onProgress?: (scanned: number, total: number) => void,
	onError?: (message: string) => void,
): Promise<void> {
	const total = 254;
	let scanned = 0;
	let errorCount = 0;

	console.log(`[Roku] Starting scan on ${baseIp}.1-254`);

	// Scan in batches of 15 to avoid overwhelming the network stack
	const batchSize = 15;
	for (let start = 1; start <= 254; start += batchSize) {
		const promises: Promise<void>[] = [];

		for (let i = start; i < Math.min(start + batchSize, 255); i++) {
			const ip = `${baseIp}.${i}`;
			promises.push(
				probeDevice(ip)
					.then((device) => {
						scanned++;
						onProgress?.(scanned, total);
						if (device) {
							console.log(
								`[Roku] Found device: ${device.name} at ${device.ip}`,
							);
							onFound(device);
						}
					})
					.catch((err) => {
						scanned++;
						errorCount++;
						onProgress?.(scanned, total);
						// Only log unexpected errors, not timeouts
						if (err?.message && !err.message.includes("abort")) {
							console.warn(`[Roku] Probe ${ip} error:`, err.message);
						}
					}),
			);
		}

		await Promise.all(promises);
	}

	console.log(
		`[Roku] Scan complete. Probed ${scanned} IPs, ${errorCount} errors.`,
	);

	// If ALL probes errored, cleartext is probably blocked
	if (errorCount === total) {
		onError?.(
			"All 254 probes failed. This usually means Android is blocking plain HTTP traffic. " +
				'Make sure you ran "npx expo prebuild" after adding expo-build-properties, ' +
				"or try a development build instead of Expo Go.",
		);
	}
}

/**
 * Quick probe — try to hit the device-info endpoint with a short timeout.
 */
async function probeDevice(ip: string): Promise<RokuDevice | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

	try {
		const response = await fetch(`http://${ip}:${ECP_PORT}/query/device-info`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);

		if (!response.ok) return null;

		const xml = await response.text();

		// Verify it's actually a Roku device
		if (!xml.includes("<device-info>")) return null;

		return {
			ip,
			name:
				extractXml(xml, "user-device-name") ||
				extractXml(xml, "friendly-device-name") ||
				"Roku Device",
			model: extractXml(xml, "model-name") || "Unknown",
			serialNumber: extractXml(xml, "serial-number") || "",
			softwareVersion: extractXml(xml, "software-version") || "",
			powerMode: extractXml(xml, "power-mode") || "unknown",
		};
	} catch {
		clearTimeout(timeout);
		return null;
	}
}

// --- XML Parsing Helpers ---

function extractXml(xml: string, tag: string): string {
	const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
	const match = xml.match(regex);
	return match ? match[1].trim() : "";
}

function parseApps(xml: string): RokuApp[] {
	const apps: RokuApp[] = [];
	const appRegex =
		/<app\s+id="([^"]*)"(?:\s+type="([^"]*)")?(?:\s+version="([^"]*)")?[^>]*>([^<]*)<\/app>/g;

	let match;
	while ((match = appRegex.exec(xml)) !== null) {
		apps.push({
			id: match[1],
			type: match[2] || "appl",
			version: match[3] || "",
			name: match[4].trim(),
		});
	}

	return apps;
}
