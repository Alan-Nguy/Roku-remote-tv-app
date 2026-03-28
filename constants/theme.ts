import { Platform } from "react-native";

// Roku purple-ish brand palette
const tintColorLight = "#6C3FC5";
const tintColorDark = "#9B7ADB";

export const Colors = {
	light: {
		text: "#11181C",
		background: "#F5F5F7",
		tint: tintColorLight,
		icon: "#687076",
		tabIconDefault: "#687076",
		tabIconSelected: tintColorLight,
		card: "#FFFFFF",
		cardBorder: "#E0E0E0",
		buttonBg: "#EBEBEF",
		buttonActive: "#D0D0D8",
		dangerBg: "#FFE5E5",
		dangerText: "#D32F2F",
		success: "#2E7D32",
		subtle: "#999",
	},
	dark: {
		text: "#ECEDEE",
		background: "#0D0D0F",
		tint: tintColorDark,
		icon: "#9BA1A6",
		tabIconDefault: "#9BA1A6",
		tabIconSelected: tintColorDark,
		card: "#1A1A1F",
		cardBorder: "#2A2A30",
		buttonBg: "#2A2A30",
		buttonActive: "#3A3A44",
		dangerBg: "#3D1515",
		dangerText: "#FF6B6B",
		success: "#66BB6A",
		subtle: "#666",
	},
};

export const Fonts = Platform.select({
	ios: {
		sans: "system-ui",
		serif: "ui-serif",
		rounded: "ui-rounded",
		mono: "ui-monospace",
	},
	default: {
		sans: "normal",
		serif: "serif",
		rounded: "normal",
		mono: "monospace",
	},
	web: {
		sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		serif: "Georgia, 'Times New Roman', serif",
		rounded: "'SF Pro Rounded', sans-serif",
		mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
	},
});
