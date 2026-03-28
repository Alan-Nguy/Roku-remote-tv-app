/**
 * App Launcher Screen
 *
 * Lists all installed apps/channels on the connected Roku.
 * Tap an app to launch it — like an app drawer on your phone,
 * but for your TV.
 */

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectionBanner } from "@/components/connection-banner";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeviceStore } from "@/hooks/use-device-store";
import {
	getActiveApp,
	getInstalledApps,
	launchApp,
	type RokuApp,
} from "@/services/roku";

export default function AppsScreen() {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const { connectedDevice } = useDeviceStore();

	const [apps, setApps] = useState<RokuApp[]>([]);
	const [activeApp, setActiveApp] = useState<RokuApp | null>(null);
	const [loading, setLoading] = useState(false);
	const [launching, setLaunching] = useState<string | null>(null);

	const fetchApps = useCallback(async () => {
		if (!connectedDevice) return;
		setLoading(true);
		const [appList, current] = await Promise.all([
			getInstalledApps(connectedDevice.ip),
			getActiveApp(connectedDevice.ip),
		]);
		setApps(appList.sort((a, b) => a.name.localeCompare(b.name)));
		setActiveApp(current);
		setLoading(false);
	}, [connectedDevice]);

	useEffect(() => {
		fetchApps();
	}, [fetchApps]);

	const handleLaunch = useCallback(
		async (appId: string) => {
			if (!connectedDevice) return;
			setLaunching(appId);
			await launchApp(connectedDevice.ip, appId);
			// Refresh active app after a short delay
			setTimeout(async () => {
				const current = await getActiveApp(connectedDevice.ip);
				setActiveApp(current);
				setLaunching(null);
			}, 1500);
		},
		[connectedDevice],
	);

	const renderApp = ({ item }: { item: RokuApp }) => {
		const isActive = activeApp?.id === item.id;
		const isLaunching = launching === item.id;
		// Roku serves app icons at this URL
		const iconUri = connectedDevice
			? `http://${connectedDevice.ip}:8060/query/icon/${item.id}`
			: undefined;

		return (
			<Pressable
				onPress={() => handleLaunch(item.id)}
				style={[
					styles.appCard,
					{
						backgroundColor: colors.card,
						borderColor: isActive ? colors.tint : colors.cardBorder,
						borderWidth: isActive ? 2 : 1,
					},
				]}
			>
				{iconUri ? (
					<Image source={{ uri: iconUri }} style={styles.appIcon} />
				) : (
					<View
						style={[
							styles.appIconPlaceholder,
							{ backgroundColor: colors.buttonBg },
						]}
					>
						<MaterialIcons name="apps" size={24} color={colors.icon} />
					</View>
				)}
				<View style={styles.appInfo}>
					<Text
						style={[styles.appName, { color: colors.text }]}
						numberOfLines={1}
					>
						{item.name}
					</Text>
					<Text style={[styles.appMeta, { color: colors.subtle }]}>
						{item.version && `v${item.version}`}
						{isActive && " • Running"}
					</Text>
				</View>
				{isLaunching ? (
					<ActivityIndicator size="small" color={colors.tint} />
				) : isActive ? (
					<MaterialIcons
						name="play-circle-filled"
						size={22}
						color={colors.tint}
					/>
				) : (
					<MaterialIcons name="open-in-new" size={18} color={colors.icon} />
				)}
			</Pressable>
		);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<ConnectionBanner />

			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Apps</Text>
				<Text style={[styles.subtitle, { color: colors.subtle }]}>
					{apps.length > 0 ? `${apps.length} installed` : "Connect to see apps"}
				</Text>
			</View>

			{!connectedDevice ? (
				<View style={styles.emptyState}>
					<MaterialIcons name="tv-off" size={48} color={colors.subtle} />
					<Text style={[styles.emptyText, { color: colors.subtle }]}>
						Connect to a Roku device to see installed apps
					</Text>
				</View>
			) : (
				<FlatList
					data={apps}
					keyExtractor={(item) => item.id}
					renderItem={renderApp}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl
							refreshing={loading}
							onRefresh={fetchApps}
							tintColor={colors.tint}
						/>
					}
					ListEmptyComponent={
						loading ? (
							<ActivityIndicator
								size="large"
								color={colors.tint}
								style={{ marginTop: 40 }}
							/>
						) : null
					}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 12,
	},
	title: { fontSize: 22, fontWeight: "700" },
	subtitle: { fontSize: 13, marginTop: 2 },
	list: { paddingHorizontal: 16, paddingBottom: 40 },
	appCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 12,
		marginBottom: 8,
	},
	appIcon: {
		width: 44,
		height: 44,
		borderRadius: 8,
		marginRight: 12,
	},
	appIconPlaceholder: {
		width: 44,
		height: 44,
		borderRadius: 8,
		marginRight: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	appInfo: { flex: 1 },
	appName: { fontSize: 15, fontWeight: "600" },
	appMeta: { fontSize: 12, marginTop: 2 },
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		paddingHorizontal: 40,
	},
	emptyText: { fontSize: 14, textAlign: "center" },
});
