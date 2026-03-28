import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import {
	Platform,
	Pressable,
	StyleSheet,
	Text,
	type TextStyle,
	type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/theme";

import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
	onPress: () => void;
	onLongPress?: () => void;
	label?: string;
	icon?: ComponentProps<typeof MaterialIcons>["name"];
	iconSize?: number;
	style?: ViewStyle;
	textStyle?: TextStyle;
	variant?: "default" | "accent" | "danger" | "round";
	size?: "small" | "medium" | "large";
	disabled?: boolean;
};

export function RemoteButton({
	onPress,
	onLongPress,
	label,
	icon,
	iconSize,
	style,
	textStyle,
	variant = "default",
	size = "medium",
	disabled = false,
}: Props) {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];

	const handlePress = () => {
		if (Platform.OS !== "web") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		onPress();
	};

	const sizeStyles = {
		small: {
			paddingVertical: 8,
			paddingHorizontal: 12,
			minWidth: 44,
			minHeight: 44,
		},
		medium: {
			paddingVertical: 14,
			paddingHorizontal: 20,
			minWidth: 56,
			minHeight: 56,
		},
		large: {
			paddingVertical: 18,
			paddingHorizontal: 28,
			minWidth: 70,
			minHeight: 70,
		},
	};

	const variantStyles: Record<string, ViewStyle> = {
		default: { backgroundColor: colors.buttonBg },
		accent: { backgroundColor: colors.tint },
		danger: { backgroundColor: colors.dangerBg },
		round: {
			backgroundColor: colors.buttonBg,
			borderRadius: 999,
			width: size === "large" ? 70 : size === "small" ? 44 : 56,
			height: size === "large" ? 70 : size === "small" ? 44 : 56,
			paddingVertical: 0,
			paddingHorizontal: 0,
		},
	};

	const textColor =
		variant === "accent"
			? "#FFFFFF"
			: variant === "danger"
				? colors.dangerText
				: colors.text;

	const finalIconSize =
		iconSize ?? (size === "large" ? 28 : size === "small" ? 18 : 22);

	return (
		<Pressable
			onPress={handlePress}
			onLongPress={onLongPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.base,
				sizeStyles[size],
				variantStyles[variant],
				pressed && { opacity: 0.6, transform: [{ scale: 0.95 }] },
				disabled && { opacity: 0.4 },
				style,
			]}
		>
			{icon && (
				<MaterialIcons name={icon} size={finalIconSize} color={textColor} />
			)}
			{label && !icon && (
				<Text
					style={[
						styles.label,
						{ color: textColor, fontSize: size === "small" ? 12 : 14 },
						textStyle,
					]}
				>
					{label}
				</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontWeight: "600",
		textAlign: "center",
	},
});
