import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Searchbar, Card, Chip, FAB, ActivityIndicator, Text, IconButton, Badge, Menu, Icon } from 'react-native-paper';
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
    if (typeof varietal === 'string') return varietal;
    if (typeof varietal === 'object' && varietal.name) return varietal.name;
    return null;
};

// Wine card component with colored border on image
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

    // Get type color
    const getTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            RED: '#8B2E2E',
            WHITE: '#FFD700',
            ROSE: '#FF69B4',
            SPARKLING: '#9370DB',
            DESSERT: '#FF8C00',
            FORTIFIED: '#A0522D',
            ORANGE: '#FFA500',
        };
        return colors[type] || '#666';
    };

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    {/* Left Column: Image with colored border */}
                    <View style={styles.leftColumn}>
                        <View style={[styles.imageWrapper, { borderColor: getTypeColor(item.type) }]}>
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
                        </View>
                    </View>

                    {/* Right Column: Wine Info */}
                    <View style={styles.wineInfo}>
                        <View style={styles.headerRow}>
                            <View style={styles.nameColumn}>
                                <Text variant="titleLarge" style={styles.wineName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text style={styles.winery} numberOfLines={1}>
                                    {winery?.name || 'Unknown Winery'}
                                </Text>
                            </View>
                            <View style={styles.quantityBadge}>
                                <Text style={styles.quantityX}>×</Text>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                            </View>
                        </View>

                        {/* Vintage and Varietal Row with Icons */}
                        {(displayPrefs.showVintage && item.vintage) || varietalName ? (
                            <View style={styles.metaRow}>
                                {displayPrefs.showVintage && item.vintage && (
                                    <View style={styles.metaItem}>
                                        <Icon source="calendar" size={14} color="#666" />
                                        <Text style={styles.metaText}>{item.vintage}</Text>
                                    </View>
                                )}
                                {varietalName && (
                                    <View style={styles.metaItem}>
                                        <Icon source="fruit-grapes" size={14} color="#666" />
                                        <Text style={styles.metaText} numberOfLines={1}>{varietalName}</Text>
                                    </View>
                                )}
                            </View>
                        ) : null}

                        {location && (
                            <View style={styles.locationRow}>
                                <Icon source="map-marker" size={14} color="#666" />
                                <Text style={styles.location} numberOfLines={1}>
                                    {location}
                                </Text>
                            </View>
                        )}

                        {isLowQuantity && (
                            <Chip
                                mode="flat"
                                compact
                                style={styles.lowStockChip}
                                textStyle={styles.lowStockText}
                            >
                                Low Stock
                            </Chip>
                        )}

                        {/* Bottom Row with Value and Rating */}
                        <View style={styles.bottomRow}>
                            <View style={styles.leftBottomSection}>
                                {displayPrefs.showValue && item.currentValue && (
                                    <Text style={styles.value}>
                                        {currencyFormat(parseFloat(item.currentValue))}
                                    </Text>
                                )}
                            </View>
                            {item.personalRating && (
                                <Text style={styles.rating}>
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

// Grid view wine card with colored banner
const WineGridCard = React.memo(({ item, onPress, displayPrefs, currencyFormat, lowQuantityCheck }: any) => {
    const [imageError, setImageError] = useState(false);
    const primaryPhoto = item.photos?.find((p: any) => p.isPrimary) || item.photos?.[0];
    const varietalName = getVarietalName(item.varietal);
    const isLowQuantity = lowQuantityCheck(item.quantity);

    const getTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            RED: '#8B2E2E',
            WHITE: '#FFD700',
            ROSE: '#FF69B4',
            SPARKLING: '#9370DB',
            DESSERT: '#FF8C00',
            FORTIFIED: '#A0522D',
            ORANGE: '#FFA500',
        };
        return colors[type] || '#666';
    };

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

                    {/* Colored banner at bottom of image */}
                    <View style={[styles.typeBanner, { backgroundColor: getTypeColor(item.type) }]} />

                    <View style={styles.gridQuantityBadge}>
                        <Text style={styles.gridQuantityX}>×</Text>
                        <Text style={styles.gridQuantityText}>{item.quantity}</Text>
                    </View>
                </View>

                <Card.Content style={styles.gridCardContent}>
                    <Text variant="titleLarge" style={styles.gridWineName} numberOfLines={2}>
                        {item.name}
                    </Text>

                    {/* Vintage and Varietal Row with Icons */}
                    {(displayPrefs.showVintage && item.vintage) || varietalName ? (
                        <View style={styles.gridMetaRow}>
                            {displayPrefs.showVintage && item.vintage && (
                                <View style={styles.gridMetaItem}>
                                    <Icon source="calendar" size={12} color="#666" />
                                    <Text style={styles.gridMetaText}>{item.vintage}</Text>
                                </View>
                            )}
                            {varietalName && (
                                <View style={styles.gridMetaItem}>
                                    <Icon source="fruit-grapes" size={12} color="#666" />
                                    <Text style={styles.gridMetaText} numberOfLines={1}>{varietalName}</Text>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {isLowQuantity && (
                        <Badge size={16} style={styles.gridLowStockBadge}>!</Badge>
                    )}

                    {/* Bottom row with value and rating */}
                    <View style={styles.gridBottomRow}>
                        {displayPrefs.showValue && item.currentValue && (
                            <Text style={styles.gridValue}>
                                {currencyFormat(parseFloat(item.currentValue))}
                            </Text>
                        )}
                        {item.personalRating && (
                            <Text style={styles.gridRating}>
                                ⭐ {item.personalRating}
                            </Text>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
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

    const { showEmpty } = useShowEmptyBottles();
    const { sortOrder, sortFunction, loading: sortLoading } = useSortPreference();
    const { viewStyle } = useViewStyle();
    const { showVintage, showQuantity, showValue } = useCardDisplayPreferences();
    const { formatPrice } = useCurrency();
    const { isQuantityLow } = useLowQuantityAlert();

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

    const processedWines = useMemo(() => {
        if (!data?.wines) return [];

        let wines = [...data.wines];

        if (!showEmpty) {
            wines = wines.filter(wine => wine.quantity > 0);
        }

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
                            <Menu.Item onPress={() => { }} title={`Current: ${viewStyle}`} disabled />
                            <Menu.Item onPress={() => navigation.navigate('Settings')} title="Change in Settings" />
                        </Menu>

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
                            <Menu.Item onPress={() => { }} title={`Current: ${sortOrder}`} disabled />
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
                    key={isGrid ? 'grid' : 'list'}
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
    list: {
        padding: 16,
    },
    gridRow: {
        justifyContent: 'space-between',
    },
    // List Card Styles with colored border on image
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
    leftColumn: {
        marginRight: 12,
    },
    imageWrapper: {
        borderRadius: 8,
        borderBottomWidth: 4,
        overflow: 'hidden',
    },
    wineImage: {
        width: 80,
        height: 120,
        backgroundColor: '#f9f9f9',
    },
    wineImagePlaceholder: {
        width: 80,
        height: 120,
        backgroundColor: '#f9f9f9',
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    nameColumn: {
        flex: 1,
        marginRight: 8,
    },
    wineName: {
        fontSize: 16,
        color: '#2c2c2c',
        fontWeight: '700',
        marginBottom: 2,
        lineHeight: 20,
    },
    winery: {
        fontSize: 13,
        color: '#8B2E2E',
        fontWeight: '600',
    },
    quantityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    quantityText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    quantityX: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginRight: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 4,
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    location: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    lowStockChip: {
        backgroundColor: '#FFEBEE',
        height: 24,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    lowStockText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D32F2F',
        lineHeight: 24,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftBottomSection: {
        flex: 1,
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
    // Grid Card Styles with colored banner
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
    typeBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
    },
    gridQuantityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    gridQuantityText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    gridQuantityX: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginRight: 2,
    },
    gridLowStockBadge: {
        backgroundColor: '#FF6B6B',
        color: '#fff',
        alignSelf: 'flex-start',
        marginTop: 4,
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
    gridMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 6,
        gap: 8,
    },
    gridMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    gridMetaText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    gridBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    gridValue: {
        fontSize: 13,
        color: '#2E7D32',
        fontWeight: '700',
    },
    gridRating: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
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