import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    TouchableOpacity,
    Linking,
    FlatList
} from 'react-native';
import {
    Text,
    Button,
    Chip,
    Divider,
    ActivityIndicator,
    IconButton,
    Card,
    Surface,
    Searchbar
} from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_WINERY } from '../graphql/queries/wineries';
import { DELETE_WINERY } from '../graphql/mutations/wineries';
import { GET_WINERIES } from '../graphql/queries/wineries';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'WineryDetail'>;

export default function WineryDetailScreen({ navigation, route }: Props) {
    const { wineryId } = route.params;
    const [logoError, setLogoError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, loading, error } = useQuery(GET_WINERY, {
        variables: { id: wineryId },
    });

    const [deleteWinery, { loading: deleting }] = useMutation(DELETE_WINERY, {
        refetchQueries: [{ query: GET_WINERIES }],
    });

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading winery details...</Text>
            </View>
        );
    }

    if (error || !data?.winery) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.error}>Winery not found</Text>
                <Button mode="outlined" onPress={() => navigation.goBack()}>
                    Go Back
                </Button>
            </View>
        );
    }

    const winery = data.winery;
    const wines = winery.wines || [];

    // Filter wines based on search query
    const filteredWines = wines.filter((wine: any) =>
        wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.varietal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wine.vintage?.toString().includes(searchQuery)
    );

    // Calculate statistics
    const totalBottles = wines.reduce((sum: number, wine: any) => sum + wine.quantity, 0);
    const totalValue = wines.reduce((sum: number, wine: any) => {
        const value = wine.currentValue || wine.purchasePrice || 0;
        return sum + (parseFloat(value) * wine.quantity);
    }, 0);

    const winesByType = wines.reduce((acc: any, wine: any) => {
        acc[wine.type] = (acc[wine.type] || 0) + wine.quantity;
        return acc;
    }, {});

    const handleDelete = () => {
        Alert.alert(
            'Delete Winery',
            `Are you sure you want to delete ${winery.name}? This will also delete all ${wines.length} wine(s) from this winery.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteWinery({ variables: { id: wineryId } });
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete winery');
                        }
                    },
                },
            ]
        );
    };

    const openWebsite = () => {
        if (winery.website) {
            Linking.openURL(winery.website);
        }
    };

    const openEmail = () => {
        if (winery.email) {
            Linking.openURL(`mailto:${winery.email}`);
        }
    };

    const openPhone = () => {
        if (winery.phone) {
            Linking.openURL(`tel:${winery.phone}`);
        }
    };

    const InfoRow = ({ label, value, icon, onPress }: {
        label: string;
        value?: string | number | null;
        icon?: string;
        onPress?: () => void;
    }) => {
        if (!value) return null;

        const content = (
            <View style={styles.infoRow}>
                {icon && <MaterialCommunityIcons name={icon as any} size={20} color="#666" style={styles.infoIcon} />}
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>{value}</Text>
                </View>
            </View>
        );

        if (onPress) {
            return (
                <TouchableOpacity onPress={onPress}>
                    {content}
                </TouchableOpacity>
            );
        }

        return content;
    };

    const renderWineItem = ({ item }: { item: any }) => {
        const primaryPhoto = item.photos?.find((p: any) => p.isPrimary) || item.photos?.[0];

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
            >
                <Card style={styles.wineCard}>
                    <View style={styles.wineCardContent}>
                        {primaryPhoto ? (
                            <Image
                                source={{ uri: primaryPhoto.url }}
                                style={styles.wineThumbnail}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.wineThumbnailPlaceholder}>
                                <MaterialCommunityIcons name="bottle-wine" size={32} color="#ccc" />
                            </View>
                        )}

                        <View style={styles.wineInfo}>
                            <Text style={styles.wineName}>{item.name}</Text>
                            <View style={styles.wineDetails}>
                                {item.vintage && (
                                    <Text style={styles.wineDetailText}>{item.vintage}</Text>
                                )}
                                {item.varietal && (
                                    <>
                                        {item.vintage && <Text style={styles.wineDetailText}> • </Text>}
                                        <Text style={styles.wineDetailText}>{item.varietal}</Text>
                                    </>
                                )}
                            </View>
                            <View style={styles.wineMetadata}>
                                <Chip
                                    icon="bottle-wine"
                                    style={styles.wineTypeChip}
                                    textStyle={styles.wineTypeChipText}
                                    compact
                                >
                                    {item.type}
                                </Chip>
                                <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                            </View>
                        </View>

                        <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    {winery.logo && !logoError ? (
                        <Image
                            source={{ uri: winery.logo }}
                            style={styles.heroLogo}
                            resizeMode="contain"
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <MaterialCommunityIcons name="domain" size={80} color="#ccc" />
                        </View>
                    )}

                    {/* Action Buttons Overlay */}
                    <View style={styles.heroActions}>
                        <IconButton
                            icon="pencil"
                            size={24}
                            iconColor="#fff"
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('EditWinery', { wineryId })}
                        />
                        <IconButton
                            icon="delete"
                            size={24}
                            iconColor="#fff"
                            style={styles.actionButton}
                            onPress={handleDelete}
                        />
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.wineryName}>{winery.name}</Text>

                        {(winery.region || winery.country) && (
                            <View style={styles.locationRow}>
                                <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
                                <Text style={styles.location}>
                                    {[winery.region, winery.country].filter(Boolean).join(', ')}
                                </Text>
                            </View>
                        )}

                        {winery.foundedYear && (
                            <View style={styles.foundedRow}>
                                <MaterialCommunityIcons name="calendar" size={18} color="#666" />
                                <Text style={styles.founded}>Founded {winery.foundedYear}</Text>
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    {winery.description && (
                        <>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={styles.description}>{winery.description}</Text>
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Contact Information */}
                    {(winery.website || winery.email || winery.phone) && (
                        <>
                            <Text style={styles.sectionTitle}>Contact</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <InfoRow
                                        label="Website"
                                        value={winery.website}
                                        icon="web"
                                        onPress={openWebsite}
                                    />
                                    <InfoRow
                                        label="Email"
                                        value={winery.email}
                                        icon="email"
                                        onPress={openEmail}
                                    />
                                    <InfoRow
                                        label="Phone"
                                        value={winery.phone}
                                        icon="phone"
                                        onPress={openPhone}
                                    />
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Statistics */}
                    <Text style={styles.sectionTitle}>Collection Statistics</Text>
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{wines.length}</Text>
                                    <Text style={styles.statLabel}>Unique Wines</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>{totalBottles}</Text>
                                    <Text style={styles.statLabel}>Total Bottles</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statValue}>
                                        ${totalValue.toFixed(0)}
                                    </Text>
                                    <Text style={styles.statLabel}>Total Value</Text>
                                </View>
                            </View>

                            {Object.keys(winesByType).length > 0 && (
                                <>
                                    <Divider style={styles.statsDivider} />
                                    <View style={styles.typeBreakdown}>
                                        <Text style={styles.typeBreakdownTitle}>By Type</Text>
                                        <View style={styles.typeChips}>
                                            {Object.entries(winesByType).map(([type, count]) => (
                                                <Chip
                                                    key={type}
                                                    style={styles.typeChip}
                                                    textStyle={styles.typeChipText}
                                                >
                                                    {type}: {count as number}
                                                </Chip>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Wines List */}
                    <View style={styles.winesSection}>
                        <View style={styles.winesSectionHeader}>
                            <Text style={styles.sectionTitle}>Wines ({filteredWines.length})</Text>
                            <Button
                                mode="outlined"
                                icon="plus"
                                onPress={() => navigation.navigate('AddWine', { preselectedWineryId: wineryId, preselectedWineryName: winery.name })}
                                compact
                            >
                                Add Wine
                            </Button>
                        </View>

                        {wines.length > 3 && (
                            <Searchbar
                                placeholder="Search wines..."
                                onChangeText={setSearchQuery}
                                value={searchQuery}
                                style={styles.searchBar}
                            />
                        )}

                        {filteredWines.length > 0 ? (
                            <FlatList
                                data={filteredWines}
                                renderItem={renderWineItem}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                ItemSeparatorComponent={() => <View style={styles.wineListSeparator} />}
                            />
                        ) : wines.length > 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
                                <Text style={styles.emptyStateText}>No wines match your search</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="bottle-wine-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyStateText}>No wines added yet</Text>
                                <Button
                                    mode="contained"
                                    icon="plus"
                                    onPress={() => navigation.navigate('AddWine', { preselectedWineryId: wineryId })}
                                    style={styles.addFirstWineButton}
                                >
                                    Add Your First Wine
                                </Button>
                            </View>
                        )}
                    </View>

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>

            {/* Fixed Bottom Actions */}
            <View style={styles.bottomActions}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('EditWinery', { wineryId })}
                    style={styles.editButton}
                    icon="pencil"
                >
                    Edit
                </Button>
                <Button
                    mode="contained"
                    onPress={handleDelete}
                    loading={deleting}
                    disabled={deleting}
                    style={styles.deleteButton}
                    buttonColor="#d32f2f"
                    icon="delete"
                >
                    Delete
                </Button>
            </View>
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
        marginBottom: 16,
        textAlign: 'center',
    },
    heroSection: {
        height: 250,
        backgroundColor: '#fff',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroLogo: {
        width: '80%',
        height: '80%',
    },
    heroPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    heroActions: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    wineryName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2c2c2c',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    location: {
        fontSize: 16,
        color: '#666',
    },
    foundedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    founded: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#8B2E2E',
        marginTop: 8,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 12,
    },
    description: {
        fontSize: 16,
        color: '#2c2c2c',
        lineHeight: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#2c2c2c',
        fontWeight: '500',
    },
    infoValueLink: {
        color: '#8B2E2E',
        textDecorationLine: 'underline',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#8B2E2E',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    statsDivider: {
        marginVertical: 16,
    },
    typeBreakdown: {
        marginTop: 8,
    },
    typeBreakdownTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    typeChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        backgroundColor: '#f5f5f5',
    },
    typeChipText: {
        fontSize: 12,
    },
    winesSection: {
        marginTop: 8,
    },
    winesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchBar: {
        marginBottom: 12,
        elevation: 0,
        backgroundColor: '#fff',
    },
    wineCard: {
        backgroundColor: '#fff',
        marginBottom: 0,
        borderRadius: 12,
    },
    wineCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    wineThumbnail: {
        width: 60,
        height: 80,
        borderRadius: 8,
    },
    wineThumbnailPlaceholder: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wineInfo: {
        flex: 1,
        marginLeft: 12,
    },
    wineName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c2c2c',
        marginBottom: 4,
    },
    wineDetails: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    wineDetailText: {
        fontSize: 14,
        color: '#666',
    },
    wineMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    wineTypeChip: {
        backgroundColor: '#8B2E2E',
        height: 24,
    },
    wineTypeChipText: {
        color: '#fff',
        fontSize: 11,
    },
    quantityText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    wineListSeparator: {
        height: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
        marginBottom: 16,
    },
    addFirstWineButton: {
        marginTop: 8,
    },
    bottomSpacer: {
        height: 100,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    editButton: {
        flex: 1,
        borderColor: '#8B2E2E',
    },
    deleteButton: {
        flex: 1,
    },
});