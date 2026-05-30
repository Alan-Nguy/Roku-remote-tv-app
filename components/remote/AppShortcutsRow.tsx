import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getInstalledApps, launchApp, type RokuApp } from "@/services/roku";

const PRIORITY_IDS = ["12", "2285", "13", "34399", "28"];
const BRAND_COLORS: Record<string, string> = {
	"12": "#E50914",
	"2285": "#FF0000",
	"13": "#00A8E0",
	"34399": "#5B2D8E",
	"28": "#113CCF",
};

interface Props {
	deviceIp: string | null;
}

export function AppShortcutsRow({ deviceIp }: Props) {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const [apps, setApps] = useState<RokuApp[]>([]);

	useEffect(() => {
		if (!deviceIp) return;
		getInstalledApps(deviceIp).then((all) => {
			const priority = PRIORITY_IDS.map((id) => all.find((a) => a.id === id)).filter(Boolean) as RokuApp[];
			const rest = all.filter((a) => !PRIORITY_IDS.includes(a.id));
			setApps([...priority, ...rest].slice(0, 5));
		});
	}, [deviceIp]);

	if (!deviceIp || apps.length === 0) return null;

	return (
		<View style={styles.row}>
			{apps.map((app) => (
				<Pressable
					key={app.id}
					style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
					onPress={() => launchApp(deviceIp, app.id)}
				>
					<View style={[styles.iconWrap, { backgroundColor: BRAND_COLORS[app.id] ?? colors.card }]}>
						<Image
							source={{ uri: `http://${deviceIp}:8060/query/icon/${app.id}` }}
							style={styles.icon}
							contentFit="contain"
						/>
					</View>
					<Text style={[styles.name, { color: colors.subtle }]} numberOfLines={1}>
						{app.name}
					</Text>
				</Pressable>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "100%",
	},
	item: {
		alignItems: "center",
		gap: 6,
		maxWidth: 60,
	},
	iconWrap: {
		width: 52,
		height: 52,
		borderRadius: 26,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	icon: {
		width: 52,
		height: 52,
	},
	name: {
		fontSize: 10,
		textAlign: "center",
	},
});
