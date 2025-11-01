import { useState, useEffect, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getAllSettings, getSetting, SETTINGS_KEYS } from '@/utils/settingsHelper';

// Simple event emitter for settings changes
let settingsListeners: Array<() => void> = [];

export const notifySettingsChanged = () => {
    settingsListeners.forEach(listener => listener());
};

const subscribeToSettingsChanges = (callback: () => void) => {
    settingsListeners.push(callback);
    return () => {
        settingsListeners = settingsListeners.filter(l => l !== callback);
    };
};

/**
 * Custom hook to access all settings
 * Re-loads settings when app comes to foreground or when notified
 */
export const useSettings = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            const allSettings = await getAllSettings();
            setSettings(allSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();

        // Reload settings when app comes to foreground
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                loadSettings();
            }
        });

        // Subscribe to manual settings change notifications
        const unsubscribe = subscribeToSettingsChanges(() => {
            loadSettings();
        });

        return () => {
            subscription.remove();
            unsubscribe();
        };
    }, []);

    return { settings, loading, refresh: loadSettings };
};

/**
 * Custom hook to access a specific setting
 */
export const useSetting = (key: keyof typeof SETTINGS_KEYS) => {
    const [value, setValue] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadSetting = async () => {
        try {
            const settingValue = await getSetting(key);
            setValue(settingValue);
        } catch (error) {
            console.error(`Error loading setting ${key}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSetting();

        // Reload when app comes to foreground
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                loadSetting();
            }
        });

        // Subscribe to manual settings change notifications
        const unsubscribe = subscribeToSettingsChanges(() => {
            loadSetting();
        });

        return () => {
            subscription.remove();
            unsubscribe();
        };
    }, [key]);

    return { value, loading, refresh: loadSetting };
};

/**
 * Hook specifically for currency formatting
 */
export const useCurrency = () => {
    const { value: currencyDisplay, loading } = useSetting('PREFERRED_CURRENCY');

    const currencyMap: Record<string, string> = {
        'USD ($)': '$',
        'EUR (€)': '€',
        'GBP (£)': '£',
        'AUD ($)': '$',
        'CAD ($)': '$',
    };

    const symbol = currencyMap[currencyDisplay] || '$';

    const formatPrice = (price: number) => {
        return `${symbol}${price.toFixed(2)}`;
    };

    return { symbol, formatPrice, loading };
};

/**
 * Hook for checking if empty bottles should be displayed
 */
export const useShowEmptyBottles = () => {
    const { value, loading } = useSetting('SHOW_EMPTY_BOTTLES');
    return { showEmpty: value === true, loading };
};

/**
 * Hook for getting sort preferences
 */
export const useSortPreference = () => {
    const { value, loading } = useSetting('DEFAULT_SORT_ORDER');

    const sortFunction = useMemo(() => {
        const sortOrder = value;

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
    }, [value]);

    return { sortOrder: value, sortFunction, loading };
};

/**
 * Hook for view style preference
 */
export const useViewStyle = () => {
    const { value, loading } = useSetting('COLLECTION_VIEW_STYLE');
    return { viewStyle: value as 'Grid' | 'List', loading };
};

/**
 * Hook for card display preferences
 */
export const useCardDisplayPreferences = () => {
    const { settings, loading } = useSettings();

    if (loading || !settings) {
        return {
            showVintage: true,
            showQuantity: true,
            showValue: true,
            loading: true,
        };
    }

    return {
        showVintage: settings.showVintageInCard === true,
        showQuantity: settings.showQuantityInCard === true,
        showValue: settings.showValueInCard === true,
        loading: false,
    };
};

/**
 * Hook for low quantity alert preferences
 */
export const useLowQuantityAlert = () => {
    const { settings, loading } = useSettings();

    const isQuantityLow = (quantity: number): boolean => {
        if (loading || !settings) return false;
        if (!settings.lowQuantityNotifications) return false;

        const threshold = Number(settings.lowQuantityThreshold) || 3;
        return quantity <= threshold;
    };

    return {
        enabled: settings?.lowQuantityNotifications || false,
        threshold: Number(settings?.lowQuantityThreshold) || 3,
        isQuantityLow,
        loading,
    };
};

/**
 * Hook for default values when adding new wines
 */
export const useDefaultWineValues = () => {
    const { settings, loading } = useSettings();

    if (loading || !settings) {
        return {
            bottleSize: 'STANDARD',
            wineType: 'RED',
            loading: true,
        };
    }

    const bottleSizeMap: Record<string, string> = {
        'Standard (750ml)': 'STANDARD',
        'Magnum (1.5L)': 'MAGNUM',
        'Half (375ml)': 'HALF_BOTTLE',
    };

    const wineTypeMap: Record<string, string> = {
        'Red': 'RED',
        'White': 'WHITE',
        'Rosé': 'ROSE',
        'Sparkling': 'SPARKLING',
        'Dessert': 'DESSERT',
        'Fortified': 'FORTIFIED',
    };

    return {
        bottleSize: bottleSizeMap[settings.defaultBottleSize] || 'STANDARD',
        wineType: wineTypeMap[settings.defaultWineType] || 'RED',
        loading: false,
    };
};