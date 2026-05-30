import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getActiveApp, type RokuApp } from "@/services/roku";

interface Props {
	deviceIp: string | null;
}

export function NowPlayingCard({ deviceIp }: Props) {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const [activeApp, setActiveApp] = useState<RokuApp | null>(null);
	const [loading, setLoading] = useState(false);

	useFocusEffect(
		useCallback(() => {
			if (!deviceIp) {
				setActiveApp(null);
				return;
			}
			setLoading(true);
			getActiveApp(deviceIp)
				.then(setActiveApp)
				.finally(() => setLoading(false));
		}, [deviceIp]),
	);

	return (
		<View style={[styles.card, { backgroundColor: colors.card }]}>
			{/* Icon */}
			<View style={[styles.iconWrap, { backgroundColor: colors.buttonBg }]}>
				{activeApp && deviceIp ? (
					<Image
						source={{ uri: `http://${deviceIp}:8060/query/icon/${activeApp.id}` }}
						style={styles.icon}
						contentFit="contain"
					/>
				) : (
					<MaterialIcons name="apps" size={28} color={colors.icon} />
				)}
			</View>

			{/* Info */}
			<View style={styles.info}>
				<Text style={[styles.nowPlayingLabel, { color: colors.subtle }]}>
					NOW PLAYING
				</Text>
				{loading ? (
					<ActivityIndicator size="small" color={colors.tint} />
				) : (
					<Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
						{activeApp?.name ?? (deviceIp ? "No active app" : "Not connected")}
					</Text>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 16,
		height: 72,
		gap: 12,
		paddingHorizontal: 12,
	},
	iconWrap: {
		width: 52,
		height: 52,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	icon: {
		width: 52,
		height: 52,
	},
	info: {
		flex: 1,
		gap: 4,
	},
	nowPlayingLabel: {
		fontSize: 10,
		fontWeight: "600",
		letterSpacing: 0.8,
	},
	appName: {
		fontSize: 15,
		fontWeight: "600",
	},
});
