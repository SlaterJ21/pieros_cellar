import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Searchbar, Card, Chip, FAB, ActivityIndicator, Text, IconButton, Badge, Menu } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { GET_WINES } from '@/graphql/queries/wines';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from '@/hooks/useDebounce';
import {
    useShowEmptyBottles,
    useSortPreference,
    useViewStyle,
    useCardDisplayPreferences,
    useCurrency,
    useLowQuantityAlert
} from '@/hooks/useSettings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Helper function to safely get varietal name
const getVarietalName = (varietal: any): string | null => {
    if (!varietal) return null;
    // Handle both old string format and new object format
    if (typeof varietal === 'string') return varietal;
    if (typeof varietal === 'object' && varietal.name) return varietal.name;
    return null;
};

// Wine card component to prevent re-renders
const WineCard = React.memo(({ item, onPress, displayPrefs, currencyFormat, lowQuantityCheck }: any) => {
    const [imageError, setImageError] = useState(false);
    const primaryPhoto = item.photos?.find((p: any) => p.isPrimary) || item.photos?.[0];
    const winery = item.winery;
    const varietalName = getVarietalName(item.varietal);

    const locationParts = [];
    if (winery?.region) locationParts.push(winery.region);
    if (winery?.country) locationParts.push(winery.country);
    const location = locationParts.join(', ');

    const isLowQuantity = lowQuantityCheck(item.quantity);

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    {primaryPhoto && !imageError ? (
                        <Image
                            source={{ uri: primaryPhoto.url }}
                            style={styles.wineImage}
                            resizeMode="cover"
                            onError={() => setImageError(true)}
                            fadeDuration={0}
                        />
                    ) : (
                        <View style={styles.wineImagePlaceholder}>
                            <Text style={styles.placeholderText}>🍷</Text>
                        </View>
                    )}
                    <View style={styles.wineInfo}>
                        <View style={styles.nameRow}>
                            <Text variant="titleLarge" style={styles.wineName} numberOfLines={2}>
                                {item.name}
                            </Text>
                            {isLowQuantity && (
                                <Badge size={20} style={styles.lowStockBadge}>!</Badge>
                            )}
                        </View>

                        <Text variant="bodyMedium" style={styles.winery} numberOfLines={1}>
                            {winery?.name || 'Unknown Winery'}
                        </Text>

                        <View style={styles.details}>
                            {displayPrefs.showVintage && item.vintage && (
                                <Chip mode="outlined" compact style={styles.chip}>
                                    {item.vintage}
                                </Chip>
                            )}
                            <Chip
                                mode="outlined"
                                compact
                                style={[styles.chip, styles.chip]}
                            >
                                {item.type}
                            </Chip>
                            {displayPrefs.showQuantity && item.quantity > 1 && (
                                <Chip mode="outlined" compact style={styles.chipQuantity}>
                                    Qty: {item.quantity}
                                </Chip>
                            )}
                        </View>

                        {varietalName && (
                            <Text variant="bodyMedium" style={styles.varietal} numberOfLines={1}>
                                {varietalName}
                            </Text>
                        )}

                        {location && (
                            <Text variant="bodyMedium" style={styles.location} numberOfLines={1}>
                                📍 {location}
                            </Text>
                        )}

                        <View style={styles.bottomRow}>
                            {displayPrefs.showValue && item.currentValue && (
                                <Text variant="bodyMedium" style={styles.value}>
                                    {currencyFormat(parseFloat(item.currentValue))}
                                </Text>
                            )}
                            {item.personalRating && (
                                <Text variant="bodyMedium" style={styles.rating}>
                                    ⭐ {item.personalRating}
                                </Text>
                            )}
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // FIXED: Add photo comparison to detect changes
    const prevPhotos = prevProps.item.photos?.length || 0;
    const nextPhotos = nextProps.item.photos?.length || 0;
    const prevPrimaryPhoto = prevProps.item.photos?.find((p: any) => p.isPrimary)?.url ||
        prevProps.item.photos?.[0]?.url || '';
    const nextPrimaryPhoto = nextProps.item.photos?.find((p: any) => p.isPrimary)?.url ||
        nextProps.item.photos?.[0]?.url || '';

    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.quantity === nextProps.item.quantity &&
        prevPhotos === nextPhotos &&
        prevPrimaryPhoto === nextPrimaryPhoto &&
        prevProps.displayPrefs.showVintage === nextProps.displayPrefs.showVintage &&
        prevProps.displayPrefs.showQuantity === nextProps.displayPrefs.showQuantity &&
        prevProps.displayPrefs.showValue === nextProps.displayPrefs.showValue
    );
});

// Grid view wine card
const WineGridCard = React.memo(({ item, onPress, displayPrefs, currencyFormat, lowQuantityCheck }: any) => {
    const [imageError, setImageError] = useState(false);
    const primaryPhoto = item.photos?.find((p: any) => p.isPrimary) || item.photos?.[0];
    const isLowQuantity = lowQuantityCheck(item.quantity);

    return (
        <TouchableOpacity onPress={onPress} style={styles.gridCardContainer}>
            <Card style={styles.gridCard}>
                <View style={styles.gridImageContainer}>
                    {primaryPhoto && !imageError ? (
                        <Image
                            source={{ uri: primaryPhoto.url }}
                            style={styles.gridImage}
                            resizeMode="cover"
                            onError={() => setImageError(true)}
                            fadeDuration={0}
                        />
                    ) : (
                        <View style={styles.gridImagePlaceholder}>
                            <Text style={styles.placeholderText}>🍷</Text>
                        </View>
                    )}
                    {isLowQuantity && (
                        <Badge size={20} style={styles.gridLowStockBadge}>!</Badge>
                    )}
                </View>

                <Card.Content style={styles.gridCardContent}>
                    <Text variant="titleLarge" style={styles.gridWineName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    {displayPrefs.showVintage && item.vintage && (
                        <Text style={styles.gridVintage}>{item.vintage}</Text>
                    )}

                    <View style={styles.gridDetails}>
                        <Chip mode="outlined" compact style={[styles.chip, styles.typeChip]} textStyle={styles.chipText}>
                            {item.type}
                        </Chip>
                        {displayPrefs.showQuantity && (
                            <Chip mode="outlined" compact style={styles.chipQuantity}>
                                {item.quantity}
                            </Chip>
                        )}
                    </View>

                    {displayPrefs.showValue && item.currentValue && (
                        <Text style={styles.gridValue}>
                            {currencyFormat(parseFloat(item.currentValue))}
                        </Text>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // FIXED: Add photo comparison to detect changes
    const prevPhotos = prevProps.item.photos?.length || 0;
    const nextPhotos = nextProps.item.photos?.length || 0;
    const prevPrimaryPhoto = prevProps.item.photos?.find((p: any) => p.isPrimary)?.url ||
        prevProps.item.photos?.[0]?.url || '';
    const nextPrimaryPhoto = nextProps.item.photos?.find((p: any) => p.isPrimary)?.url ||
        nextProps.item.photos?.[0]?.url || '';

    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.quantity === nextProps.item.quantity &&
        prevPhotos === nextPhotos &&
        prevPrimaryPhoto === nextPrimaryPhoto &&
        prevProps.displayPrefs.showVintage === nextProps.displayPrefs.showVintage &&
        prevProps.displayPrefs.showQuantity === nextProps.displayPrefs.showQuantity &&
        prevProps.displayPrefs.showValue === nextProps.displayPrefs.showValue
    );
});

export default function InventoryScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMenuVisible, setSortMenuVisible] = useState(false);
    const [viewMenuVisible, setViewMenuVisible] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Settings hooks - these will automatically refresh when settings change
    const { showEmpty } = useShowEmptyBottles();
    const { sortOrder, sortFunction, loading: sortLoading } = useSortPreference();
    const { viewStyle } = useViewStyle();
    const { showVintage, showQuantity, showValue } = useCardDisplayPreferences();
    const { formatPrice } = useCurrency();
    const { isQuantityLow } = useLowQuantityAlert();

    // Create stable displayPrefs object using useMemo
    const displayPrefs = useMemo(() => ({
        showVintage,
        showQuantity,
        showValue,
    }), [showVintage, showQuantity, showValue]);

    const { data, loading, error, refetch } = useQuery(GET_WINES, {
        variables: {
            filter: debouncedSearch ? { search: debouncedSearch } : null,
            take: 10000,
        },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: false,
    });

    // Apply settings to wine list
    const processedWines = useMemo(() => {

        if (!data?.wines) return [];

        let wines = [...data.wines];

        // Filter empty bottles if setting is disabled
        if (!showEmpty) {
            wines = wines.filter(wine => wine.quantity > 0);
        }

        // Apply sort order
        if (!sortLoading && sortFunction) {
            wines.sort(sortFunction);
        }

        return wines;
    }, [data?.wines, showEmpty, sortLoading, sortFunction]);

    const renderWineItem = ({ item }: any) => {
        const isGrid = viewStyle === 'Grid';

        if (isGrid) {
            return (
                <WineGridCard
                    item={item}
                    onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
                    displayPrefs={displayPrefs}
                    currencyFormat={formatPrice}
                    lowQuantityCheck={isQuantityLow}
                />
            );
        }

        return (
            <WineCard
                item={item}
                onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
                displayPrefs={displayPrefs}
                currencyFormat={formatPrice}
                lowQuantityCheck={isQuantityLow}
            />
        );
    };

    const isGrid = viewStyle === 'Grid';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchRow}>
                    <Searchbar
                        placeholder="Search wines, wineries, varietals..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                        loading={loading && debouncedSearch !== searchQuery}
                    />
                    <IconButton
                        icon="cog"
                        size={24}
                        onPress={() => navigation.navigate('Settings')}
                        style={styles.settingsButton}
                    />
                </View>

                <View style={styles.controlsRow}>
                    {processedWines.length > 0 && (
                        <View style={styles.statsBar}>
                            <Text style={styles.statsText}>
                                {processedWines.reduce((sum, wine) => sum + wine.quantity, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} bottles
                            </Text>
                            <Text style={styles.statsSeparator}>•</Text>
                            <Text style={styles.statsText}>
                                {processedWines.length.toLocaleString(undefined, { maximumFractionDigits: 0 })} wines
                            </Text>
                        </View>
                    )}

                    <View style={styles.controlButtons}>
                        {/* View Style Toggle */}
                        <Menu
                            visible={viewMenuVisible}
                            onDismiss={() => setViewMenuVisible(false)}
                            anchor={
                                <IconButton
                                    icon={viewStyle === 'Grid' ? 'view-grid' : 'view-list'}
                                    size={20}
                                    onPress={() => setViewMenuVisible(true)}
                                    style={styles.controlButton}
                                />
                            }>
                            <Menu.Item onPress={() => { /* View is controlled by settings */ }} title={`Current: ${viewStyle}`} disabled />
                            <Menu.Item onPress={() => navigation.navigate('Settings')} title="Change in Settings" />
                        </Menu>

                        {/* Sort Menu */}
                        <Menu
                            visible={sortMenuVisible}
                            onDismiss={() => setSortMenuVisible(false)}
                            anchor={
                                <IconButton
                                    icon="sort"
                                    size={20}
                                    onPress={() => setSortMenuVisible(true)}
                                    style={styles.controlButton}
                                />
                            }>
                            <Menu.Item onPress={() => { /* Sort is controlled by settings */ }} title={`Current: ${sortOrder}`} disabled />
                            <Menu.Item onPress={() => navigation.navigate('Settings')} title="Change in Settings" />
                        </Menu>
                    </View>
                </View>
            </View>

            {loading && processedWines.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#8B2E2E" />
                    <Text style={styles.loadingText}>Loading your cellar...</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.error}>Error loading wines</Text>
                    <Text style={styles.errorDetail}>{error.message}</Text>
                </View>
            ) : (
                <FlatList
                    data={processedWines}
                    renderItem={renderWineItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    numColumns={isGrid ? 2 : 1}
                    key={isGrid ? 'grid' : 'list'} // Force re-render when switching views
                    columnWrapperStyle={isGrid ? styles.gridRow : undefined}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🍷</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No wines found' : showEmpty ? 'Your cellar is empty' : 'No wines with bottles in stock'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : showEmpty
                                        ? 'Tap the + button below to add your first bottle'
                                        : 'Enable "Show Empty Bottles" in Settings to see all wines'
                                }
                            </Text>
                        </View>
                    }
                    onRefresh={refetch}
                    refreshing={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={20}
                    windowSize={10}
                />
            )}

            <FAB
                style={styles.fab}
                icon="bottle-wine"
                label="Add Wine"
                onPress={() => navigation.navigate('AddWine', { preselectedWineryId: '', preselectedWineryName: '' })}
                color="#fff"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    searchbar: {
        flex: 1,
        marginRight: 8,
        elevation: 0,
    },
    settingsButton: {
        margin: 0,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsText: {
        fontSize: 13,
        color: '#666',
    },
    statsSeparator: {
        marginHorizontal: 8,
        color: '#999',
    },
    controlButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlButton: {
        margin: 0,
    },
    list: {
        padding: 16,
    },
    gridRow: {
        justifyContent: 'space-between',
    },
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
        elevation: 2,
        borderRadius: 12,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 12,
    },
    wineImage: {
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginRight: 12,
    },
    wineImagePlaceholder: {
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 32,
        opacity: 0.3,
    },
    wineInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    wineName: {
        fontSize: 16,
        marginBottom: 2,
        color: '#2c2c2c',
        fontWeight: '700',
        lineHeight: 20,
        flex: 1,
        marginRight: 8,
    },
    lowStockBadge: {
        backgroundColor: '#FF6B6B',
        color: '#fff',
        fontSize: 12,
    },
    winery: {
        fontSize: 14,
        color: '#8B2E2E',
        marginBottom: 8,
        fontWeight: '600',
    },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
        gap: 4,
    },
    chip: {
        backgroundColor: '#f5f5f5',
    },
    typeChip: {
        backgroundColor: '#f5f5f5',
    },
    chipText: {
        color: '#fff',
        fontSize: 11,
    },
    chipQuantity: {
        backgroundColor: '#FFD700',
    },
    varietal: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    location: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    value: {
        fontSize: 15,
        color: '#2E7D32',
        fontWeight: '700',
    },
    rating: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    // Grid view styles
    gridCardContainer: {
        width: '48%',
        marginBottom: 12,
    },
    gridCard: {
        backgroundColor: '#fff',
        elevation: 2,
        borderRadius: 12,
    },
    gridImageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 0.75,
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: '#f9f9f9',
    },
    gridImagePlaceholder: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    gridLowStockBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF6B6B',
        color: '#fff',
    },
    gridCardContent: {
        padding: 12,
        paddingTop: 8,
    },
    gridWineName: {
        fontSize: 14,
        marginBottom: 4,
        color: '#2c2c2c',
        fontWeight: '700',
        lineHeight: 18,
    },
    gridVintage: {
        fontSize: 12,
        color: '#8B2E2E',
        marginBottom: 6,
        fontWeight: '600',
    },
    gridDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 6,
    },
    gridValue: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '700',
        marginTop: 4,
    },
    empty: {
        padding: 48,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.3,
    },
    emptyText: {
        fontSize: 18,
        color: '#2c2c2c',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    error: {
        color: '#d32f2f',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    errorDetail: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#8B2E2E',
    },
});