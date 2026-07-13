import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carecircle.app',
  appName: 'CareCircle',
  webDir: 'out',
  server: {
    url: 'https://eldercare-app-dusky.vercel.app',
  },
};

export default config;
