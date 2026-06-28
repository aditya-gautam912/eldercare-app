import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carecircle.app',
  appName: 'CareCircle',
  webDir: 'out',
  server: {
    url: 'http://10.0.2.2:3001',
    cleartext: true,
  },
};

export default config;
