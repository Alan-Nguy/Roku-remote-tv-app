# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npx expo start       # Start the Expo dev server (scan QR for Expo Go)
npx expo run:ios     # Build and run on iOS simulator
npx expo run:android # Build and run on Android emulator/device
npx expo lint        # Run ESLint via expo lint
```

There are no tests.

## Architecture

This is an **Expo (React Native) app** that turns your phone into a Roku TV remote, using the **Roku External Control Protocol (ECP)** — a plain HTTP REST API running on port 8060 of any Roku device on the local network.

### Key constraint: Android cleartext HTTP
Roku uses plain HTTP, not HTTPS. Android 9+ blocks cleartext by default. `expo-build-properties` in `app.json` sets `usesCleartextTraffic: true`, but this only takes effect in a **development build** (`npx expo prebuild` + `npx expo run:android`) — it does **not** work in Expo Go.

### Data flow

```
services/roku.ts          ← Raw ECP HTTP calls (sendKeypress, scanForDevices, etc.)
services/device-store.ts  ← Singleton pub/sub store (DeviceStore class)
hooks/use-device-store.ts ← React adapter via useSyncExternalStore
screens                   ← Consume useDeviceStore(), call roku service directly
```

`DeviceStore` is a plain class singleton (`deviceStore`) — no Redux, no Zustand. It persists the connected device and saved device list to `AsyncStorage`. Components subscribe via `useSyncExternalStore` in `useDeviceStore()`.

### Screen structure (Expo Router)

- `app/(tabs)/index.tsx` — Remote control screen (D-pad, media, volume, HDMI inputs)
- `app/(tabs)/apps.tsx` — App launcher (fetches installed apps, highlights active app)
- `app/connect.tsx` — Device discovery modal (network scan + manual IP entry)
- `app/keyboard.tsx` — Text input modal (sends `Lit_<char>` keypresses character by character)
- `app/_layout.tsx` — Root layout; calls `deviceStore.loadSaved()` on mount

### Theming

All colors come from `constants/theme.ts` (`Colors.light` / `Colors.dark`). Screens read `useColorScheme()` and index into `Colors[colorScheme]`. Never hardcode colors.

### RemoteButton component

`components/remote-button.tsx` is the single button primitive for all remote controls. It accepts `variant` (`default` | `accent` | `danger` | `round`) and `size` (`small` | `medium` | `large`), fires haptics on press (skipped on web), and renders either a `MaterialIcons` icon or a text label.

### Roku ECP reference

- Keypress: `POST http://{ip}:8060/keypress/{key}`
- Text input: `POST http://{ip}:8060/keypress/Lit_{encodedChar}`
- Device info: `GET http://{ip}:8060/query/device-info` (returns XML)
- App list: `GET http://{ip}:8060/query/apps` (returns XML)
- Active app: `GET http://{ip}:8060/query/active-app`
- Launch app: `POST http://{ip}:8060/launch/{appId}`
- App icon: `GET http://{ip}:8060/query/icon/{appId}`

Network scan probes every IP in the local `/24` subnet in batches of 15 with a 2.5 s timeout per probe.
