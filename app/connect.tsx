/**
 * Device Discovery & Connection Screen
 *
 * Two ways to find your Roku:
 * 1. Network scan — brute-force probe every IP on your /24 subnet
 * 2. Manual IP entry — if you already know the IP (check your router's DHCP table)
 *
 * Auto-detects your phone's subnet so you don't have to guess.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useDeviceStore } from '@/hooks/use-device-store';
import {
  RokuDevice,
  scanForDevices,
  getDeviceInfo,
  getLocalSubnet,
} from '@/services/roku';

export default function ConnectScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { connectedDevice, savedDevices, connect, loadSaved } = useDeviceStore();

  const [foundDevices, setFoundDevices] = useState<RokuDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [manualIp, setManualIp] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [subnetBase, setSubnetBase] = useState('192.168.1');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [detectedIp, setDetectedIp] = useState<string | null>(null);

  useEffect(() => {
    loadSaved();
    // Auto-detect the phone's subnet
    getLocalSubnet().then((subnet) => {
      if (subnet) {
        setSubnetBase(subnet);
        setDetectedIp(subnet);
      }
    });
  }, []);

  const handleScan = useCallback(async () => {
    setScanning(true);
    setFoundDevices([]);
    setScanProgress(0);
    setStatusMessage(`Scanning ${subnetBase}.1-254...`);

    await scanForDevices(
      subnetBase,
      (device) => {
        setFoundDevices((prev) => {
          if (prev.find((d) => d.ip === device.ip)) return prev;
          return [...prev, device];
        });
        setStatusMessage(`Found: ${device.name} (${device.ip})`);
      },
      (scanned, total) => {
        setScanProgress(Math.round((scanned / total) * 100));
      },
      (errorMsg) => {
        setStatusMessage(errorMsg);
      }
    );

    setScanning(false);
    setStatusMessage((prev) =>
      prev?.startsWith('Found') ? prev : 'Scan complete — no Roku devices found on this subnet.'
    );
  }, [subnetBase]);

  const handleConnect = useCallback(
    async (device: RokuDevice) => {
      setConnecting(device.ip);
      setStatusMessage(`Connecting to ${device.ip}...`);
      const info = await getDeviceInfo(device.ip);
      if (info) {
        connect(info);
        router.back();
      } else {
        Alert.alert(
          'Connection Failed',
          `Could not reach Roku at ${device.ip}. Make sure you're on the same Wi-Fi network.`
        );
        setStatusMessage('Connection failed');
      }
      setConnecting(null);
    },
    [connect, router]
  );

  const handleManualConnect = useCallback(async () => {
    const ip = manualIp.trim();
    if (!ip) return;

    setConnecting(ip);
    setStatusMessage(`Trying ${ip}:8060...`);
    const info = await getDeviceInfo(ip);
    if (info) {
      connect(info);
      setManualIp('');
      router.back();
    } else {
      Alert.alert(
        'Not Found',
        `No Roku device at ${ip}:8060.\n\nChecklist:\n• Same Wi-Fi network?\n• Roku TV is on?\n• Try: Roku Settings > System > Advanced > Control by mobile apps > Permissive`
      );
      setStatusMessage('Manual connection failed');
    }
    setConnecting(null);
  }, [manualIp, connect, router]);

  const renderDevice = ({ item }: { item: RokuDevice }) => {
    const isConnected = connectedDevice?.ip === item.ip;
    const isConnecting = connecting === item.ip;

    return (
      <Pressable
        onPress={() => handleConnect(item)}
        style={[
          styles.deviceCard,
          {
            backgroundColor: colors.card,
            borderColor: isConnected ? colors.tint : colors.cardBorder,
            borderWidth: isConnected ? 2 : 1,
          },
        ]}
      >
        <View style={styles.deviceIcon}>
          <MaterialIcons
            name="tv"
            size={28}
            color={isConnected ? colors.tint : colors.icon}
          />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.deviceMeta, { color: colors.subtle }]}>
            {item.model} • {item.ip}
          </Text>
        </View>
        {isConnecting ? (
          <ActivityIndicator size="small" color={colors.tint} />
        ) : isConnected ? (
          <MaterialIcons name="check-circle" size={22} color={colors.success} />
        ) : (
          <MaterialIcons name="chevron-right" size={22} color={colors.icon} />
        )}
      </Pressable>
    );
  };

  // Merge saved + found, dedup by IP
  const allDevices = [...savedDevices];
  foundDevices.forEach((fd) => {
    if (!allDevices.find((d) => d.ip === fd.ip)) {
      allDevices.push(fd);
    }
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Connect to Roku</Text>
      </View>

      {/* Status / Debug Banner */}
      {statusMessage && (
        <View style={[styles.statusBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialIcons name="info-outline" size={16} color={colors.subtle} />
          <Text style={[styles.statusText, { color: colors.subtle }]} numberOfLines={3}>
            {statusMessage}
          </Text>
        </View>
      )}

      {/* Subnet + Scan */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Network Scan
          {detectedIp && (
            <Text style={{ color: colors.success, fontWeight: '400', fontSize: 12 }}>
              {'  '}(auto-detected)
            </Text>
          )}
        </Text>
        <View style={styles.scanRow}>
          <TextInput
            style={[styles.subnetInput, { color: colors.text, backgroundColor: colors.buttonBg, borderColor: colors.cardBorder }]}
            value={subnetBase}
            onChangeText={setSubnetBase}
            placeholder="192.168.1"
            placeholderTextColor={colors.subtle}
            keyboardType="numeric"
          />
          <Text style={[styles.subnetSuffix, { color: colors.subtle }]}>.1-254</Text>
          <Pressable
            onPress={handleScan}
            disabled={scanning}
            style={[styles.scanButton, { backgroundColor: colors.tint, opacity: scanning ? 0.6 : 1 }]}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="wifi-find" size={20} color="#fff" />
            )}
            <Text style={styles.scanButtonText}>{scanning ? `${scanProgress}%` : 'Scan'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Manual IP */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manual Connection</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={[styles.ipInput, { color: colors.text, backgroundColor: colors.buttonBg, borderColor: colors.cardBorder }]}
            value={manualIp}
            onChangeText={setManualIp}
            placeholder="e.g. 192.168.1.100"
            placeholderTextColor={colors.subtle}
            keyboardType="numeric"
            returnKeyType="go"
            onSubmitEditing={handleManualConnect}
          />
          <Pressable
            onPress={handleManualConnect}
            disabled={!manualIp.trim() || connecting !== null}
            style={[
              styles.connectButton,
              { backgroundColor: colors.tint, opacity: !manualIp.trim() ? 0.4 : 1 },
            ]}
          >
            {connecting === manualIp.trim() ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.connectButtonText}>Connect</Text>
            )}
          </Pressable>
        </View>
        <Text style={[styles.hint, { color: colors.subtle }]}>
          Find your Roku's IP: Settings {'>'} Network {'>'} About
        </Text>
      </View>

      {/* Device List */}
      <Text style={[styles.listTitle, { color: colors.text }]}>
        {allDevices.length > 0 ? 'Devices' : scanning ? 'Scanning...' : 'No devices found yet'}
      </Text>

      <FlatList
        data={allDevices}
        keyExtractor={(item) => item.ip}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: { padding: 4 },
  title: { fontSize: 22, fontWeight: '700' },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, flex: 1 },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subnetInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  subnetSuffix: { fontSize: 13 },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scanButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  manualRow: { flexDirection: 'row', gap: 8 },
  ipInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  connectButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  connectButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  hint: { fontSize: 11, marginTop: 8 },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  deviceIcon: { marginRight: 12 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceMeta: { fontSize: 12, marginTop: 2 },
});
