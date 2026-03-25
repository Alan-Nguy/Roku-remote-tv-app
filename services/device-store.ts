/**
 * Simple device connection state management.
 *
 * Using a lightweight pub/sub store instead of Redux/Zustand —
 * this app is small enough that a global singleton does the job.
 * Think of it like a shared party inventory in an MMO.
 */

import { RokuDevice } from './roku';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'roku_saved_devices';
const LAST_DEVICE_KEY = 'roku_last_device';

type Listener = () => void;

class DeviceStore {
  private _connectedDevice: RokuDevice | null = null;
  private _savedDevices: RokuDevice[] = [];
  private _listeners: Set<Listener> = new Set();

  get connectedDevice(): RokuDevice | null {
    return this._connectedDevice;
  }

  get savedDevices(): RokuDevice[] {
    return this._savedDevices;
  }

  connect(device: RokuDevice) {
    this._connectedDevice = device;
    this._addToSaved(device);
    this._persistLastDevice(device);
    this._notify();
  }

  disconnect() {
    this._connectedDevice = null;
    this._notify();
  }

  subscribe(listener: Listener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  async loadSaved(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        this._savedDevices = JSON.parse(json);
      }
      const lastJson = await AsyncStorage.getItem(LAST_DEVICE_KEY);
      if (lastJson) {
        this._connectedDevice = JSON.parse(lastJson);
      }
      this._notify();
    } catch {
      // Storage not available, continue with empty state
    }
  }

  removeDevice(ip: string) {
    this._savedDevices = this._savedDevices.filter((d) => d.ip !== ip);
    if (this._connectedDevice?.ip === ip) {
      this._connectedDevice = null;
    }
    this._persistSaved();
    this._notify();
  }

  private _addToSaved(device: RokuDevice) {
    const exists = this._savedDevices.find((d) => d.ip === device.ip);
    if (!exists) {
      this._savedDevices.push(device);
    } else {
      // Update existing entry
      this._savedDevices = this._savedDevices.map((d) =>
        d.ip === device.ip ? device : d
      );
    }
    this._persistSaved();
  }

  private async _persistSaved() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this._savedDevices));
    } catch {
      // Ignore storage errors
    }
  }

  private async _persistLastDevice(device: RokuDevice) {
    try {
      await AsyncStorage.setItem(LAST_DEVICE_KEY, JSON.stringify(device));
    } catch {
      // Ignore storage errors
    }
  }

  private _notify() {
    this._listeners.forEach((l) => l());
  }
}

export const deviceStore = new DeviceStore();
