import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    Linking,
    Share,
} from 'react-native';
import {
    List,
    Switch,
    Divider,
    Text,
    Button,
    Menu,
    ActivityIndicator,
    Portal,
    Dialog,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@apollo/client/react';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { GET_WINES } from '@/graphql/queries/wines';
import { GET_WINERIES } from '@/graphql/queries/wineries';
import { GET_VARIETALS } from '@/graphql/queries/varietals';
import {
    IMPORT_WINERIES,
    IMPORT_VARIETALS,
    IMPORT_WINES,
    IMPORT_COMPLETE_COLLECTION
} from '@/graphql/mutations/import';
import { useFocusEffect } from '@react-navigation/native';
import { notifySettingsChanged } from '@/hooks/useSettings';

// Settings keys for AsyncStorage
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

// Options for various settings
const BOTTLE_SIZES = ['Standard (750ml)', 'Magnum (1.5L)', 'Half (375ml)'];
const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'];
const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'AUD ($)', 'CAD ($)'];
const SORT_OPTIONS = ['Name', 'Vintage', 'Value (High-Low)', 'Value (Low-High)', 'Quantity'];
const VIEW_STYLES = ['Grid', 'List'];

interface Settings {
    defaultBottleSize: string;
    defaultWineType: string;
    preferredCurrency: string;
    showEmptyBottles: boolean;
    defaultSortOrder: string;
    collectionViewStyle: string;
    showVintageInCard: boolean;
    showQuantityInCard: boolean;
    showValueInCard: boolean;
    peakDrinkingNotifications: boolean;
    lowQuantityNotifications: boolean;
    lowQuantityThreshold: string;
}

const SettingsScreen = () => {
    const [settings, setSettings] = useState<Settings>({
        defaultBottleSize: 'Standard (750ml)',
        defaultWineType: 'Red',
        preferredCurrency: 'USD ($)',
        showEmptyBottles: true,
        defaultSortOrder: 'Name',
        collectionViewStyle: 'List',
        showVintageInCard: true,
        showQuantityInCard: true,
        showValueInCard: true,
        peakDrinkingNotifications: false,
        lowQuantityNotifications: false,
        lowQuantityThreshold: '3',
    });

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    // Menu states
    const [bottleSizeMenuVisible, setBottleSizeMenuVisible] = useState(false);
    const [wineTypeMenuVisible, setWineTypeMenuVisible] = useState(false);
    const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [viewStyleMenuVisible, setViewStyleMenuVisible] = useState(false);
    const [thresholdMenuVisible, setThresholdMenuVisible] = useState(false);

    // Dialog states
    const [resetDialogVisible, setResetDialogVisible] = useState(false);
    const [aboutDialogVisible, setAboutDialogVisible] = useState(false);

    // Fetch all data for export
    const { data: winesData, refetch: refetchWines } = useQuery(GET_WINES, {
        variables: { take: 10000, skip: 0 },
        fetchPolicy: 'network-only',
    });

    const { data: wineriesData, refetch: refetchWineries } = useQuery(GET_WINERIES, {
        fetchPolicy: 'network-only',
    });

    const { data: varietalsData, refetch: refetchVarietals } = useQuery(GET_VARIETALS, {
        fetchPolicy: 'network-only',
    });

    // Import mutations
    const [importWineriesMutation] = useMutation(IMPORT_WINERIES);
    const [importVarietalsMutation] = useMutation(IMPORT_VARIETALS);
    const [importWinesMutation] = useMutation(IMPORT_WINES);
    const [importCompleteMutation] = useMutation(IMPORT_COMPLETE_COLLECTION);

    // Helper function to fetch ALL wines in batches
    const fetchAllWines = async () => {
        const allWines: any[] = [];
        let skip = 0;
        const batchSize = 1000;
        let hasMore = true;

        try {
            while (hasMore) {
                const result = await refetchWines({ take: batchSize, skip });

                if (result.data?.wines && result.data.wines.length > 0) {
                    allWines.push(...result.data.wines);
                    skip += batchSize;

                    if (result.data.wines.length < batchSize) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            }

            return allWines;
        } catch (error) {
            console.error('Error fetching all wines:', error);
            return winesData?.wines || [];
        }
    };

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Reload settings when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadSettings();
        }, [])
    );

    const loadSettings = async () => {
        try {
            const storageToSettingsMap: Record<keyof typeof SETTINGS_KEYS, keyof Settings> = {
                DEFAULT_BOTTLE_SIZE: 'defaultBottleSize',
                DEFAULT_WINE_TYPE: 'defaultWineType',
                PREFERRED_CURRENCY: 'preferredCurrency',
                SHOW_EMPTY_BOTTLES: 'showEmptyBottles',
                DEFAULT_SORT_ORDER: 'defaultSortOrder',
                COLLECTION_VIEW_STYLE: 'collectionViewStyle',
                SHOW_VINTAGE_IN_CARD: 'showVintageInCard',
                SHOW_QUANTITY_IN_CARD: 'showQuantityInCard',
                SHOW_VALUE_IN_CARD: 'showValueInCard',
                PEAK_DRINKING_NOTIFICATIONS: 'peakDrinkingNotifications',
                LOW_QUANTITY_NOTIFICATIONS: 'lowQuantityNotifications',
                LOW_QUANTITY_THRESHOLD: 'lowQuantityThreshold',
            };

            const loadedSettings: Partial<Settings> = {};

            for (const [key, storageKey] of Object.entries(SETTINGS_KEYS)) {
                const value = await AsyncStorage.getItem(storageKey);
                if (value !== null) {
                    const settingKey = storageToSettingsMap[key as keyof typeof SETTINGS_KEYS];
                    if (value === 'true' || value === 'false') {
                        loadedSettings[settingKey] = value === 'true';
                    } else {
                        loadedSettings[settingKey] = value;
                    }
                }
            }

            setSettings(prev => ({ ...prev, ...loadedSettings }));
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async (key: keyof typeof SETTINGS_KEYS, value: string | boolean) => {
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS[key], String(value));
            notifySettingsChanged();
        } catch (error) {
            console.error('Error saving setting:', error);
            Alert.alert('Error', 'Failed to save setting');
        }
    };

    const updateSetting = (key: keyof Settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        const storageKeyMap: Record<string, keyof typeof SETTINGS_KEYS> = {
            defaultBottleSize: 'DEFAULT_BOTTLE_SIZE',
            defaultWineType: 'DEFAULT_WINE_TYPE',
            preferredCurrency: 'PREFERRED_CURRENCY',
            showEmptyBottles: 'SHOW_EMPTY_BOTTLES',
            defaultSortOrder: 'DEFAULT_SORT_ORDER',
            collectionViewStyle: 'COLLECTION_VIEW_STYLE',
            showVintageInCard: 'SHOW_VINTAGE_IN_CARD',
            showQuantityInCard: 'SHOW_QUANTITY_IN_CARD',
            showValueInCard: 'SHOW_VALUE_IN_CARD',
            peakDrinkingNotifications: 'PEAK_DRINKING_NOTIFICATIONS',
            lowQuantityNotifications: 'LOW_QUANTITY_NOTIFICATIONS',
            lowQuantityThreshold: 'LOW_QUANTITY_THRESHOLD',
        };

        const storageKey = storageKeyMap[key];
        if (storageKey) {
            saveSetting(storageKey, value);
        }
    };

    const exportData = async () => {
        setExporting(true);
        try {
            Alert.alert('Preparing Export', 'Fetching all data from your collection...');

            // Fetch all data
            const allWines = await fetchAllWines();
            await refetchWineries();
            await refetchVarietals();

            const wineries = wineriesData?.wineries || [];
            const varietals = varietalsData?.varietals || [];

            if (allWines.length === 0 && wineries.length === 0 && varietals.length === 0) {
                Alert.alert('No Data', 'No data found to export');
                setExporting(false);
                return;
            }

            // Clean and structure the export data
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0',
                summary: {
                    totalWines: allWines.length,
                    totalWineries: wineries.length,
                    totalVarietals: varietals.length,
                },
                wines: allWines.map(wine => ({
                    id: wine.id,
                    name: wine.name,
                    vintage: wine.vintage,
                    wineryId: wine.wineryId,
                    wineryName: wine.winery?.name,
                    varietalId: wine.varietalId,
                    varietalName: wine.varietal?.name,
                    region: wine.region,
                    subRegion: wine.subRegion,
                    country: wine.country,
                    appellation: wine.appellation,
                    type: wine.type,
                    sweetness: wine.sweetness,
                    quantity: wine.quantity,
                    bottleSize: wine.bottleSize,
                    purchaseDate: wine.purchaseDate,
                    purchasePrice: wine.purchasePrice,
                    purchaseLocation: wine.purchaseLocation,
                    retailer: wine.retailer,
                    location: wine.location,
                    binNumber: wine.binNumber,
                    rackNumber: wine.rackNumber,
                    cellarZone: wine.cellarZone,
                    drinkFrom: wine.drinkFrom,
                    drinkTo: wine.drinkTo,
                    peakDrinking: wine.peakDrinking,
                    personalRating: wine.personalRating,
                    criticsRating: wine.criticsRating,
                    criticName: wine.criticName,
                    personalNotes: wine.personalNotes,
                    tastingNotes: wine.tastingNotes,
                    currentValue: wine.currentValue,
                    estimatedValue: wine.estimatedValue,
                    status: wine.status,
                    tags: wine.tags?.map((tag: any) => tag.name),
                    createdAt: wine.createdAt,
                    updatedAt: wine.updatedAt,
                })),
                wineries: wineries.map((winery: any) => ({
                    id: winery.id,
                    name: winery.name,
                    region: winery.region,
                    country: winery.country,
                    website: winery.website,
                    description: winery.description,
                    email: winery.email,
                    phone: winery.phone,
                    foundedYear: winery.foundedYear,
                    logo: winery.logo,
                    createdAt: winery.createdAt,
                    updatedAt: winery.updatedAt,
                })),
                varietals: varietals.map((varietal: any) => ({
                    id: varietal.id,
                    name: varietal.name,
                    type: varietal.type,
                    description: varietal.description,
                    commonRegions: varietal.commonRegions,
                    characteristics: varietal.characteristics,
                    aliases: varietal.aliases,
                    createdAt: varietal.createdAt,
                    updatedAt: varietal.updatedAt,
                })),
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `wine_cellar_complete_export_${new Date().toISOString().split('T')[0]}.json`;

            const file = new File(Paths.cache, fileName);
            await file.write(jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: `Export Complete Collection (${allWines.length} wines, ${wineries.length} wineries, ${varietals.length} varietals)`,
                });
            } else {
                Alert.alert(
                    'Success',
                    `Exported:\n${allWines.length} wines\n${wineries.length} wineries\n${varietals.length} varietals`
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const exportWineriesOnly = async () => {
        setExporting(true);
        try {
            await refetchWineries();
            const wineries = wineriesData?.wineries || [];

            if (wineries.length === 0) {
                Alert.alert('No Data', 'No wineries found to export');
                setExporting(false);
                return;
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0',
                type: 'wineries',
                wineries: wineries.map((winery: any) => ({
                    name: winery.name,
                    region: winery.region,
                    country: winery.country,
                    website: winery.website,
                    description: winery.description,
                    email: winery.email,
                    phone: winery.phone,
                    foundedYear: winery.foundedYear,
                    logo: winery.logo,
                })),
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `wineries_export_${new Date().toISOString().split('T')[0]}.json`;

            const file = new File(Paths.cache, fileName);
            await file.write(jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: `Export Wineries (${wineries.length})`,
                });
            } else {
                Alert.alert('Success', `Exported ${wineries.length} wineries`);
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export wineries');
        } finally {
            setExporting(false);
        }
    };

    const exportVarietalsOnly = async () => {
        setExporting(true);
        try {
            await refetchVarietals();
            const varietals = varietalsData?.varietals || [];

            if (varietals.length === 0) {
                Alert.alert('No Data', 'No varietals found to export');
                setExporting(false);
                return;
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0',
                type: 'varietals',
                varietals: varietals.map((varietal: any) => ({
                    name: varietal.name,
                    type: varietal.type,
                    description: varietal.description,
                    commonRegions: varietal.commonRegions,
                    characteristics: varietal.characteristics,
                    aliases: varietal.aliases,
                })),
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `varietals_export_${new Date().toISOString().split('T')[0]}.json`;

            const file = new File(Paths.cache, fileName);
            await file.write(jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: `Export Varietals (${varietals.length})`,
                });
            } else {
                Alert.alert('Success', `Exported ${varietals.length} varietals`);
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export varietals');
        } finally {
            setExporting(false);
        }
    };

    const exportWinesOnly = async () => {
        setExporting(true);
        try {
            const allWines = await fetchAllWines();

            if (allWines.length === 0) {
                Alert.alert('No Data', 'No wines found to export');
                setExporting(false);
                return;
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0',
                type: 'wines',
                wines: allWines.map((wine: any) => ({
                    name: wine.name,
                    wineryName: wine.winery?.name,
                    varietalName: wine.varietal?.name,
                    vintage: wine.vintage,
                    region: wine.region,
                    subRegion: wine.subRegion,
                    country: wine.country,
                    appellation: wine.appellation,
                    type: wine.type,
                    sweetness: wine.sweetness,
                    quantity: wine.quantity,
                    bottleSize: wine.bottleSize,
                    purchaseDate: wine.purchaseDate,
                    purchasePrice: wine.purchasePrice,
                    purchaseLocation: wine.purchaseLocation,
                    retailer: wine.retailer,
                    location: wine.location,
                    binNumber: wine.binNumber,
                    rackNumber: wine.rackNumber,
                    cellarZone: wine.cellarZone,
                    drinkFrom: wine.drinkFrom,
                    drinkTo: wine.drinkTo,
                    peakDrinking: wine.peakDrinking,
                    personalRating: wine.personalRating,
                    criticsRating: wine.criticsRating,
                    criticName: wine.criticName,
                    personalNotes: wine.personalNotes,
                    tastingNotes: wine.tastingNotes,
                    currentValue: wine.currentValue,
                    estimatedValue: wine.estimatedValue,
                    status: wine.status,
                    tags: wine.tags?.map((tag: any) => tag.name),
                })),
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `wines_export_${new Date().toISOString().split('T')[0]}.json`;

            const file = new File(Paths.cache, fileName);
            await file.write(jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: `Export Wines (${allWines.length})`,
                });
            } else {
                Alert.alert('Success', `Exported ${allWines.length} wines`);
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export wines');
        } finally {
            setExporting(false);
        }
    };

    const exportCSV = async () => {
        setExporting(true);
        try {
            Alert.alert('Preparing Export', 'Fetching all wines from your collection...');

            const allWines = await fetchAllWines();

            if (allWines.length === 0) {
                Alert.alert('No Data', 'No wines found to export');
                setExporting(false);
                return;
            }

            // Comprehensive CSV Headers
            const headers = [
                'Name',
                'Vintage',
                'Varietal',
                'Type',
                'Sweetness',
                'Winery',
                'Region',
                'Sub Region',
                'Country',
                'Appellation',
                'Quantity',
                'Bottle Size',
                'Purchase Date',
                'Purchase Price',
                'Purchase Location',
                'Retailer',
                'Current Value',
                'Estimated Value',
                'Location',
                'Bin Number',
                'Rack Number',
                'Cellar Zone',
                'Drink From',
                'Drink To',
                'Peak Drinking',
                'Personal Rating',
                'Critics Rating',
                'Critic Name',
                'Personal Notes',
                'Tasting Notes',
                'Status',
                'Tags',
            ].join(',');

            // CSV Rows with all fields
            const rows = allWines.map((wine: any) => {
                const escapeCsv = (value: any) => {
                    if (value === null || value === undefined) return '';
                    const str = String(value);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                return [
                    escapeCsv(wine.name),
                    escapeCsv(wine.vintage),
                    escapeCsv(wine.varietal?.name),
                    escapeCsv(wine.type),
                    escapeCsv(wine.sweetness),
                    escapeCsv(wine.winery?.name),
                    escapeCsv(wine.region),
                    escapeCsv(wine.subRegion),
                    escapeCsv(wine.country),
                    escapeCsv(wine.appellation),
                    escapeCsv(wine.quantity),
                    escapeCsv(wine.bottleSize),
                    escapeCsv(wine.purchaseDate),
                    escapeCsv(wine.purchasePrice),
                    escapeCsv(wine.purchaseLocation),
                    escapeCsv(wine.retailer),
                    escapeCsv(wine.currentValue),
                    escapeCsv(wine.estimatedValue),
                    escapeCsv(wine.location),
                    escapeCsv(wine.binNumber),
                    escapeCsv(wine.rackNumber),
                    escapeCsv(wine.cellarZone),
                    escapeCsv(wine.drinkFrom),
                    escapeCsv(wine.drinkTo),
                    escapeCsv(wine.peakDrinking),
                    escapeCsv(wine.personalRating),
                    escapeCsv(wine.criticsRating),
                    escapeCsv(wine.criticName),
                    escapeCsv(wine.personalNotes),
                    escapeCsv(wine.tastingNotes),
                    escapeCsv(wine.status),
                    escapeCsv(wine.tags?.map((t: any) => t.name).join('; ')),
                ].join(',');
            });

            const csvString = [headers, ...rows].join('\n');
            const fileName = `wine_cellar_export_${new Date().toISOString().split('T')[0]}.csv`;

            const file = new File(Paths.cache, fileName);
            await file.write(csvString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'text/csv',
                    dialogTitle: `Export Wine Collection (${allWines.length} wines)`,
                });
            } else {
                Alert.alert('Success', `Exported ${allWines.length} wines to ${fileName}`);
            }
        } catch (error) {
            console.error('CSV export error:', error);
            Alert.alert('Error', 'Failed to export CSV');
        } finally {
            setExporting(false);
        }
    };

    const importWineries = async () => {
        setImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;
                const file = new File(fileUri);
                const fileContent = await file.text();
                const importedData = JSON.parse(fileContent);

                const wineries = importedData.wineries || [];
                if (wineries.length === 0) {
                    Alert.alert('No Data', 'No wineries found in file');
                    setImporting(false);
                    return;
                }

                Alert.alert(
                    'Confirm Import',
                    `Import ${wineries.length} wineries? Existing wineries with the same name will be updated.`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setImporting(false) },
                        {
                            text: 'Import',
                            onPress: async () => {
                                try {
                                    const response = await importWineriesMutation({
                                        variables: { wineries },
                                    });

                                    const result = response.data.importWineries;
                                    await refetchWineries();

                                    Alert.alert(
                                        'Import Complete',
                                        `Imported: ${result.imported}\nUpdated: ${result.skipped}\nErrors: ${result.errors.length}${result.errors.length > 0 ? '\n\n' + result.errors.join('\n') : ''}`
                                    );
                                } catch (error: any) {
                                    console.error('Import error:', error);
                                    Alert.alert('Import Failed', error.message);
                                } finally {
                                    setImporting(false);
                                }
                            },
                        },
                    ]
                );
            } else {
                setImporting(false);
            }
        } catch (error) {
            console.error('Import error:', error);
            Alert.alert('Error', 'Failed to read import file');
            setImporting(false);
        }
    };

    const importVarietals = async () => {
        setImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;
                const file = new File(fileUri);
                const fileContent = await file.text();
                const importedData = JSON.parse(fileContent);

                const varietals = importedData.varietals || [];
                if (varietals.length === 0) {
                    Alert.alert('No Data', 'No varietals found in file');
                    setImporting(false);
                    return;
                }

                Alert.alert(
                    'Confirm Import',
                    `Import ${varietals.length} varietals? Existing varietals with the same name will be updated.`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setImporting(false) },
                        {
                            text: 'Import',
                            onPress: async () => {
                                try {
                                    const response = await importVarietalsMutation({
                                        variables: { varietals },
                                    });

                                    const result = response.data.importVarietals;
                                    await refetchVarietals();

                                    Alert.alert(
                                        'Import Complete',
                                        `Imported: ${result.imported}\nUpdated: ${result.skipped}\nErrors: ${result.errors.length}${result.errors.length > 0 ? '\n\n' + result.errors.join('\n') : ''}`
                                    );
                                } catch (error: any) {
                                    console.error('Import error:', error);
                                    Alert.alert('Import Failed', error.message);
                                } finally {
                                    setImporting(false);
                                }
                            },
                        },
                    ]
                );
            } else {
                setImporting(false);
            }
        } catch (error) {
            console.error('Import error:', error);
            Alert.alert('Error', 'Failed to read import file');
            setImporting(false);
        }
    };

    const importWines = async () => {
        setImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;
                const file = new File(fileUri);
                const fileContent = await file.text();
                const importedData = JSON.parse(fileContent);

                const wines = importedData.wines || [];
                if (wines.length === 0) {
                    Alert.alert('No Data', 'No wines found in file');
                    setImporting(false);
                    return;
                }

                Alert.alert(
                    'Confirm Import',
                    `Import ${wines.length} wines? Wineries and varietals will be created if they don't exist.`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setImporting(false) },
                        {
                            text: 'Import',
                            onPress: async () => {
                                try {
                                    const response = await importWinesMutation({
                                        variables: { wines },
                                    });

                                    const result = response.data.importWines;
                                    await refetchWines();
                                    await refetchWineries();
                                    await refetchVarietals();

                                    Alert.alert(
                                        'Import Complete',
                                        `Imported: ${result.imported}\nErrors: ${result.errors.length}${result.errors.length > 0 ? '\n\n' + result.errors.slice(0, 5).join('\n') + (result.errors.length > 5 ? `\n...and ${result.errors.length - 5} more` : '') : ''}`
                                    );
                                } catch (error: any) {
                                    console.error('Import error:', error);
                                    Alert.alert('Import Failed', error.message);
                                } finally {
                                    setImporting(false);
                                }
                            },
                        },
                    ]
                );
            } else {
                setImporting(false);
            }
        } catch (error) {
            console.error('Import error:', error);
            Alert.alert('Error', 'Failed to read import file');
            setImporting(false);
        }
    };

    const importCompleteCollection = async () => {
        setImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;
                const file = new File(fileUri);
                const fileContent = await file.text();
                const importedData = JSON.parse(fileContent);

                const wineries = importedData.wineries || [];
                const varietals = importedData.varietals || [];
                const wines = importedData.wines || [];

                if (wineries.length === 0 && varietals.length === 0 && wines.length === 0) {
                    Alert.alert('No Data', 'No data found in file');
                    setImporting(false);
                    return;
                }

                Alert.alert(
                    'Confirm Import',
                    `Import complete collection?\n\n• ${wineries.length} wineries\n• ${varietals.length} varietals\n• ${wines.length} wines\n\nThis may take a few moments...`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setImporting(false) },
                        {
                            text: 'Import',
                            onPress: async () => {
                                try {
                                    const response = await importCompleteMutation({
                                        variables: {
                                            input: { wineries, varietals, wines },
                                        },
                                    });

                                    const result = response.data.importCompleteCollection;
                                    await refetchWines();
                                    await refetchWineries();
                                    await refetchVarietals();

                                    const totalErrors =
                                        result.wineries.errors.length +
                                        result.varietals.errors.length +
                                        result.wines.errors.length;

                                    Alert.alert(
                                        'Import Complete',
                                        `Wineries: ${result.wineries.imported} imported, ${result.wineries.skipped} updated\n` +
                                        `Varietals: ${result.varietals.imported} imported, ${result.varietals.skipped} updated\n` +
                                        `Wines: ${result.wines.imported} imported\n` +
                                        `Total Errors: ${totalErrors}`
                                    );
                                } catch (error: any) {
                                    console.error('Import error:', error);
                                    Alert.alert('Import Failed', error.message);
                                } finally {
                                    setImporting(false);
                                }
                            },
                        },
                    ]
                );
            } else {
                setImporting(false);
            }
        } catch (error) {
            console.error('Import error:', error);
            Alert.alert('Error', 'Failed to read import file');
            setImporting(false);
        }
    };

    const resetSettings = async () => {
        try {
            await AsyncStorage.multiRemove(Object.values(SETTINGS_KEYS));
            setSettings({
                defaultBottleSize: 'Standard (750ml)',
                defaultWineType: 'Red',
                preferredCurrency: 'USD ($)',
                showEmptyBottles: true,
                defaultSortOrder: 'Name',
                collectionViewStyle: 'List',
                showVintageInCard: true,
                showQuantityInCard: true,
                showValueInCard: true,
                peakDrinkingNotifications: false,
                lowQuantityNotifications: false,
                lowQuantityThreshold: '3',
            });
            setResetDialogVisible(false);
            notifySettingsChanged();
            Alert.alert('Success', 'Settings have been reset to defaults');
        } catch (error) {
            console.error('Reset error:', error);
            Alert.alert('Error', 'Failed to reset settings');
        }
    };

    const shareApp = async () => {
        try {
            await Share.share({
                message: 'Check out this amazing Wine Cellar Management app!',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const openURL = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', `Cannot open URL: ${url}`);
            }
        } catch (error) {
            console.error('URL error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B2E2E" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Collection Preferences */}
            <List.Section>
                <List.Subheader style={styles.sectionHeader}>Collection Preferences</List.Subheader>

                <Menu
                    visible={bottleSizeMenuVisible}
                    onDismiss={() => setBottleSizeMenuVisible(false)}
                    anchor={
                        <List.Item
                            title="Default Bottle Size"
                            description={settings.defaultBottleSize}
                            left={props => <List.Icon {...props} icon="bottle-wine" />}
                            right={props => <List.Icon {...props} icon="chevron-down" />}
                            onPress={() => setBottleSizeMenuVisible(true)}
                        />
                    }>
                    {BOTTLE_SIZES.map((size) => (
                        <Menu.Item
                            key={size}
                            onPress={() => {
                                updateSetting('defaultBottleSize', size);
                                setBottleSizeMenuVisible(false);
                            }}
                            title={size}
                        />
                    ))}
                </Menu>

                <Menu
                    visible={wineTypeMenuVisible}
                    onDismiss={() => setWineTypeMenuVisible(false)}
                    anchor={
                        <List.Item
                            title="Default Wine Type"
                            description={settings.defaultWineType}
                            left={props => <List.Icon {...props} icon="glass-wine" />}
                            right={props => <List.Icon {...props} icon="chevron-down" />}
                            onPress={() => setWineTypeMenuVisible(true)}
                        />
                    }>
                    {WINE_TYPES.map((type) => (
                        <Menu.Item
                            key={type}
                            onPress={() => {
                                updateSetting('defaultWineType', type);
                                setWineTypeMenuVisible(false);
                            }}
                            title={type}
                        />
                    ))}
                </Menu>

                <Menu
                    visible={currencyMenuVisible}
                    onDismiss={() => setCurrencyMenuVisible(false)}
                    anchor={
                        <List.Item
                            title="Preferred Currency"
                            description={settings.preferredCurrency}
                            left={props => <List.Icon {...props} icon="currency-usd" />}
                            right={props => <List.Icon {...props} icon="chevron-down" />}
                            onPress={() => setCurrencyMenuVisible(true)}
                        />
                    }>
                    {CURRENCIES.map((currency) => (
                        <Menu.Item
                            key={currency}
                            onPress={() => {
                                updateSetting('preferredCurrency', currency);
                                setCurrencyMenuVisible(false);
                            }}
                            title={currency}
                        />
                    ))}
                </Menu>

                <List.Item
                    title="Show Empty Bottles"
                    description="Display wines with quantity = 0"
                    left={props => <List.Icon {...props} icon="bottle-wine-outline" />}
                    right={() => (
                        <Switch
                            value={settings.showEmptyBottles}
                            onValueChange={(value) => updateSetting('showEmptyBottles', value)}
                            color="#8B2E2E"
                        />
                    )}
                />
            </List.Section>

            <Divider />

            {/* Display & Sorting */}
            <List.Section>
                <List.Subheader style={styles.sectionHeader}>Display & Sorting</List.Subheader>

                <Menu
                    visible={sortMenuVisible}
                    onDismiss={() => setSortMenuVisible(false)}
                    anchor={
                        <List.Item
                            title="Default Sort Order"
                            description={settings.defaultSortOrder}
                            left={props => <List.Icon {...props} icon="sort" />}
                            right={props => <List.Icon {...props} icon="chevron-down" />}
                            onPress={() => setSortMenuVisible(true)}
                        />
                    }>
                    {SORT_OPTIONS.map((option) => (
                        <Menu.Item
                            key={option}
                            onPress={() => {
                                updateSetting('defaultSortOrder', option);
                                setSortMenuVisible(false);
                            }}
                            title={option}
                        />
                    ))}
                </Menu>

                <Menu
                    visible={viewStyleMenuVisible}
                    onDismiss={() => setViewStyleMenuVisible(false)}
                    anchor={
                        <List.Item
                            title="Collection View Style"
                            description={settings.collectionViewStyle}
                            left={props => <List.Icon {...props} icon="view-grid" />}
                            right={props => <List.Icon {...props} icon="chevron-down" />}
                            onPress={() => setViewStyleMenuVisible(true)}
                        />
                    }>
                    {VIEW_STYLES.map((style) => (
                        <Menu.Item
                            key={style}
                            onPress={() => {
                                updateSetting('collectionViewStyle', style);
                                setViewStyleMenuVisible(false);
                            }}
                            title={style}
                        />
                    ))}
                </Menu>

                <List.Item
                    title="Show Vintage in Cards"
                    left={props => <List.Icon {...props} icon="calendar" />}
                    right={() => (
                        <Switch
                            value={settings.showVintageInCard}
                            onValueChange={(value) => updateSetting('showVintageInCard', value)}
                            color="#8B2E2E"
                        />
                    )}
                />

                <List.Item
                    title="Show Quantity in Cards"
                    left={props => <List.Icon {...props} icon="numeric" />}
                    right={() => (
                        <Switch
                            value={settings.showQuantityInCard}
                            onValueChange={(value) => updateSetting('showQuantityInCard', value)}
                            color="#8B2E2E"
                        />
                    )}
                />

                <List.Item
                    title="Show Value in Cards"
                    left={props => <List.Icon {...props} icon="currency-usd" />}
                    right={() => (
                        <Switch
                            value={settings.showValueInCard}
                            onValueChange={(value) => updateSetting('showValueInCard', value)}
                            color="#8B2E2E"
                        />
                    )}
                />
            </List.Section>

            <Divider />

            {/* Notifications */}
            <List.Section>
                <List.Subheader style={styles.sectionHeader}>Notifications</List.Subheader>

                <List.Item
                    title="Peak Drinking Reminders"
                    description="Notify when wines reach peak drinking window"
                    left={props => <List.Icon {...props} icon="bell-ring" />}
                    right={() => (
                        <Switch
                            value={settings.peakDrinkingNotifications}
                            onValueChange={(value) => updateSetting('peakDrinkingNotifications', value)}
                            color="#8B2E2E"
                        />
                    )}
                />

                <List.Item
                    title="Low Quantity Alerts"
                    description="Alert when wine quantity is low"
                    left={props => <List.Icon {...props} icon="bell-alert" />}
                    right={() => (
                        <Switch
                            value={settings.lowQuantityNotifications}
                            onValueChange={(value) => updateSetting('lowQuantityNotifications', value)}
                            color="#8B2E2E"
                        />
                    )}
                />

                {settings.lowQuantityNotifications && (
                    <Menu
                        visible={thresholdMenuVisible}
                        onDismiss={() => setThresholdMenuVisible(false)}
                        anchor={
                            <List.Item
                                title="Low Quantity Threshold"
                                description={`Alert when quantity ≤ ${settings.lowQuantityThreshold} bottles`}
                                left={props => <List.Icon {...props} icon="alert-circle" />}
                                right={props => <List.Icon {...props} icon="chevron-down" />}
                                onPress={() => setThresholdMenuVisible(true)}
                                style={styles.indentedItem}
                            />
                        }>
                        {['1', '2', '3', '5', '10'].map((threshold) => (
                            <Menu.Item
                                key={threshold}
                                onPress={() => {
                                    updateSetting('lowQuantityThreshold', threshold);
                                    setThresholdMenuVisible(false);
                                }}
                                title={`${threshold} bottles`}
                            />
                        ))}
                    </Menu>
                )}
            </List.Section>

            <Divider />

            {/* Data Management */}
            <List.Section>
                <List.Subheader style={styles.sectionHeader}>Export Data</List.Subheader>

                <List.Item
                    title="Export Complete Collection"
                    description="Wines, wineries, and varietals (JSON)"
                    left={props => <List.Icon {...props} icon="export" />}
                    onPress={exportData}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Export Wines Only"
                    description="All wines as JSON"
                    left={props => <List.Icon {...props} icon="bottle-wine" />}
                    onPress={exportWinesOnly}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Export Wineries Only"
                    description="All wineries as JSON"
                    left={props => <List.Icon {...props} icon="domain" />}
                    onPress={exportWineriesOnly}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Export Varietals Only"
                    description="All varietals as JSON"
                    left={props => <List.Icon {...props} icon="fruit-grapes" />}
                    onPress={exportVarietalsOnly}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Export Wines as CSV"
                    description="Spreadsheet format"
                    left={props => <List.Icon {...props} icon="file-delimited" />}
                    onPress={exportCSV}
                    disabled={exporting || importing}
                />
            </List.Section>

            <Divider />

            <List.Section>
                <List.Subheader style={styles.sectionHeader}>Import Data</List.Subheader>

                <List.Item
                    title="Import Complete Collection"
                    description="Import full collection (JSON)"
                    left={props => <List.Icon {...props} icon="import" />}
                    onPress={importCompleteCollection}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Import Wines"
                    description="Import wines from JSON"
                    left={props => <List.Icon {...props} icon="bottle-wine" />}
                    onPress={importWines}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Import Wineries"
                    description="Import wineries from JSON"
                    left={props => <List.Icon {...props} icon="domain" />}
                    onPress={importWineries}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Import Varietals"
                    description="Import varietals from JSON"
                    left={props => <List.Icon {...props} icon="fruit-grapes" />}
                    onPress={importVarietals}
                    disabled={exporting || importing}
                />

                <List.Item
                    title="Reset Settings"
                    description="Restore default settings"
                    left={props => <List.Icon {...props} icon="restore" color="#FF6B6B" />}
                    onPress={() => setResetDialogVisible(true)}
                />
            </List.Section>

            <Divider />

            {/* Account & About */}
            <List.Section>
                <List.Subheader style={styles.sectionHeader}>About</List.Subheader>

                <List.Item
                    title="App Version"
                    description="2.0.0"
                    left={props => <List.Icon {...props} icon="information" />}
                />

                <List.Item
                    title="About Wine Cellar"
                    description="Learn more about the app"
                    left={props => <List.Icon {...props} icon="book-open-variant" />}
                    onPress={() => setAboutDialogVisible(true)}
                />

                <List.Item
                    title="Rate the App"
                    description="Share your feedback"
                    left={props => <List.Icon {...props} icon="star" />}
                    onPress={() => Alert.alert('Rate App', 'This would open the app store rating page')}
                />

                <List.Item
                    title="Share with Friends"
                    description="Recommend to other wine lovers"
                    left={props => <List.Icon {...props} icon="share-variant" />}
                    onPress={shareApp}
                />

                <List.Item
                    title="Privacy Policy"
                    left={props => <List.Icon {...props} icon="shield-check" />}
                    onPress={() => openURL('https://yourapp.com/privacy')}
                />

                <List.Item
                    title="Terms of Service"
                    left={props => <List.Icon {...props} icon="file-document" />}
                    onPress={() => openURL('https://yourapp.com/terms')}
                />

                <List.Item
                    title="Contact Support"
                    description="support@yourapp.com"
                    left={props => <List.Icon {...props} icon="email" />}
                    onPress={() => Linking.openURL('mailto:support@yourapp.com')}
                />
            </List.Section>

            {/* Reset Confirmation Dialog */}
            <Portal>
                <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
                    <Dialog.Title>Reset Settings?</Dialog.Title>
                    <Dialog.Content>
                        <Text>This will restore all settings to their default values. This action cannot be undone.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
                        <Button onPress={resetSettings} textColor="#FF6B6B">Reset</Button>
                    </Dialog.Actions>
                </Dialog>

                {/* About Dialog */}
                <Dialog visible={aboutDialogVisible} onDismiss={() => setAboutDialogVisible(false)}>
                    <Dialog.Title>About Wine Cellar</Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.aboutText}>
                            Wine Cellar Management App helps you track and manage your wine collection with ease.
                        </Text>
                        <Text style={styles.aboutText}>
                            Features include:
                        </Text>
                        <Text style={styles.bulletPoint}>• Collection tracking and organization</Text>
                        <Text style={styles.bulletPoint}>• Winery and varietal management</Text>
                        <Text style={styles.bulletPoint}>• Investment and valuation monitoring</Text>
                        <Text style={styles.bulletPoint}>• Drinking window recommendations</Text>
                        <Text style={styles.bulletPoint}>• Detailed statistics and insights</Text>
                        <Text style={styles.bulletPoint}>• Complete data export and backup</Text>
                        <Text style={[styles.aboutText, styles.copyrightText]}>
                            © 2024 Wine Cellar App. All rights reserved.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setAboutDialogVisible(false)}>Close</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8B2E2E',
        backgroundColor: '#FFF5F5',
    },
    indentedItem: {
        paddingLeft: 32,
    },
    bottomSpacer: {
        height: 32,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 12,
    },
    bulletPoint: {
        fontSize: 14,
        lineHeight: 22,
        color: '#666',
        marginLeft: 8,
    },
    copyrightText: {
        marginTop: 16,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});

export default SettingsScreen;