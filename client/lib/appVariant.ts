import Constants from 'expo-constants';

export type AppVariant = 'rider' | 'driver';

// Set to 'driver' to test Driver app, 'rider' for Rider app
const DEV_OVERRIDE: AppVariant | null = 'driver';

export function getAppVariant(): AppVariant {
  if (__DEV__ && DEV_OVERRIDE) {
    return DEV_OVERRIDE;
  }
  const variant = Constants.expoConfig?.extra?.appVariant;
  return variant === 'driver' ? 'driver' : 'rider';
}

export function isDriverApp(): boolean {
  return getAppVariant() === 'driver';
}

export function isRiderApp(): boolean {
  return getAppVariant() === 'rider';
}
