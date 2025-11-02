import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Chip, ActivityIndicator, Text, FAB } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { GET_VARIETALS } from '@/graphql/queries/varietals';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Varietal {
    id: string;
    name: string;
    type: string;
    description?: string | null;
    commonRegions?: (string | null)[] | null;
    characteristics?: (string | null)[] | null;
    aliases?: (string | null)[] | null;
    wines: Array<{
        id: string;
        quantity: number;
        currentValue?: number | null;
    }>;
}

const getTypeColor = (type: string): string => {
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

const getTypeTextColor = (type: string): string => {
    const darkTextTypes = ['WHITE', 'ROSE', 'ORANGE', 'DESSERT', 'SPARKLING'];
    return darkTextTypes.includes(type) ? '#2c2c2c' : getTypeColor(type);
};

// Safe number formatter
const formatNumber = (num: number): string => {
    try {
        return num.toLocaleString('en-US');
    } catch (e) {
        return String(Math.floor(num));
    }
};

const VarietalCard = React.memo(({ varietal, onPress }: { varietal: Varietal; onPress: () => void }) => {
    // Safely process wines with defensive checks
    const wines = Array.isArray(varietal.wines) ? varietal.wines : [];

    const totalBottles = wines.reduce((sum, wine) => {
        if (!wine) return sum;
        const qty = Number(wine.quantity);
        return sum + (isNaN(qty) ? 0 : qty);
    }, 0);

    const totalValue = wines.reduce((sum, wine) => {
        if (!wine) return sum;
        const value = Number(wine.currentValue);
        return sum + (isNaN(value) ? 0 : value);
    }, 0);

    const wineCount = wines.length;

    // Safely filter null values from arrays
    const safeCharacteristics = Array.isArray(varietal.characteristics)
        ? varietal.characteristics.filter((c): c is string => typeof c === 'string' && c.length > 0)
        : [];

    const safeRegions = Array.isArray(varietal.commonRegions)
        ? varietal.commonRegions.filter((r): r is string => typeof r === 'string' && r.length > 0)
        : [];

    const safeAliases = Array.isArray(varietal.aliases)
        ? varietal.aliases.filter((a): a is string => typeof a === 'string' && a.length > 0)
        : [];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.headerRow}>
                        <Text variant="titleLarge" style={styles.varietalName}>
                            {varietal.name || 'Unknown'}
                        </Text>
                        <Chip
                            mode="flat"
                            compact
                            style={[
                                styles.typeChip,
                                { backgroundColor: getTypeColor(varietal.type) + '20' }
                            ]}
                            textStyle={[
                                styles.typeChipText,
                                { color: getTypeTextColor(varietal.type) }
                            ]}
                        >
                            {varietal.type}
                        </Chip>
                    </View>

                    {varietal.description && (
                        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                            {varietal.description}
                        </Text>
                    )}

                    {safeCharacteristics.length > 0 && (
                        <View style={styles.characteristicsRow}>
                            {safeCharacteristics.slice(0, 3).map((char, index) => (
                                <Chip
                                    key={`char-${index}-${char}`}
                                    mode="outlined"
                                    compact
                                    style={styles.characteristicChip}
                                    textStyle={styles.characteristicText}
                                >
                                    {char}
                                </Chip>
                            ))}
                            {safeCharacteristics.length > 3 && (
                                <Text style={styles.moreText}>
                                    +{safeCharacteristics.length - 3} more
                                </Text>
                            )}
                        </View>
                    )}

                    {safeRegions.length > 0 && (
                        <Text variant="bodyMedium" style={styles.regions} numberOfLines={1}>
                            📍 {safeRegions.slice(0, 3).join(', ')}
                        </Text>
                    )}

                    <View style={styles.statsRow}>
                        <Chip mode="outlined" compact style={styles.chip} icon="bottle-wine">
                            {wineCount} {wineCount === 1 ? 'wine' : 'wines'}
                        </Chip>
                        <Chip mode="outlined" compact style={styles.chip} icon="numeric">
                            {formatNumber(totalBottles)} bottles
                        </Chip>
                        {totalValue > 0 && (
                            <Chip mode="outlined" compact style={styles.chipValue} icon="currency-usd">
                                {formatNumber(Math.floor(totalValue))}
                            </Chip>
                        )}
                    </View>

                    {safeAliases.length > 0 && (
                        <Text variant="bodyMedium" style={styles.aliases} numberOfLines={1}>
                            Also known as: {safeAliases.join(', ')}
                        </Text>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
});

export default function VarietalsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_VARIETALS, {
        fetchPolicy: 'network-only', // Changed from cache-and-network
        notifyOnNetworkStatusChange: true,
    });

    // Safely extract varietals with defensive check
    const varietals: Varietal[] = useMemo(() => {
        if (!data?.varietals || !Array.isArray(data.varietals)) return [];
        return data.varietals.filter((v: any) => v && v.id && v.name);
    }, [data]);

    // Filter varietals with safe string operations
    const filteredVarietals = useMemo(() => {
        const query = (searchQuery || '').toLowerCase().trim();
        if (!query) return varietals;

        return varietals.filter(varietal => {
            try {
                const name = (varietal.name || '').toLowerCase();
                const type = (varietal.type || '').toLowerCase();
                const desc = (varietal.description || '').toLowerCase();

                if (name.includes(query) || type.includes(query) || desc.includes(query)) {
                    return true;
                }

                // Safe alias checking
                if (Array.isArray(varietal.aliases)) {
                    return varietal.aliases.some(alias =>
                        alias && typeof alias === 'string' && alias.toLowerCase().includes(query)
                    );
                }

                return false;
            } catch (e) {
                console.error('Filter error:', e);
                return false;
            }
        });
    }, [varietals, searchQuery]);

    // Sort with safe operations
    const sortedVarietals = useMemo(() => {
        try {
            return [...filteredVarietals].sort((a, b) => {
                const aCount = Array.isArray(a.wines) ? a.wines.length : 0;
                const bCount = Array.isArray(b.wines) ? b.wines.length : 0;
                const diff = bCount - aCount;
                if (diff !== 0) return diff;

                const aName = a.name || '';
                const bName = b.name || '';
                return aName.localeCompare(bName, 'en-US');
            });
        } catch (e) {
            console.error('Sort error:', e);
            return filteredVarietals;
        }
    }, [filteredVarietals]);

    // Calculate stats safely
    const stats = useMemo(() => {
        try {
            const totalVarietals = sortedVarietals.length;

            let totalWines = 0;
            let totalBottles = 0;

            for (const v of sortedVarietals) {
                if (Array.isArray(v.wines)) {
                    totalWines += v.wines.length;
                    for (const wine of v.wines) {
                        if (wine) {
                            const qty = Number(wine.quantity);
                            if (!isNaN(qty)) {
                                totalBottles += qty;
                            }
                        }
                    }
                }
            }

            return { totalVarietals, totalWines, totalBottles };
        } catch (e) {
            console.error('Stats error:', e);
            return { totalVarietals: 0, totalWines: 0, totalBottles: 0 };
        }
    }, [sortedVarietals]);

    // Count by type safely
    const byType = useMemo(() => {
        try {
            const counts: { [key: string]: number } = {};
            for (const v of sortedVarietals) {
                const type = v.type || 'UNKNOWN';
                counts[type] = (counts[type] || 0) + 1;
            }
            return counts;
        } catch (e) {
            console.error('Type count error:', e);
            return {};
        }
    }, [sortedVarietals]);

    const renderVarietalItem = ({ item }: { item: Varietal }) => (
        <VarietalCard
            varietal={item}
            onPress={() => {
                try {
                    navigation.navigate('VarietalDetail', { varietalId: item.id });
                } catch (e) {
                    console.error('Navigation error:', e);
                }
            }}
        />
    );

    const keyExtractor = (item: Varietal) => item.id || String(Math.random());

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search varietals..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />

                {sortedVarietals.length > 0 && (
                    <View style={styles.statsBar}>
                        <Text style={styles.statsText}>
                            {formatNumber(stats.totalVarietals)} {stats.totalVarietals === 1 ? 'varietal' : 'varietals'}
                        </Text>
                        <Text style={styles.statsSeparator}>•</Text>
                        <Text style={styles.statsText}>
                            {formatNumber(stats.totalWines)} wines
                        </Text>
                        <Text style={styles.statsSeparator}>•</Text>
                        <Text style={styles.statsText}>
                            {formatNumber(stats.totalBottles)} bottles
                        </Text>
                    </View>
                )}

                {Object.keys(byType).length > 0 && !searchQuery && (
                    <View style={styles.typeFilters}>
                        {Object.entries(byType).map(([type, count]) => (
                            <Chip
                                key={`type-${type}`}
                                mode="outlined"
                                compact
                                style={styles.filterChip}
                            >
                                {type} ({count})
                            </Chip>
                        ))}
                    </View>
                )}
            </View>

            {loading && varietals.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#8B2E2E" />
                    <Text style={styles.loadingText}>Loading varietals...</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.error}>Error loading varietals</Text>
                    <Text style={styles.errorDetail}>{error.message}</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedVarietals}
                    renderItem={renderVarietalItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🍇</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No varietals found' : 'No varietals yet'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'Varietals will appear here when you add wines'
                                }
                            </Text>
                        </View>
                    }
                    onRefresh={refetch}
                    refreshing={loading}
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                />
            )}

            <FAB
                style={styles.fab}
                icon="fruit-grapes"
                label="Add Varietal"
                onPress={() => navigation.navigate('AddVarietal')}
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
    searchbar: {
        marginHorizontal: 16,
        marginBottom: 8,
        elevation: 0,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    statsText: {
        fontSize: 13,
        color: '#666',
    },
    statsSeparator: {
        marginHorizontal: 8,
        color: '#999',
    },
    typeFilters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 8,
        marginHorizontal: -4,
    },
    filterChip: {
        marginHorizontal: 4,
        marginVertical: 4,
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
    card: {
        marginBottom: 12,
        backgroundColor: '#fff',
        elevation: 2,
        borderRadius: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    varietalName: {
        fontSize: 18,
        color: '#2c2c2c',
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    typeChip: {
        // No height to let it size naturally
    },
    typeChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    characteristicsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 8,
        marginHorizontal: -2,
    },
    characteristicChip: {
        marginHorizontal: 2,
        marginVertical: 2,
        backgroundColor: '#f5f5f5',
    },
    characteristicText: {
        fontSize: 10,
    },
    moreText: {
        fontSize: 11,
        color: '#999',
        marginLeft: 4,
        fontStyle: 'italic',
    },
    regions: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -3,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: '#f5f5f5',
        marginHorizontal: 3,
        marginVertical: 2,
    },
    chipValue: {
        backgroundColor: '#E8F5E9',
        marginHorizontal: 3,
        marginVertical: 2,
    },
    aliases: {
        fontSize: 11,
        color: '#999',
        fontStyle: 'italic',
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