import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
	const colorScheme = useColorScheme() ?? "dark";

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme].tint,
				tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
				tabBarStyle: {
					backgroundColor: Colors[colorScheme].card,
					borderTopColor: Colors[colorScheme].cardBorder,
				},
				headerShown: false,
				tabBarButton: HapticTab,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Remote",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="settings-remote" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="apps"
				options={{
					title: "Apps",
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="apps" size={size} color={color} />
					),
				}}
			/>
			</Tabs>
	);
}
