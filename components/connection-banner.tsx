import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeviceStore } from "@/hooks/use-device-store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export function ConnectionBanner() {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const { connectedDevice } = useDeviceStore();
	const router = useRouter();

	if (connectedDevice) return null;

	return (
		<Pressable
			onPress={() => router.push("/connect")}
			style={[styles.banner, { backgroundColor: colors.dangerBg }]}
		>
			<MaterialIcons name="wifi-off" size={18} color={colors.dangerText} />
			<Text style={[styles.text, { color: colors.dangerText }]}>
				No Roku connected — tap to connect
			</Text>
			<MaterialIcons name="chevron-right" size={18} color={colors.dangerText} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	text: {
		fontSize: 13,
		fontWeight: "600",
	},
});
