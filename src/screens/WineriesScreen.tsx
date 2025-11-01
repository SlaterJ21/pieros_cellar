// src/screens/WineriesScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Chip, ActivityIndicator, Text, FAB } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// GraphQL query to get all wineries with wine counts
// NOTE: If this query doesn't work, you may need to extract wineries from GET_WINES instead
const GET_WINERIES = gql`
    query GetWineries {
        wineries {
            id
            name
            region
            country
            website
            wines {
                id
                quantity
                currentValue
                name
            }
        }
    }
`;

// Alternative approach if GET_WINERIES doesn't work:
// Use GET_WINES and extract wineries from the wine data
// See the implementation guide for details

interface Winery {
    id: string;
    name: string;
    region?: string;
    country?: string;
    website?: string;
    wines: Array<{
        id: string;
        quantity: number;
        currentValue?: number;
    }>;
}

const WineryCard = React.memo(({ winery, onPress }: { winery: Winery; onPress: () => void }) => {
    const totalBottles = winery.wines.reduce((sum, wine) => {
        const qty = Number(wine.quantity) || 0;
        return sum + qty;
    }, 0);
    const totalValue = winery.wines.reduce((sum, wine) => sum + (wine.currentValue || 0), 0);
    const wineCount = winery.wines.length;

    // Debug logging
    if (wineCount > 0 && totalBottles === 0) {
        console.log('[WineryCard] DEBUG - Zero bottles detected:', {
            winery: winery.name,
            wineCount,
            wines: winery.wines.map(w => ({ id: w.id, quantity: w.quantity, type: typeof w.quantity }))
        });
    }

    const locationParts = [];
    if (winery.region) locationParts.push(winery.region);
    if (winery.country) locationParts.push(winery.country);
    const location = locationParts.join(', ');

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.wineryName}>{winery.name}</Text>

                    {location && (
                        <Text variant="bodyMedium" style={styles.location}>
                            📍 {location}
                        </Text>
                    )}

                    <View style={styles.statsRow}>
                        <Chip mode="outlined" compact style={styles.chip} icon="bottle-wine">
                            {wineCount} {wineCount === 1 ? 'wine' : 'wines'}
                        </Chip>
                        <Chip mode="outlined" compact style={styles.chip} icon="numeric">
                            {totalBottles} bottles
                        </Chip>
                        {totalValue > 0 && (
                            <Chip mode="outlined" compact style={styles.chipValue} icon="currency-usd">
                                ${totalValue.toFixed(0)}
                            </Chip>
                        )}
                    </View>

                    {winery.website && (
                        <Text variant="bodyMedium" style={styles.website} numberOfLines={1}>
                            🌐 {winery.website}
                        </Text>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
});

export default function WineriesScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_WINERIES, {
        fetchPolicy: 'cache-and-network',
    });

    const wineries: Winery[] = data?.wineries || [];

    // Filter wineries by search query
    const filteredWineries = wineries.filter(winery =>
        winery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        winery.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        winery.country?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by number of wines (descending)
    const sortedWineries = [...filteredWineries].sort((a, b) => b.wines.length - a.wines.length);

    // Calculate stats from FILTERED wineries (updates with search)
    const totalWineries = sortedWineries.length;
    const totalWines = sortedWineries.reduce((sum, w) => sum + w.wines.length, 0);
    const totalBottles = sortedWineries.reduce((sum, w) =>
        sum + w.wines.reduce((s, wine) => s + (Number(wine.quantity) || 0), 0), 0
    );

    const renderWineryItem = ({ item }: { item: Winery }) => (
        <WineryCard
            winery={item}
            onPress={() => {
                navigation.navigate('WineryDetail', { wineryId: item.id });
            }}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search wineries..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />

                {sortedWineries.length > 0 && (
                    <View style={styles.statsBar}>
                        <Text style={styles.statsText}>
                            {totalWineries.toLocaleString(undefined, { maximumFractionDigits: 0 })} {totalWineries === 1 ? 'winery' : 'wineries'}
                        </Text>
                        <Text style={styles.statsSeparator}>•</Text>
                        <Text style={styles.statsText}>
                            {totalWines.toLocaleString(undefined, { maximumFractionDigits: 0 })} wines
                        </Text>
                        <Text style={styles.statsSeparator}>•</Text>
                        <Text style={styles.statsText}>
                            {totalBottles.toLocaleString(undefined, { maximumFractionDigits: 0 })} bottles
                        </Text>
                    </View>
                )}
            </View>

            {loading && wineries.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#8B2E2E" />
                    <Text style={styles.loadingText}>Loading wineries...</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.error}>Error loading wineries</Text>
                    <Text style={styles.errorDetail}>{error.message}</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedWineries}
                    renderItem={renderWineryItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🏰</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No wineries found' : 'No wineries yet'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'Wineries will appear here when you add wines'
                                }
                            </Text>
                        </View>
                    }
                    onRefresh={refetch}
                    refreshing={false}
                />
            )}

            <FAB
                style={styles.fab}
                icon="domain-plus"
                label="Add Winery"
                onPress={() => navigation.navigate('AddWinery')}
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
    wineryName: {
        fontSize: 18,
        marginBottom: 4,
        color: '#2c2c2c',
        fontWeight: '700',
    },
    location: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: '#f5f5f5',
    },
    chipValue: {
        backgroundColor: '#E8F5E9',
    },
    website: {
        fontSize: 12,
        color: '#8B2E2E',
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