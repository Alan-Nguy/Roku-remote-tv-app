import { StyleSheet, View } from "react-native";
import { RemoteButton } from "@/components/remote-button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const DIAMETER = 260;
const ARROW_SIZE = 56; // "medium" round button
const OK_SIZE = 72;

interface Props {
	onUp: () => void;
	onDown: () => void;
	onLeft: () => void;
	onRight: () => void;
	onSelect: () => void;
}

export function CircularDPad({ onUp, onDown, onLeft, onRight, onSelect }: Props) {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];

	const center = DIAMETER / 2;
	const okOffset = center - OK_SIZE / 2;
	const arrowOffset = center - ARROW_SIZE / 2;

	return (
		<View
			style={[
				styles.circle,
				{ backgroundColor: colors.dpadRing },
			]}
		>
			{/* Up */}
			<View style={[styles.btn, { top: 10, left: arrowOffset }]}>
				<RemoteButton icon="keyboard-arrow-up" onPress={onUp} variant="round" size="medium" />
			</View>

			{/* Down */}
			<View style={[styles.btn, { bottom: 10, left: arrowOffset }]}>
				<RemoteButton icon="keyboard-arrow-down" onPress={onDown} variant="round" size="medium" />
			</View>

			{/* Left */}
			<View style={[styles.btn, { left: 10, top: arrowOffset }]}>
				<RemoteButton icon="keyboard-arrow-left" onPress={onLeft} variant="round" size="medium" />
			</View>

			{/* Right */}
			<View style={[styles.btn, { right: 10, top: arrowOffset }]}>
				<RemoteButton icon="keyboard-arrow-right" onPress={onRight} variant="round" size="medium" />
			</View>

			{/* OK center */}
			<View style={[styles.btn, { top: okOffset, left: okOffset }]}>
				<RemoteButton
					label="OK"
					onPress={onSelect}
					variant="glow"
					size="large"
					style={{ borderRadius: 999, width: OK_SIZE, height: OK_SIZE }}
					textStyle={{ fontSize: 17, fontWeight: "700" }}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	circle: {
		width: DIAMETER,
		height: DIAMETER,
		borderRadius: DIAMETER / 2,
		position: "relative",
	},
	btn: {
		position: "absolute",
	},
});
