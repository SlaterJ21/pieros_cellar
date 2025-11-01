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
import { useQuery } from '@apollo/client/react';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { GET_WINES } from '@/graphql/queries/wines';
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

    // Fetch all wines without limit for export - use a large number or fetch in batches
    const { data: winesData, refetch } = useQuery(GET_WINES, {
        variables: { take: 10000, skip: 0 }, // Fetch up to 10,000 wines
        fetchPolicy: 'network-only', // Always get fresh data for export
    });

    // Helper function to fetch ALL wines if collection is very large
    const fetchAllWines = async () => {
        const allWines: any[] = [];
        let skip = 0;
        const batchSize = 1000;
        let hasMore = true;

        try {
            while (hasMore) {
                const result = await refetch({ take: batchSize, skip });

                if (result.data?.wines && result.data.wines.length > 0) {
                    allWines.push(...result.data.wines);
                    skip += batchSize;

                    // If we got less than batchSize, we've reached the end
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
            // Fall back to whatever data we have
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
            // Map storage keys to settings keys
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
                    // Parse boolean values
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
            // Notify all listeners that settings have changed
            notifySettingsChanged();
        } catch (error) {
            console.error('Error saving setting:', error);
            Alert.alert('Error', 'Failed to save setting');
        }
    };

    const updateSetting = (key: keyof Settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));

        // Map setting key to storage key
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
        if (!winesData?.wines) {
            Alert.alert('No Data', 'No wines to export');
            return;
        }

        setExporting(true);
        try {
            // Show progress
            Alert.alert('Preparing Export', 'Fetching all wines from your collection...');

            // Fetch all wines in batches to ensure we get everything
            const allWines = await fetchAllWines();

            if (allWines.length === 0) {
                Alert.alert('No Data', 'No wines found to export');
                setExporting(false);
                return;
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                totalWines: allWines.length,
                wines: allWines,
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `wine_cellar_export_${new Date().toISOString().split('T')[0]}.json`;

            // Use new FileSystem API
            const file = new File(Paths.cache, fileName);
            await file.write(jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: 'application/json',
                    dialogTitle: `Export Wine Collection (${allWines.length} wines)`,
                });
            } else {
                Alert.alert('Success', `Exported ${allWines.length} wines to ${fileName}`);
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const exportCSV = async () => {
        if (!winesData?.wines) {
            Alert.alert('No Data', 'No wines to export');
            return;
        }

        setExporting(true);
        try {
            // Show progress
            Alert.alert('Preparing Export', 'Fetching all wines from your collection...');

            // Fetch all wines in batches to ensure we get everything
            const allWines = await fetchAllWines();

            if (allWines.length === 0) {
                Alert.alert('No Data', 'No wines found to export');
                setExporting(false);
                return;
            }

            // CSV Headers
            const headers = [
                'Name', 'Vintage', 'Varietal', 'Type', 'Winery', 'Region', 'Country',
                'Quantity', 'Purchase Price', 'Current Value', 'Bottle Size', 'Status'
            ].join(',');

            // CSV Rows
            const rows = allWines.map((wine: any) => [
                `"${wine.name || ''}"`,
                wine.vintage || '',
                `"${wine.varietal || ''}"`,
                wine.type || '',
                `"${wine.winery?.name || ''}"`,
                `"${wine.region || ''}"`,
                `"${wine.country || ''}"`,
                wine.quantity || 0,
                wine.purchasePrice || '',
                wine.currentValue || '',
                wine.bottleSize || '',
                wine.status || '',
            ].join(','));

            const csvString = [headers, ...rows].join('\n');
            const fileName = `wine_cellar_export_${new Date().toISOString().split('T')[0]}.csv`;

            // Use new FileSystem API
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

    const importData = async () => {
        setImporting(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const fileUri = result.assets[0].uri;

                // Use new FileSystem API
                const file = new File(fileUri);
                const fileContent = await file.text();
                const importedData = JSON.parse(fileContent);

                if (importedData.wines && Array.isArray(importedData.wines)) {
                    Alert.alert(
                        'Import Data',
                        `Found ${importedData.wines.length} wines. This feature requires backend implementation to create wines from imported data.`,
                        [{ text: 'OK' }]
                    );
                } else {
                    Alert.alert('Invalid File', 'The selected file does not contain valid wine data');
                }
            }
        } catch (error) {
            console.error('Import error:', error);
            Alert.alert('Error', 'Failed to import data');
        } finally {
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
            // Notify all listeners that settings have changed
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
                // In production, add actual app store link
                // url: 'https://apps.apple.com/...'
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
                <List.Subheader style={styles.sectionHeader}>Data Management</List.Subheader>

                <List.Item
                    title="Export as JSON"
                    description="Export full collection data"
                    left={props => <List.Icon {...props} icon="export" />}
                    onPress={exportData}
                    disabled={exporting}
                />

                <List.Item
                    title="Export as CSV"
                    description="Export collection to spreadsheet"
                    left={props => <List.Icon {...props} icon="file-delimited" />}
                    onPress={exportCSV}
                    disabled={exporting}
                />

                <List.Item
                    title="Import Data"
                    description="Import wines from JSON file"
                    left={props => <List.Icon {...props} icon="import" />}
                    onPress={importData}
                    disabled={importing}
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
                    description="1.0.0"
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
                        <Text style={styles.bulletPoint}>• Investment and valuation monitoring</Text>
                        <Text style={styles.bulletPoint}>• Drinking window recommendations</Text>
                        <Text style={styles.bulletPoint}>• Detailed statistics and insights</Text>
                        <Text style={styles.bulletPoint}>• Data export and backup</Text>
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