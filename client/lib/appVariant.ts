import Constants from 'expo-constants';

export type AppVariant = 'rider' | 'driver';

export function getAppVariant(): AppVariant {
  const variant = Constants.expoConfig?.extra?.appVariant;
  return variant === 'driver' ? 'driver' : 'rider';
}

export function isDriverApp(): boolean {
  return getAppVariant() === 'driver';
}

export function isRiderApp(): boolean {
  return getAppVariant() === 'rider';
}
