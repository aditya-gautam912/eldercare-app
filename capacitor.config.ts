import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carecircle.app',
  appName: 'CareCircle',
  webDir: 'out',
  server: {
    url: 'https://eldercare-app-prod.vercel.app',
  },
};

export default config;
