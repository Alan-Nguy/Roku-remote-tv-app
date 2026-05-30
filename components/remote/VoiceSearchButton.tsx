import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Props {
	onPress: () => void;
}

export function VoiceSearchButton({ onPress }: Props) {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.pill,
				{ backgroundColor: colors.accent },
				pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
			]}
		>
			<MaterialIcons name="mic" size={22} color="#FFFFFF" />
			<Text style={styles.label}>Voice Search</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	pill: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 999,
		paddingVertical: 16,
		gap: 8,
		width: "100%",
	},
	label: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "700",
	},
});
