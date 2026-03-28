import { useSyncExternalStore } from "react";
import { deviceStore } from "@/services/device-store";
import type { RokuDevice } from "@/services/roku";

export function useDeviceStore() {
	const device = useSyncExternalStore(
		(cb) => deviceStore.subscribe(cb),
		() => deviceStore.connectedDevice,
	);

	const savedDevices = useSyncExternalStore(
		(cb) => deviceStore.subscribe(cb),
		() => deviceStore.savedDevices,
	);

	return {
		connectedDevice: device,
		savedDevices,
		connect: (d: RokuDevice) => deviceStore.connect(d),
		disconnect: () => deviceStore.disconnect(),
		removeDevice: (ip: string) => deviceStore.removeDevice(ip),
		loadSaved: () => deviceStore.loadSaved(),
	};
}
