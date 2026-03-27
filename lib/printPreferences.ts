import AsyncStorage from '@react-native-async-storage/async-storage';

const PRINT_PREFERENCES_KEY = 'printPreferences';

export type PrintPreferences = {
  estimatedAmount: string;
  deliveryDate: string;
  deliveryAddress: string;
  pickupAddress: string;
  hasOwnItem: boolean;
};

const defaultPreferences: PrintPreferences = {
  estimatedAmount: '',
  deliveryDate: '',
  deliveryAddress: '',
  pickupAddress: '',
  hasOwnItem: false,
};

export const getPrintPreferences = async (): Promise<PrintPreferences> => {
  const raw = await AsyncStorage.getItem(PRINT_PREFERENCES_KEY);
  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
};

export const savePrintPreferences = async (preferences: PrintPreferences) => {
  await AsyncStorage.setItem(PRINT_PREFERENCES_KEY, JSON.stringify(preferences));
};
