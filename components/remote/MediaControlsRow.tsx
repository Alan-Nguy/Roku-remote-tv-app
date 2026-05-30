import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { RemoteButton } from "@/components/remote-button";

interface Props {
	onReplay: () => void;
	onRewind: () => void;
	onPlayPause: () => void;
	onForward: () => void;
	onMore: () => void;
}

export function MediaControlsRow({ onReplay, onRewind, onPlayPause, onForward, onMore }: Props) {
	const [isPlaying, setIsPlaying] = useState(true);

	const handlePlayPause = () => {
		setIsPlaying((p) => !p);
		onPlayPause();
	};

	return (
		<View style={styles.row}>
			<RemoteButton icon="replay" onPress={onReplay} size="small" />
			<RemoteButton icon="fast-rewind" onPress={onRewind} size="medium" />
			<RemoteButton
				icon={isPlaying ? "pause" : "play-arrow"}
				onPress={handlePlayPause}
				variant={isPlaying ? "default" : "glow"}
				size="medium"
			/>
			<RemoteButton icon="fast-forward" onPress={onForward} size="medium" />
			<RemoteButton label="•••" onPress={onMore} size="small" />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		width: "100%",
		gap: 8,
	},
});
