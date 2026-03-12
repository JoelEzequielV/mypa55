//capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
appId: 'com.passwordmanager.app',
appName: 'SecureVault',
webDir: 'dist',
bundledWebRuntime: false
};

export default config;