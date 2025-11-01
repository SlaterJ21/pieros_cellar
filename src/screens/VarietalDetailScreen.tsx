// src/screens/VarietalDetailScreen.tsx
import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image
} from 'react-native';
import {
    Text,
    Card,
    Chip,
    ActivityIndicator,
    FAB,
    IconButton,
    Divider
} from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type VarietalDetailRouteProp = RouteProp<RootStackParamList, 'VarietalDetail'>;

const GET_VARIETAL = gql`
    query GetVarietal($id: ID!) {
        varietal(id: $id) {
            id
            name
            type
            description
            commonRegions
            characteristics
            aliases
            wines {
                id
                name
                vintage
                quantity
                currentValue
                purchasePrice
                winery {
                    id
                    name
                    region
                    country
                }
                photos {
                    id
                    url
                    isPrimary
                }
            }
        }
    }
`;

const DELETE_VARIETAL = gql`
    mutation DeleteVarietal($id: ID!) {
        deleteVarietal(id: $id) {
            id
        }
    }
`;

export default function VarietalDetailScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<VarietalDetailRouteProp>();
    const { varietalId } = route.params;
    const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

    const { data, loading, error } = useQuery(GET_VARIETAL, {
        variables: { id: varietalId },
        fetchPolicy: 'cache-and-network',
    });

    const [deleteVarietal] = useMutation(DELETE_VARIETAL, {
        refetchQueries: ['GetVarietals'],
    });

    const varietal = data?.varietal;

    const handleDelete = () => {
        Alert.alert(
            'Delete Varietal',
            `Are you sure you want to delete ${varietal?.name}? This won't delete associated wines, but will remove the varietal reference.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVarietal({ variables: { id: varietalId } });
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete varietal');
                        }
                    },
                },
            ]
        );
    };

    const handleImageError = (wineId: string) => {
        setImageErrors(prev => ({ ...prev, [wineId]: true }));
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading varietal...</Text>
            </View>
        );
    }

    if (error || !varietal) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.error}>Error loading varietal</Text>
                <Text style={styles.errorDetail}>{error?.message || 'Varietal not found'}</Text>
            </View>
        );
    }

    const totalBottles = varietal.wines.reduce((sum: number, wine: any) => sum + wine.quantity, 0);
    const totalValue = varietal.wines.reduce((sum: number, wine: any) => {
        const value = wine.currentValue || wine.purchasePrice || 0;
        return sum + (parseFloat(value) * wine.quantity);
    }, 0);

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

    // Group wines by winery
    const winesByWinery = varietal.wines.reduce((acc: any, wine: any) => {
        const wineryName = wine.winery?.name || 'Unknown Winery';
        if (!acc[wineryName]) {
            acc[wineryName] = [];
        }
        acc[wineryName].push(wine);
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header Card */}
                <Card style={styles.headerCard}>
                    <Card.Content>
                        <View style={styles.headerRow}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.varietalName}>{varietal.name}</Text>
                                <Chip
                                    mode="flat"
                                    style={[styles.typeChip, { backgroundColor: getTypeColor(varietal.type) + '20' }]}
                                    textStyle={[styles.typeChipText, { color: getTypeColor(varietal.type) }]}
                                >
                                    {varietal.type}
                                </Chip>
                            </View>
                            <IconButton
                                icon="pencil"
                                size={24}
                                onPress={() => navigation.navigate('EditVarietal', { varietalId })}
                                style={styles.editButton}
                            />
                        </View>

                        {varietal.aliases && varietal.aliases.length > 0 && (
                            <Text style={styles.aliases}>
                                Also known as: {varietal.aliases.join(', ')}
                            </Text>
                        )}

                        {varietal.description && (
                            <Text style={styles.description}>{varietal.description}</Text>
                        )}
                    </Card.Content>
                </Card>

                {/* Statistics Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Collection Summary</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="bottle-wine" size={32} color="#8B2E2E" />
                                <Text style={styles.statValue}>{varietal.wines.length}</Text>
                                <Text style={styles.statLabel}>Wines</Text>
                            </View>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="numeric" size={32} color="#4CAF50" />
                                <Text style={styles.statValue}>{totalBottles}</Text>
                                <Text style={styles.statLabel}>Bottles</Text>
                            </View>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons name="currency-usd" size={32} color="#2196F3" />
                                <Text style={styles.statValue}>${totalValue.toFixed(0)}</Text>
                                <Text style={styles.statLabel}>Total Value</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Characteristics Card */}
                {varietal.characteristics && varietal.characteristics.length > 0 && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Characteristics</Text>
                            <View style={styles.characteristicsGrid}>
                                {varietal.characteristics.map((char: string, index: number) => (
                                    <Chip
                                        key={index}
                                        mode="outlined"
                                        style={styles.characteristicChip}
                                    >
                                        {char}
                                    </Chip>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Common Regions Card */}
                {varietal.commonRegions && varietal.commonRegions.length > 0 && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Common Regions</Text>
                            <View style={styles.regionsGrid}>
                                {varietal.commonRegions.map((region: string, index: number) => (
                                    <Chip
                                        key={index}
                                        mode="outlined"
                                        icon="map-marker"
                                        style={styles.regionChip}
                                    >
                                        {region}
                                    </Chip>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Wines List */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>
                            Your Collection ({varietal.wines.length})
                        </Text>

                        {Object.entries(winesByWinery).map(([wineryName, wines]: [string, any]) => (
                            <View key={wineryName} style={styles.winerySection}>
                                <Text style={styles.wineryHeader}>{wineryName}</Text>
                                {wines.map((wine: any, index: number) => {
                                    const primaryPhoto = wine.photos?.find((p: any) => p.isPrimary) || wine.photos?.[0];
                                    const value = wine.currentValue || wine.purchasePrice || 0;

                                    return (
                                        <TouchableOpacity
                                            key={wine.id}
                                            onPress={() => navigation.navigate('WineDetail', { wineId: wine.id })}
                                        >
                                            <View style={styles.wineItem}>
                                                {primaryPhoto && !imageErrors[wine.id] ? (
                                                    <Image
                                                        source={{ uri: primaryPhoto.url }}
                                                        style={styles.wineImage}
                                                        resizeMode="cover"
                                                        onError={() => handleImageError(wine.id)}
                                                    />
                                                ) : (
                                                    <View style={styles.wineImagePlaceholder}>
                                                        <Text style={styles.placeholderText}>🍷</Text>
                                                    </View>
                                                )}

                                                <View style={styles.wineDetails}>
                                                    <Text style={styles.wineName} numberOfLines={1}>
                                                        {wine.name}
                                                    </Text>
                                                    <View style={styles.wineMetaRow}>
                                                        {wine.vintage && (
                                                            <Text style={styles.wineVintage}>{wine.vintage}</Text>
                                                        )}
                                                        <Text style={styles.wineQuantity}>
                                                            Qty: {wine.quantity}
                                                        </Text>
                                                    </View>
                                                    {wine.winery?.region && (
                                                        <Text style={styles.wineLocation} numberOfLines={1}>
                                                            📍 {wine.winery.region}, {wine.winery.country}
                                                        </Text>
                                                    )}
                                                </View>

                                                <View style={styles.wineValueContainer}>
                                                    <Text style={styles.wineValue}>
                                                        ${parseFloat(value).toFixed(0)}
                                                    </Text>
                                                    <MaterialCommunityIcons
                                                        name="chevron-right"
                                                        size={24}
                                                        color="#999"
                                                    />
                                                </View>
                                            </View>
                                            {index < wines.length - 1 && <Divider style={styles.divider} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </Card.Content>
                </Card>

                {/* Delete Button */}
                <Card style={[styles.card, styles.dangerCard]}>
                    <Card.Content>
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <MaterialCommunityIcons name="delete" size={24} color="#d32f2f" />
                            <Text style={styles.deleteText}>Delete Varietal</Text>
                        </TouchableOpacity>
                    </Card.Content>
                </Card>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <FAB
                style={styles.fab}
                icon="plus"
                label="Add Wine"
                onPress={() => navigation.navigate('AddWine', {
                    preselectedWineryId: '',
                    preselectedWineryName: ''
                })}
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
    scrollView: {
        flex: 1,
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
    headerCard: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
        marginRight: 8,
    },
    varietalName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2c2c2c',
        marginBottom: 8,
    },
    typeChip: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '700',
    },
    editButton: {
        margin: 0,
    },
    aliases: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    card: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c2c2c',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2c2c2c',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    characteristicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    characteristicChip: {
        marginHorizontal: 4,
        marginVertical: 4,
        backgroundColor: '#f5f5f5',
    },
    regionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    regionChip: {
        marginHorizontal: 4,
        marginVertical: 4,
        backgroundColor: '#f5f5f5',
    },
    winerySection: {
        marginBottom: 20,
    },
    wineryHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8B2E2E',
        marginBottom: 12,
    },
    wineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    wineImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        marginRight: 12,
    },
    wineImagePlaceholder: {
        width: 60,
        height: 80,
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
        fontSize: 24,
        opacity: 0.3,
    },
    wineDetails: {
        flex: 1,
        marginRight: 12,
    },
    wineName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c2c2c',
        marginBottom: 4,
    },
    wineMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        marginHorizontal: -4,
    },
    wineVintage: {
        fontSize: 13,
        color: '#8B2E2E',
        fontWeight: '600',
        marginHorizontal: 4,
    },
    wineQuantity: {
        fontSize: 13,
        color: '#666',
        marginHorizontal: 4,
    },
    wineLocation: {
        fontSize: 12,
        color: '#666',
    },
    wineValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    wineValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2E7D32',
        marginRight: 4,
    },
    divider: {
        marginVertical: 8,
    },
    dangerCard: {
        borderColor: '#ffebee',
        borderWidth: 1,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    deleteText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#d32f2f',
        marginLeft: 8,
    },
    bottomSpacer: {
        height: 100,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#8B2E2E',
    },
});