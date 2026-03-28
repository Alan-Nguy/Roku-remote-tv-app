/**
 * Keyboard Input Screen
 *
 * Opens as a modal for typing text into the Roku (search, login, etc.).
 * Each character is sent as a Lit_ keypress via ECP.
 *
 * Like opening a chat window in a game — you type, it sends character by character.
 */

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDeviceStore } from "@/hooks/use-device-store";
import { sendKeypress, sendText } from "@/services/roku";

export default function KeyboardScreen() {
	const colorScheme = useColorScheme() ?? "dark";
	const colors = Colors[colorScheme];
	const router = useRouter();
	const { connectedDevice } = useDeviceStore();

	const [text, setText] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSend = useCallback(async () => {
		if (!connectedDevice || !text.trim()) return;
		setSending(true);
		setSent(false);
		const ok = await sendText(connectedDevice.ip, text);
		setSending(false);
		if (ok) {
			setSent(true);
			setText("");
		}
	}, [connectedDevice, text]);

	const handleSendAndSubmit = useCallback(async () => {
		if (!connectedDevice || !text.trim()) return;
		setSending(true);
		const ok = await sendText(connectedDevice.ip, text);
		if (ok) {
			await sendKeypress(connectedDevice.ip, "Enter");
			setSent(true);
			setText("");
		}
		setSending(false);
	}, [connectedDevice, text]);

	const handleBackspace = useCallback(async () => {
		if (!connectedDevice) return;
		await sendKeypress(connectedDevice.ip, "Backspace");
	}, [connectedDevice]);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<MaterialIcons name="close" size={24} color={colors.text} />
				</Pressable>
				<Text style={[styles.title, { color: colors.text }]}>Keyboard</Text>
				<View style={{ width: 32 }} />
			</View>

			{!connectedDevice ? (
				<View style={styles.emptyState}>
					<Text style={[styles.emptyText, { color: colors.subtle }]}>
						Connect to a Roku device first
					</Text>
				</View>
			) : (
				<View style={styles.content}>
					<Text style={[styles.hint, { color: colors.subtle }]}>
						Type text to send to your Roku. Useful for search, logins, etc.
					</Text>

					<TextInput
						style={[
							styles.input,
							{
								color: colors.text,
								backgroundColor: colors.card,
								borderColor: colors.cardBorder,
							},
						]}
						value={text}
						onChangeText={setText}
						placeholder="Type here..."
						placeholderTextColor={colors.subtle}
						autoFocus
						multiline
						returnKeyType="send"
					/>

					<View style={styles.actions}>
						<Pressable
							onPress={handleBackspace}
							style={[
								styles.actionButton,
								{ backgroundColor: colors.buttonBg },
							]}
						>
							<MaterialIcons name="backspace" size={20} color={colors.text} />
							<Text style={[styles.actionText, { color: colors.text }]}>
								Backspace
							</Text>
						</Pressable>

						<Pressable
							onPress={handleSend}
							disabled={!text.trim() || sending}
							style={[
								styles.actionButton,
								{
									backgroundColor: colors.tint,
									opacity: !text.trim() ? 0.4 : 1,
								},
							]}
						>
							{sending ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<>
									<MaterialIcons name="send" size={18} color="#fff" />
									<Text style={[styles.actionText, { color: "#fff" }]}>
										Send Text
									</Text>
								</>
							)}
						</Pressable>
					</View>

					<Pressable
						onPress={handleSendAndSubmit}
						disabled={!text.trim() || sending}
						style={[
							styles.submitButton,
							{
								backgroundColor: colors.card,
								borderColor: colors.tint,
								opacity: !text.trim() ? 0.4 : 1,
							},
						]}
					>
						<MaterialIcons
							name="keyboard-return"
							size={20}
							color={colors.tint}
						/>
						<Text style={[styles.submitText, { color: colors.tint }]}>
							Send + Enter (Submit)
						</Text>
					</Pressable>

					{sent && (
						<View style={styles.sentConfirm}>
							<MaterialIcons
								name="check-circle"
								size={18}
								color={colors.success}
							/>
							<Text style={[styles.sentText, { color: colors.success }]}>
								Text sent!
							</Text>
						</View>
					)}
				</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backButton: { padding: 4 },
	title: { fontSize: 20, fontWeight: "700" },
	content: { paddingHorizontal: 20, gap: 16 },
	hint: { fontSize: 13, textAlign: "center" },
	input: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		minHeight: 100,
		textAlignVertical: "top",
	},
	actions: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 14,
		borderRadius: 10,
	},
	actionText: { fontWeight: "600", fontSize: 14 },
	submitButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 14,
		borderRadius: 10,
		borderWidth: 1.5,
	},
	submitText: { fontWeight: "600", fontSize: 14 },
	sentConfirm: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	sentText: { fontSize: 14, fontWeight: "600" },
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: { fontSize: 14 },
});
