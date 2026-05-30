import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectionBanner } from "@/components/connection-banner";
import { RemoteButton } from "@/components/remote-button";
import { ActionRow } from "@/components/remote/ActionRow";
import { AppShortcutsRow } from "@/components/remote/AppShortcutsRow";
import { CircularDPad } from "@/components/remote/CircularDPad";
import { MediaControlsRow } from "@/components/remote/MediaControlsRow";
import { NowPlayingCard } from "@/components/remote/NowPlayingCard";
import { VoiceSearchButton } from "@/components/remote/VoiceSearchButton";
import { VolumeRow } from "@/components/remote/VolumeRow";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeviceStore } from "@/hooks/use-device-store";
import { type RokuKey, sendKeypress } from "@/services/roku";

export default function RemoteScreen() {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const { connectedDevice } = useDeviceStore();
	const router = useRouter();

	const [volumeLevel, setVolumeLevel] = useState<number | null>(null);
	const [muted, setMuted] = useState(false);
	const [showMore, setShowMore] = useState(false);

	const press = useCallback(
		async (key: RokuKey) => {
			if (!connectedDevice) return;
			await sendKeypress(connectedDevice.ip, key);
		},
		[connectedDevice],
	);

	const handleVolumeDown = () => {
		press("VolumeDown");
		setVolumeLevel((v) => Math.max(0, (v ?? 50) - 1));
		setMuted(false);
	};

	const handleVolumeUp = () => {
		press("VolumeUp");
		setVolumeLevel((v) => Math.min(100, (v ?? 50) + 1));
		setMuted(false);
	};

	const handleMute = () => {
		press("VolumeMute");
		setMuted((m) => !m);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<ConnectionBanner />

			{/* Header */}
			<View style={styles.header}>
				<Pressable style={styles.devicePill} onPress={() => router.push("/connect")}>
					<View style={[styles.dot, { backgroundColor: connectedDevice ? colors.success : colors.subtle }]} />
					<Text style={[styles.deviceName, { color: colors.text }]} numberOfLines={1}>
						{connectedDevice?.name ?? "No Device"}
					</Text>
					<MaterialIcons name="keyboard-arrow-down" size={18} color={colors.subtle} />
				</Pressable>

				<RemoteButton
					icon="power-settings-new"
					onPress={() => press("PowerOn")}
					onLongPress={() => press("PowerOff")}
					variant="danger"
					size="small"
					style={styles.powerBtn}
				/>
			</View>

			<ScrollView
				contentContainerStyle={styles.controls}
				showsVerticalScrollIndicator={false}
			>
				<NowPlayingCard deviceIp={connectedDevice?.ip ?? null} />

				<View style={styles.dpadWrapper}>
					<CircularDPad
						onUp={() => press("Up")}
						onDown={() => press("Down")}
						onLeft={() => press("Left")}
						onRight={() => press("Right")}
						onSelect={() => press("Select")}
					/>
				</View>

				<ActionRow
					onBack={() => press("Back")}
					onHome={() => press("Home")}
					onOptions={() => press("Info")}
				/>

				<MediaControlsRow
					onReplay={() => press("InstantReplay")}
					onRewind={() => press("Rev")}
					onPlayPause={() => press("Play")}
					onForward={() => press("Fwd")}
					onMore={() => press("Info")}
				/>

				<VolumeRow
					volumeLevel={volumeLevel}
					muted={muted}
					onVolumeDown={handleVolumeDown}
					onVolumeUp={handleVolumeUp}
					onMute={handleMute}
				/>

				<AppShortcutsRow deviceIp={connectedDevice?.ip ?? null} />

				<VoiceSearchButton
					onPress={() => {
						press("Search");
						router.push("/keyboard");
					}}
				/>

				{/* More toggle */}
				<Pressable
					style={styles.moreToggle}
					onPress={() => setShowMore((s) => !s)}
				>
					<Text style={[styles.moreLabel, { color: colors.subtle }]}>More</Text>
					<MaterialIcons
						name={showMore ? "keyboard-arrow-up" : "keyboard-arrow-down"}
						size={18}
						color={colors.subtle}
					/>
				</Pressable>

				{showMore && (
					<>
						{/* Utility Row */}
						<View style={styles.row}>
							<RemoteButton icon="replay" onPress={() => press("InstantReplay")} size="small" />
							<RemoteButton icon="info-outline" onPress={() => press("Info")} size="small" />
							<RemoteButton icon="search" onPress={() => press("Search")} size="small" />
							<RemoteButton icon="keyboard" onPress={() => router.push("/keyboard")} size="small" />
						</View>

						{/* HDMI Inputs */}
						<View style={styles.row}>
							<RemoteButton label="HDMI 1" onPress={() => press("InputHDMI1")} size="small" />
							<RemoteButton label="HDMI 2" onPress={() => press("InputHDMI2")} size="small" />
							<RemoteButton label="HDMI 3" onPress={() => press("InputHDMI3")} size="small" />
							<RemoteButton label="Tuner" onPress={() => press("InputTuner")} size="small" />
						</View>
					</>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	devicePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		flex: 1,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	deviceName: {
		fontSize: 15,
		fontWeight: "600",
		flexShrink: 1,
	},
	powerBtn: {
		borderRadius: 999,
		width: 44,
		height: 44,
		minWidth: 44,
		minHeight: 44,
		paddingVertical: 0,
		paddingHorizontal: 0,
	},
	controls: {
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 40,
		gap: 16,
	},
	dpadWrapper: {
		alignItems: "center",
	},
	row: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
		width: "100%",
	},
	moreToggle: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingVertical: 4,
	},
	moreLabel: {
		fontSize: 13,
		fontWeight: "500",
	},
});
