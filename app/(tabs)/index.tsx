/**
 * Remote Control Screen — the main "gamepad" of the app.
 *
 * Layout follows the classic Roku remote:
 * - Top row: Power, Home, Back
 * - D-pad with center Select button
 * - Media controls: Rev, Play/Pause, Fwd
 * - Bottom: Volume, Mute, special buttons
 *
 * Every button press fires an HTTP POST to the Roku's ECP endpoint.
 * Haptic feedback on press makes it feel like a real remote.
 */

import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectionBanner } from "@/components/connection-banner";
import { RemoteButton } from "@/components/remote-button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeviceStore } from "@/hooks/use-device-store";
import { type RokuKey, sendKeypress } from "@/services/roku";

export default function RemoteScreen() {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const { connectedDevice } = useDeviceStore();
	const router = useRouter();
	const [lastError, setLastError] = useState<string | null>(null);

	const press = useCallback(
		async (key: RokuKey) => {
			if (!connectedDevice) return;
			setLastError(null);
			const ok = await sendKeypress(connectedDevice.ip, key);
			if (!ok) {
				setLastError(`Failed to send ${key}`);
			}
		},
		[connectedDevice],
	);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<ConnectionBanner />

			{/* Header */}
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Remote</Text>
				{connectedDevice && (
					<Text style={[styles.subtitle, { color: colors.subtle }]}>
						{connectedDevice.name}
					</Text>
				)}
			</View>

			<ScrollView
				contentContainerStyle={styles.controls}
				showsVerticalScrollIndicator={false}
			>
				{/* Top Row: Power, Home, Back */}
				<View style={styles.row}>
					<RemoteButton
						icon="power-settings-new"
						onPress={() => press("Power")}
						variant="danger"
						size="medium"
					/>
					<RemoteButton
						icon="home"
						onPress={() => press("Home")}
						size="medium"
					/>
					<RemoteButton
						icon="arrow-back"
						onPress={() => press("Back")}
						size="medium"
					/>
				</View>

				{/* D-Pad */}
				<View
					style={[
						styles.dpadContainer,
						{ backgroundColor: colors.card, borderColor: colors.cardBorder },
					]}
				>
					{/* Up */}
					<View style={styles.dpadRow}>
						<RemoteButton
							icon="keyboard-arrow-up"
							onPress={() => press("Up")}
							variant="round"
							size="large"
						/>
					</View>
					{/* Left, Select, Right */}
					<View style={styles.dpadRow}>
						<RemoteButton
							icon="keyboard-arrow-left"
							onPress={() => press("Left")}
							variant="round"
							size="large"
						/>
						<RemoteButton
							label="OK"
							onPress={() => press("Select")}
							variant="accent"
							size="large"
							style={{ borderRadius: 999, width: 70, height: 70 }}
							textStyle={{ fontSize: 16, fontWeight: "700" }}
						/>
						<RemoteButton
							icon="keyboard-arrow-right"
							onPress={() => press("Right")}
							variant="round"
							size="large"
						/>
					</View>
					{/* Down */}
					<View style={styles.dpadRow}>
						<RemoteButton
							icon="keyboard-arrow-down"
							onPress={() => press("Down")}
							variant="round"
							size="large"
						/>
					</View>
				</View>

				{/* Media Controls */}
				<View style={styles.row}>
					<RemoteButton
						icon="fast-rewind"
						onPress={() => press("Rev")}
						size="medium"
					/>
					<RemoteButton
						icon="play-arrow"
						onPress={() => press("Play")}
						variant="accent"
						size="medium"
					/>
					<RemoteButton
						icon="fast-forward"
						onPress={() => press("Fwd")}
						size="medium"
					/>
				</View>

				{/* Volume Controls */}
				<View style={styles.row}>
					<RemoteButton
						icon="volume-down"
						onPress={() => press("VolumeDown")}
						size="medium"
					/>
					<RemoteButton
						icon="volume-off"
						onPress={() => press("VolumeMute")}
						size="medium"
					/>
					<RemoteButton
						icon="volume-up"
						onPress={() => press("VolumeUp")}
						size="medium"
					/>
				</View>

				{/* Utility Row */}
				<View style={styles.row}>
					<RemoteButton
						icon="replay"
						onPress={() => press("InstantReplay")}
						size="small"
					/>
					<RemoteButton
						icon="info-outline"
						onPress={() => press("Info")}
						size="small"
					/>
					<RemoteButton
						icon="search"
						onPress={() => press("Search")}
						size="small"
					/>
					<RemoteButton
						icon="keyboard"
						onPress={() => router.push("/keyboard")}
						size="small"
					/>
				</View>

				{/* HDMI Inputs */}
				<View style={styles.row}>
					<RemoteButton
						label="HDMI 1"
						onPress={() => press("InputHDMI1")}
						size="small"
					/>
					<RemoteButton
						label="HDMI 2"
						onPress={() => press("InputHDMI2")}
						size="small"
					/>
					<RemoteButton
						label="HDMI 3"
						onPress={() => press("InputHDMI3")}
						size="small"
					/>
					<RemoteButton
						label="Tuner"
						onPress={() => press("InputTuner")}
						size="small"
					/>
				</View>

				{lastError && (
					<Text style={[styles.error, { color: colors.dangerText }]}>
						{lastError}
					</Text>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 4,
	},
	title: { fontSize: 22, fontWeight: "700" },
	subtitle: { fontSize: 13, marginTop: 2 },
	controls: {
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 40,
		gap: 14,
	},
	row: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 16,
	},
	dpadContainer: {
		padding: 12,
		borderRadius: 20,
		borderWidth: 1,
		alignItems: "center",
		gap: 4,
	},
	dpadRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
	},
	error: {
		fontSize: 12,
		textAlign: "center",
		marginTop: 8,
	},
});
