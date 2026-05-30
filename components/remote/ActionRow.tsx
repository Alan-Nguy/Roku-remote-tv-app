import { StyleSheet, View } from "react-native";
import { RemoteButton } from "@/components/remote-button";

interface Props {
	onBack: () => void;
	onHome: () => void;
	onOptions: () => void;
}

export function ActionRow({ onBack, onHome, onOptions }: Props) {
	return (
		<View style={styles.row}>
			<RemoteButton
				icon="arrow-back"
				label="Back"
				onPress={onBack}
				variant="default"
				size="medium"
				labelPosition="below"
				style={styles.btn}
			/>
			<RemoteButton
				icon="home"
				label="Home"
				onPress={onHome}
				variant="default"
				size="medium"
				labelPosition="below"
				style={styles.btn}
			/>
			<RemoteButton
				icon="settings"
				label="Options"
				onPress={onOptions}
				variant="default"
				size="medium"
				labelPosition="below"
				style={styles.btn}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "100%",
		gap: 12,
	},
	btn: {
		flex: 1,
	},
});
