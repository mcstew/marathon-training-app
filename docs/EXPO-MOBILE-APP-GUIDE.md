# Building Mobile Apps with Expo + React Native

A practical guide based on building the Marathon Training Plan app. Reference for future projects.

---

## Quick Start Checklist

```bash
# 1. Create new Expo project
npx create-expo-app@latest my-app --template blank-typescript

# 2. Install common dependencies
cd my-app
npx expo install zustand @react-native-async-storage/async-storage date-fns
npx expo install @react-native-community/datetimepicker  # if needed

# 3. Start development server
npx expo start

# 4. Test on device
# - Install "Expo Go" on iPhone from App Store
# - Scan QR code with iPhone Camera app (not Expo Go app)
# - Or enter URL manually in Expo Go: exp://YOUR_IP:8081
```

---

## Project Structure (Recommended)

```
my-app/
├── App.tsx                 # Main entry point
├── index.ts                # Expo entry (don't modify)
├── app.json                # Expo configuration
├── package.json
├── tsconfig.json
│
├── src/
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/          # Colors, theme, config
│   │   ├── theme.ts
│   │   └── config.ts
│   ├── services/           # Business logic, API calls
│   │   └── myService.ts
│   ├── store/              # State management (Zustand)
│   │   └── useAppStore.ts
│   ├── screens/            # Full screen components
│   │   ├── HomeScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   └── hooks/              # Custom React hooks
│       └── useMyHook.ts
│
├── assets/                 # Images, fonts
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
│
└── reference/              # Reference code (excluded from build)
```

---

## Key Configuration Files

### app.json
```json
{
  "expo": {
    "name": "My App Name",
    "slug": "my-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.myapp"
    },
    "plugins": [
      "expo-asset",
      "expo-font"
    ]
  }
}
```

### tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "reference"]
}
```

### package.json scripts
```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "web": "expo start --web",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Running on Physical iPhone

### Method 1: QR Code (Preferred)

1. Install **Expo Go** from App Store on iPhone
2. Run `npx expo start` in terminal (needs interactive terminal for QR code)
3. Scan QR code with **iPhone Camera app** (not Expo Go)
4. It will prompt to open in Expo Go

### Method 2: Manual URL Entry

1. Get your Mac's IP: `ipconfig getifaddr en0`
2. Run `npx expo start --offline` (or regular start)
3. In Expo Go, tap "Enter URL manually"
4. Enter: `exp://YOUR_IP:8081`

### Method 3: Tunnel (When LAN doesn't work)

```bash
npx expo start --tunnel
```
Requires `@expo/ngrok` package. Slower but works across networks.

### Common Issues

| Issue | Solution |
|-------|----------|
| "Project is incompatible with this version of Expo Go" | Upgrade SDK: `npx expo install expo@^54.0.0 --fix` |
| SDK version mismatch | Make sure project SDK matches Expo Go version |
| QR code not showing | Run command in interactive Terminal.app, not via script |
| "Port 8081 in use" | Kill process: `lsof -ti:8081 \| xargs kill -9` |
| Network fetch errors | Use `--offline` flag: `npx expo start --offline` |
| Expo Go can't connect | Ensure phone and Mac on same WiFi network |

---

## SDK Version Management

**CRITICAL:** Expo Go app version must match your project SDK version.

```bash
# Check current SDK
cat package.json | grep '"expo"'

# Upgrade to latest SDK (e.g., 54)
npx expo install expo@^54.0.0 --fix

# If dependency conflicts occur:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

As of January 2025:
- Expo Go on App Store: **SDK 54**
- Use `expo@^54.0.0` in your project

---

## State Management with Zustand + AsyncStorage

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  // State
  user: string | null;
  settings: { theme: 'light' | 'dark' };

  // Actions
  setUser: (user: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      settings: { theme: 'light' },

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ settings: { ...get().settings, theme } }),
      reset: () => set({ user: null, settings: { theme: 'light' } }),
    }),
    {
      name: 'my-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Usage in components:
// const user = useAppStore(state => state.user);
// const setUser = useAppStore(state => state.setUser);
```

---

## Common Patterns

### Tab Navigation (Manual)

```typescript
// src/components/TabBar.tsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabName = 'home' | 'settings';

interface TabBarProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export function TabBar({ currentTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onTabChange('home')}>
        <Ionicons
          name={currentTab === 'home' ? 'home' : 'home-outline'}
          size={24}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onTabChange('settings')}>
        <Ionicons
          name={currentTab === 'settings' ? 'settings' : 'settings-outline'}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
}
```

### Bottom Sheet Modal

```typescript
import { Modal, View, TouchableWithoutFeedback } from 'react-native';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
```

### Safe Area Handling

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// In App.tsx:
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Your app content */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
```

---

## Useful Dependencies

```bash
# Core
npx expo install expo-status-bar
npx expo install react-native-safe-area-context

# State & Storage
npm install zustand
npx expo install @react-native-async-storage/async-storage

# Date handling
npm install date-fns

# Icons (included with Expo)
# import { Ionicons } from '@expo/vector-icons';

# Date picker
npx expo install @react-native-community/datetimepicker

# Future: Notifications
npx expo install expo-notifications

# Future: Calendar access
npx expo install expo-calendar
```

---

## Debugging Tips

```bash
# Check what's running on port 8081
lsof -i:8081

# Kill all Expo processes
pkill -f "expo"

# Clear Metro bundler cache
npx expo start --clear

# Type check without running
npx tsc --noEmit

# Check Expo account status
npx expo whoami

# Get device IP (Mac)
ipconfig getifaddr en0
```

---

## Deployment Prep (Future Reference)

### For App Store via EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
npx expo login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### For Replit iOS Integration

Replit has built-in Expo support. Just import the project and use their mobile preview.

---

## Files to Exclude from Git

```gitignore
# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native builds
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# macOS
.DS_Store

# Environment
.env*.local
.env

# TypeScript
*.tsbuildinfo
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Create project | `npx create-expo-app@latest my-app --template blank-typescript` |
| Start dev server | `npx expo start` |
| Start with tunnel | `npx expo start --tunnel` |
| Start offline | `npx expo start --offline` |
| Upgrade SDK | `npx expo install expo@^54.0.0 --fix` |
| Install package | `npx expo install package-name` |
| Type check | `npx tsc --noEmit` |
| Clear cache | `npx expo start --clear` |
| Get Mac IP | `ipconfig getifaddr en0` |
| Kill port 8081 | `lsof -ti:8081 \| xargs kill -9` |

---

## Project Examples

- **Marathon Training App**: `/Users/michael/Desktop/Claude Code/marathon-training-app/`
  - Full app with onboarding, tabs, state management, persistence
  - 6 training plans with generator
  - Workout tracking and stats

---

*Last updated: January 2025*
*Expo SDK: 54*
