import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.stillhours.app',
  appName: 'Still Hours',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    scheme: 'Still Hours',
    contentInset: 'automatic',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F6F2EC',
      showSpinner: false,
    },
  },
}

export default config
