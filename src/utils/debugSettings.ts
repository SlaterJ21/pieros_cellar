// Debug utility for testing settings
// You can run these in your app to verify settings are working correctly

import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
    DEFAULT_BOTTLE_SIZE: 'settings_default_bottle_size',
    DEFAULT_WINE_TYPE: 'settings_default_wine_type',
    PREFERRED_CURRENCY: 'settings_preferred_currency',
    SHOW_EMPTY_BOTTLES: 'settings_show_empty_bottles',
    DEFAULT_SORT_ORDER: 'settings_default_sort_order',
    COLLECTION_VIEW_STYLE: 'settings_collection_view_style',
    SHOW_VINTAGE_IN_CARD: 'settings_show_vintage_in_card',
    SHOW_QUANTITY_IN_CARD: 'settings_show_quantity_in_card',
    SHOW_VALUE_IN_CARD: 'settings_show_value_in_card',
    PEAK_DRINKING_NOTIFICATIONS: 'settings_peak_drinking_notifications',
    LOW_QUANTITY_NOTIFICATIONS: 'settings_low_quantity_notifications',
    LOW_QUANTITY_THRESHOLD: 'settings_low_quantity_threshold',
};

// Debug function to print all settings
export const debugPrintAllSettings = async () => {
    console.log('=== ALL SETTINGS ===');
    for (const [key, storageKey] of Object.entries(SETTINGS_KEYS)) {
        const value = await AsyncStorage.getItem(storageKey);
        console.log(`${key}: ${value}`);
    }
    console.log('===================');
};

// Debug function to clear all settings (for testing)
export const debugClearAllSettings = async () => {
    console.log('Clearing all settings...');
    await AsyncStorage.multiRemove(Object.values(SETTINGS_KEYS));
    console.log('All settings cleared!');
};

// Debug function to set test values
export const debugSetTestSettings = async () => {
    console.log('Setting test values...');
    await AsyncStorage.setItem(SETTINGS_KEYS.SHOW_EMPTY_BOTTLES, 'false');
    await AsyncStorage.setItem(SETTINGS_KEYS.DEFAULT_SORT_ORDER, 'Vintage');
    await AsyncStorage.setItem(SETTINGS_KEYS.COLLECTION_VIEW_STYLE, 'Grid');
    await AsyncStorage.setItem(SETTINGS_KEYS.SHOW_VINTAGE_IN_CARD, 'true');
    await AsyncStorage.setItem(SETTINGS_KEYS.SHOW_QUANTITY_IN_CARD, 'false');
    await AsyncStorage.setItem(SETTINGS_KEYS.SHOW_VALUE_IN_CARD, 'true');
    await AsyncStorage.setItem(SETTINGS_KEYS.LOW_QUANTITY_NOTIFICATIONS, 'true');
    await AsyncStorage.setItem(SETTINGS_KEYS.LOW_QUANTITY_THRESHOLD, '5');
    console.log('Test settings applied!');
};

// Usage in your app:
// import { debugPrintAllSettings, debugClearAllSettings, debugSetTestSettings } from './utils/debugSettings';
//
// In a component or screen:
// <Button onPress={debugPrintAllSettings}>Print Settings</Button>
// <Button onPress={debugClearAllSettings}>Clear Settings</Button>
// <Button onPress={debugSetTestSettings}>Set Test Settings</Button>