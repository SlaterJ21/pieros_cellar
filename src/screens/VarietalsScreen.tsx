// src/screens/VarietalsScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Chip, ActivityIndicator, Text, FAB } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GET_VARIETALS = gql`
    query GetVarietals {
        varietals {
            id
            name
            type
            description
            commonRegions
            characteristics
            aliases
            wines {
                id
                quantity
                currentValue
            }
        }
    }
`;

interface Varietal {
    id: string;
    name: string;
    type: string;
    description?: string;
    commonRegions?: string[];
    characteristics?: string[];
    aliases?: string[];
    wines: Array<{
        id: string;
        quantity: number;
        currentValue?: number;
    }>;
}

const VarietalCard = React.memo(({ varietal, onPress }: { varietal: Varietal; onPress: () => void }) => {
    const totalBottles = varietal.wines.reduce((sum, wine) => {
        const qty = Number(wine.quantity) || 0;
        return sum + qty;
    }, 0);
    const totalValue = varietal.wines.reduce((sum, wine) => sum + (wine.currentValue || 0), 0);
    const wineCount = varietal.wines.length;

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
                <Card.Content>
                    <View style={styles.headerRow}>
                        <Text variant="titleLarge" style={styles.varietalName}>{varietal.name}</Text>
                        <Chip
                            mode="flat"
                            compact
                            style={[styles.typeChip, { backgroundColor: getTypeColor(varietal.type) + '20' }]}
                            textStyle={[styles.typeChipText, { color: getTypeColor(varietal.type) }]}
                        >
                            {varietal.type}
                        </Chip>
                    </View>

                    {varietal.description && (
                        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
                            {varietal.description}
                        </Text>
                    )}

                    {varietal.characteristics && varietal.characteristics.length > 0 && (
                        <View style={styles.characteristicsRow}>
                            {varietal.characteristics.slice(0, 3).map((char, index) => (
                                <Chip
                                    key={index}
                                    mode="outlined"
                                    compact
                                    style={styles.characteristicChip}
                                    textStyle={styles.characteristicText}
                                >
                                    {char}
                                </Chip>
                            ))}
                            {varietal.characteristics.length > 3 && (
                                <Text style={styles.moreText}>
                                    +{varietal.characteristics.length - 3} more
                                </Text>
                            )}
                        </View>
                    )}

                    {varietal.commonRegions && varietal.commonRegions.length > 0 && (
                        <Text variant="bodyMedium" style={styles.regions} numberOfLines={1}>
                            📍 {varietal.commonRegions.slice(0, 3).join(', ')}
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

                    {varietal.aliases && varietal.aliases.length > 0 && (
                        <Text variant="bodyMedium" style={styles.aliases} numberOfLines={1}>
                            Also known as: {varietal.aliases.join(', ')}
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
        fetchPolicy: 'cache-and-network',
    });

    const varietals: Varietal[] = data?.varietals || [];

    // Filter varietals by search query
    const filteredVarietals = varietals.filter(varietal =>
        varietal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        varietal.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        varietal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        varietal.aliases?.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Sort by number of wines (descending), then alphabetically
    const sortedVarietals = [...filteredVarietals].sort((a, b) => {
        const wineCountDiff = b.wines.length - a.wines.length;
        if (wineCountDiff !== 0) return wineCountDiff;
        return a.name.localeCompare(b.name);
    });

    // Calculate stats from FILTERED varietals (updates with search)
    const totalVarietals = sortedVarietals.length;
    const totalWines = sortedVarietals.reduce((sum, v) => sum + v.wines.length, 0);
    const totalBottles = sortedVarietals.reduce((sum, v) =>
        sum + v.wines.reduce((s, wine) => s + (Number(wine.quantity) || 0), 0), 0
    );

    // Count by type
    const byType = sortedVarietals.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const renderVarietalItem = ({ item }: { item: Varietal }) => (
        <VarietalCard
            varietal={item}
            onPress={() => {
                navigation.navigate('VarietalDetail', { varietalId: item.id });
            }}
        />
    );

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
                            {totalVarietals.toLocaleString(undefined, { maximumFractionDigits: 0 })} {totalVarietals === 1 ? 'varietal' : 'varietals'}
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

                {Object.keys(byType).length > 0 && !searchQuery && (
                    <View style={styles.typeFilters}>
                        {Object.entries(byType).map(([type, count]) => (
                            <Chip
                                key={type}
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
                    keyExtractor={(item) => item.id}
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
                    refreshing={false}
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
        height: 28,
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