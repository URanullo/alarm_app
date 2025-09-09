// Load environment variables from .env
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * This config mirrors your app.json and adds env-driven values.
 * Expo will read this file at build/dev time and inject values.
 */
module.exports = ({ config }) => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: apiKey,
      // Make it available at runtime via expo-constants
      eas: config.extra?.eas,
    },
    updates: config.updates,
    ios: config.ios,
    android: config.android,
    web: config.web,
    plugins: config.plugins,
    experiments: config.experiments,
    owner: config.owner,
    name: config.name,
    slug: config.slug,
    version: config.version,
    orientation: config.orientation,
    icon: config.icon,
    scheme: config.scheme,
    userInterfaceStyle: config.userInterfaceStyle,
    newArchEnabled: config.newArchEnabled,
  };
};
