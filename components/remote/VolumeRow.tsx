import { StyleSheet, Text, View } from "react-native";
import { RemoteButton } from "@/components/remote-button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Props {
	volumeLevel: number | null;
	muted: boolean;
	onVolumeDown: () => void;
	onVolumeUp: () => void;
	onMute: () => void;
}

export function VolumeRow({ volumeLevel, muted, onVolumeDown, onVolumeUp, onMute }: Props) {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];

	const label = muted ? "Muted" : volumeLevel !== null ? `Volume ${volumeLevel}` : "Volume";

	return (
		<View style={styles.row}>
			<RemoteButton icon="volume-down" onPress={onVolumeDown} size="medium" />
			<View
				style={[styles.pill, { backgroundColor: colors.buttonBg }]}
			>
				<RemoteButton
					icon={muted ? "volume-off" : "volume-up"}
					onPress={onMute}
					size="small"
					style={styles.muteBtn}
				/>
				<Text style={[styles.label, { color: colors.text }]}>{label}</Text>
			</View>
			<RemoteButton icon="volume-up" onPress={onVolumeUp} size="medium" />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		gap: 10,
	},
	pill: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 999,
		paddingVertical: 10,
		paddingHorizontal: 14,
		gap: 8,
	},
	muteBtn: {
		backgroundColor: "transparent",
		minWidth: 0,
		minHeight: 0,
		paddingVertical: 0,
		paddingHorizontal: 0,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		flex: 1,
	},
});
