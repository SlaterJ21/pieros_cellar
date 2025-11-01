import AsyncStorage from '@react-native-async-storage/async-storage';

// Settings keys
export const SETTINGS_KEYS = {
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

// Default settings values
export const DEFAULT_SETTINGS = {
    defaultBottleSize: 'STANDARD',
    defaultWineType: 'RED',
    preferredCurrency: 'USD',
    showEmptyBottles: true,
    defaultSortOrder: 'Name',
    collectionViewStyle: 'List',
    showVintageInCard: true,
    showQuantityInCard: true,
    showValueInCard: true,
    peakDrinkingNotifications: false,
    lowQuantityNotifications: false,
    lowQuantityThreshold: 3,
};

// Mapping for display values to enum values
export const BOTTLE_SIZE_MAP: Record<string, string> = {
    'Standard (750ml)': 'STANDARD',
    'Magnum (1.5L)': 'MAGNUM',
    'Half (375ml)': 'HALF_BOTTLE',
};

export const WINE_TYPE_MAP: Record<string, string> = {
    'Red': 'RED',
    'White': 'WHITE',
    'Rosé': 'ROSE',
    'Sparkling': 'SPARKLING',
    'Dessert': 'DESSERT',
    'Fortified': 'FORTIFIED',
};

export const CURRENCY_MAP: Record<string, string> = {
    'USD ($)': 'USD',
    'EUR (€)': 'EUR',
    'GBP (£)': 'GBP',
    'AUD ($)': 'AUD',
    'CAD ($)': 'CAD',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': '$',
    'CAD': '$',
};

/**
 * Get a single setting value
 */
export const getSetting = async (key: keyof typeof SETTINGS_KEYS): Promise<any> => {
    try {
        // Map storage keys to default settings keys with proper camelCase
        const storageToDefaultsMap: Record<keyof typeof SETTINGS_KEYS, keyof typeof DEFAULT_SETTINGS> = {
            'DEFAULT_BOTTLE_SIZE': 'defaultBottleSize',
            'DEFAULT_WINE_TYPE': 'defaultWineType',
            'PREFERRED_CURRENCY': 'preferredCurrency',
            'SHOW_EMPTY_BOTTLES': 'showEmptyBottles',
            'DEFAULT_SORT_ORDER': 'defaultSortOrder',
            'COLLECTION_VIEW_STYLE': 'collectionViewStyle',
            'SHOW_VINTAGE_IN_CARD': 'showVintageInCard',
            'SHOW_QUANTITY_IN_CARD': 'showQuantityInCard',
            'SHOW_VALUE_IN_CARD': 'showValueInCard',
            'PEAK_DRINKING_NOTIFICATIONS': 'peakDrinkingNotifications',
            'LOW_QUANTITY_NOTIFICATIONS': 'lowQuantityNotifications',
            'LOW_QUANTITY_THRESHOLD': 'lowQuantityThreshold',
        };

        const value = await AsyncStorage.getItem(SETTINGS_KEYS[key]);
        if (value === null) {
            // Return default value
            const defaultKey = storageToDefaultsMap[key];
            return DEFAULT_SETTINGS[defaultKey];
        }

        // Parse boolean values
        if (value === 'true') return true;
        if (value === 'false') return false;

        // Parse numeric values
        if (!isNaN(Number(value))) return Number(value);

        return value;
    } catch (error) {
        console.error('Error getting setting:', error);
        const storageToDefaultsMap: Record<keyof typeof SETTINGS_KEYS, keyof typeof DEFAULT_SETTINGS> = {
            'DEFAULT_BOTTLE_SIZE': 'defaultBottleSize',
            'DEFAULT_WINE_TYPE': 'defaultWineType',
            'PREFERRED_CURRENCY': 'preferredCurrency',
            'SHOW_EMPTY_BOTTLES': 'showEmptyBottles',
            'DEFAULT_SORT_ORDER': 'defaultSortOrder',
            'COLLECTION_VIEW_STYLE': 'collectionViewStyle',
            'SHOW_VINTAGE_IN_CARD': 'showVintageInCard',
            'SHOW_QUANTITY_IN_CARD': 'showQuantityInCard',
            'SHOW_VALUE_IN_CARD': 'showValueInCard',
            'PEAK_DRINKING_NOTIFICATIONS': 'peakDrinkingNotifications',
            'LOW_QUANTITY_NOTIFICATIONS': 'lowQuantityNotifications',
            'LOW_QUANTITY_THRESHOLD': 'lowQuantityThreshold',
        };
        const defaultKey = storageToDefaultsMap[key];
        return DEFAULT_SETTINGS[defaultKey];
    }
};

/**
 * Get all settings as an object
 */
export const getAllSettings = async () => {
    try {
        // Map storage keys to settings keys with proper camelCase
        const storageToSettingsMap: Record<string, keyof typeof DEFAULT_SETTINGS> = {
            'DEFAULT_BOTTLE_SIZE': 'defaultBottleSize',
            'DEFAULT_WINE_TYPE': 'defaultWineType',
            'PREFERRED_CURRENCY': 'preferredCurrency',
            'SHOW_EMPTY_BOTTLES': 'showEmptyBottles',
            'DEFAULT_SORT_ORDER': 'defaultSortOrder',
            'COLLECTION_VIEW_STYLE': 'collectionViewStyle',
            'SHOW_VINTAGE_IN_CARD': 'showVintageInCard',
            'SHOW_QUANTITY_IN_CARD': 'showQuantityInCard',
            'SHOW_VALUE_IN_CARD': 'showValueInCard',
            'PEAK_DRINKING_NOTIFICATIONS': 'peakDrinkingNotifications',
            'LOW_QUANTITY_NOTIFICATIONS': 'lowQuantityNotifications',
            'LOW_QUANTITY_THRESHOLD': 'lowQuantityThreshold',
        };

        const settings: any = {};

        for (const [key, storageKey] of Object.entries(SETTINGS_KEYS)) {
            const value = await AsyncStorage.getItem(storageKey);
            const settingKey = storageToSettingsMap[key];

            if (!settingKey) {
                console.warn(`No mapping found for storage key: ${key}`);
                continue;
            }

            if (value !== null) {
                if (value === 'true' || value === 'false') {
                    settings[settingKey] = value === 'true';
                } else if (!isNaN(Number(value))) {
                    settings[settingKey] = Number(value);
                } else {
                    settings[settingKey] = value;
                }
            } else {
                settings[settingKey] = DEFAULT_SETTINGS[settingKey];
            }
        }

        return settings;
    } catch (error) {
        console.error('Error getting all settings:', error);
        return DEFAULT_SETTINGS;
    }
};

/**
 * Get the default bottle size enum value for wine creation
 */
export const getDefaultBottleSize = async (): Promise<string> => {
    const displayValue = await getSetting('DEFAULT_BOTTLE_SIZE');
    return BOTTLE_SIZE_MAP[displayValue] || 'STANDARD';
};

/**
 * Get the default wine type enum value for wine creation
 */
export const getDefaultWineType = async (): Promise<string> => {
    const displayValue = await getSetting('DEFAULT_WINE_TYPE');
    return WINE_TYPE_MAP[displayValue] || 'RED';
};

/**
 * Get the currency symbol based on preferred currency setting
 */
export const getCurrencySymbol = async (): Promise<string> => {
    const displayValue = await getSetting('PREFERRED_CURRENCY');
    const currency = CURRENCY_MAP[displayValue] || 'USD';
    return CURRENCY_SYMBOLS[currency];
};

/**
 * Format a price with the user's preferred currency
 */
export const formatPrice = async (price: number): Promise<string> => {
    const symbol = await getCurrencySymbol();
    return `${symbol}${price.toFixed(2)}`;
};

/**
 * Check if empty bottles should be shown
 */
export const shouldShowEmptyBottles = async (): Promise<boolean> => {
    return await getSetting('SHOW_EMPTY_BOTTLES');
};

/**
 * Get the sort comparator function based on user's sort preference
 */
export const getSortFunction = async () => {
    const sortOrder = await getSetting('DEFAULT_SORT_ORDER');

    switch (sortOrder) {
        case 'Name':
            return (a: any, b: any) => (a.name || '').localeCompare(b.name || '');

        case 'Vintage':
            return (a: any, b: any) => (b.vintage || 0) - (a.vintage || 0);

        case 'Value (High-Low)':
            return (a: any, b: any) => (b.currentValue || 0) - (a.currentValue || 0);

        case 'Value (Low-High)':
            return (a: any, b: any) => (a.currentValue || 0) - (b.currentValue || 0);

        case 'Quantity':
            return (a: any, b: any) => (b.quantity || 0) - (a.quantity || 0);

        default:
            return (a: any, b: any) => (a.name || '').localeCompare(b.name || '');
    }
};

/**
 * Check if a wine's quantity is below the low threshold
 */
export const isQuantityLow = async (quantity: number): Promise<boolean> => {
    const notificationsEnabled = await getSetting('LOW_QUANTITY_NOTIFICATIONS');
    if (!notificationsEnabled) return false;

    const threshold = await getSetting('LOW_QUANTITY_THRESHOLD');
    return quantity <= Number(threshold);
};

/**
 * Get collection view style preference
 */
export const getViewStyle = async (): Promise<'Grid' | 'List'> => {
    return await getSetting('COLLECTION_VIEW_STYLE');
};