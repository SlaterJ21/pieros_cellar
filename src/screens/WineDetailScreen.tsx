import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    TouchableOpacity,
    Linking,
    Dimensions,
} from 'react-native';
import {
    Text,
    Button,
    ActivityIndicator,
    IconButton,
    Card,
    Portal,
    Modal,
    ProgressBar,
    Chip,
    Divider,
    Surface,
} from 'react-native-paper';
import {useMutation, useQuery} from '@apollo/client/react';
import {GET_WINE, GET_WINES} from '@/graphql/queries/wines';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePhotoUpload } from '@/hooks/usePhoto';
import {UPDATE_WINE_QUANTITY} from "@/graphql/mutations/wines";

type Props = NativeStackScreenProps<RootStackParamList, 'WineDetail'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WineDetailScreen({ navigation, route }: Props) {
    const { wineId } = route.params;
    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [photoModalVisible, setPhotoModalVisible] = useState(false);

    const { data, loading, error } = useQuery(GET_WINE, {
        variables: { id: wineId },
        fetchPolicy: 'cache-and-network', // Always fetch fresh data
    });

    // Use the photo upload hook with improved cache management
    const {
        uploading,
        uploadProgress,
        pickFromLibrary,
        takePhoto,
        deletePhoto,
        setPrimary,
        showPhotoMenu,
    } = usePhotoUpload({
        wineId,
        onUploadComplete: () => {
            Alert.alert('Success', 'Photo uploaded successfully!');
            // Cache updates automatically via mutation
        },
        onUploadError: (error) => {
            Alert.alert('Upload Failed', error);
        },
    });

    const [updateWineQuantity] = useMutation(UPDATE_WINE_QUANTITY, {
        refetchQueries: [
            { query: GET_WINES, variables: { take: 10000 } },
            { query: GET_WINE, variables: { id: wineId } },
        ],
    });

    if (loading && !data) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading wine details...</Text>
            </View>
        );
    }

    if (error || !data?.wine) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.error}>Wine not found</Text>
                <Button mode="outlined" onPress={() => navigation.goBack()}>
                    Go Back
                </Button>
            </View>
        );
    }

    const wine = data.wine;
    const primaryPhoto = wine.photos?.find((p: any) => p.isPrimary) || wine.photos?.[0];

    const handleDeletePhoto = (photo: any) => {
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deletePhoto(photo.id, photo.s3Key);
                        if (success) {
                            setPhotoModalVisible(false);
                            setSelectedPhoto(null);
                            Alert.alert('Success', 'Photo deleted');
                        }
                    },
                },
            ]
        );
    };

    const handleSetPrimary = async (photo: any) => {
        if (photo.isPrimary) {
            Alert.alert('Info', 'This photo is already the primary photo');
            return;
        }

        const success = await setPrimary(photo.id);
        if (success) {
            setPhotoModalVisible(false);
            Alert.alert('Success', 'Primary photo updated');
        }
    };

    const InfoRow = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: string }) => {
        if (!value) return null;
        return (
            <View style={styles.infoRow}>
                {icon && <MaterialCommunityIcons name={icon as any} size={20} color="#666" style={styles.infoIcon} />}
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Hero Image Section */}
                <View style={styles.heroSection}>
                    {primaryPhoto ? (
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedPhoto(primaryPhoto);
                                setPhotoModalVisible(true);
                            }}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: primaryPhoto.url }}
                                style={styles.heroImage}
                                resizeMode="cover"
                                onError={(error) => {
                                    console.error('Hero image failed to load:', error.nativeEvent);
                                }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <MaterialCommunityIcons name="bottle-wine" size={80} color="#ccc" />
                            <Text style={styles.noPhotoText}>No photo</Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.heroActions}>
                        <IconButton
                            icon="camera-plus"
                            size={24}
                            iconColor="#fff"
                            style={styles.actionButton}
                            onPress={showPhotoMenu}
                            disabled={uploading}
                        />
                        <IconButton
                            icon="pencil"
                            size={24}
                            iconColor="#fff"
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('EditWine', { wineId })}
                        />
                    </View>

                    {/* Upload Progress */}
                    {uploading && (
                        <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.uploadingText}>Uploading photo...</Text>
                            <ProgressBar
                                progress={uploadProgress / 100}
                                color="#fff"
                                style={styles.progressBar}
                            />
                        </View>
                    )}
                </View>

                {/* Photo Gallery */}
                {wine.photos && wine.photos.length > 1 && (
                    <View style={styles.photoGallery}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {wine.photos.map((photo: any) => (
                                <TouchableOpacity
                                    key={photo.id}
                                    onPress={() => {
                                        setSelectedPhoto(photo);
                                        setPhotoModalVisible(true);
                                    }}
                                >
                                    <View style={styles.thumbnailContainer}>
                                        <Image
                                            source={{ uri: photo.url }}
                                            style={styles.thumbnail}
                                            resizeMode="cover"
                                            onError={(error) => {
                                                console.error('Thumbnail failed to load:', error.nativeEvent);
                                            }}
                                        />
                                        {photo.isPrimary && (
                                            <View style={styles.primaryBadge}>
                                                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.wineName}>{wine.name}</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('WineryDetail', { wineryId: wine.winery.id })}
                            disabled={!wine.winery.website}
                        >
                            <Text style={styles.winery}>{wine.winery.name}</Text>
                        </TouchableOpacity>

                        <View style={styles.headerChips}>
                            {wine.vintage && (
                                <Chip icon="calendar" style={styles.chip}>{wine.vintage}</Chip>
                            )}
                            <Chip
                                icon="bottle-wine"
                                style={[styles.chip, styles.typeChip]}
                                textStyle={styles.typeChipText}
                            >
                                {wine.type}
                            </Chip>
                            {wine.varietal?.name && (
                                <Chip icon="leaf" style={styles.chip}>{wine.varietal.name}</Chip>
                            )}
                        </View>

                        {/* Status Badge */}
                        {wine.status === 'READY_TO_DRINK' && (
                            <Chip
                                icon="check-circle"
                                style={styles.statusChipReady}
                                textStyle={styles.statusChipText}
                            >
                                Ready to Drink
                            </Chip>
                        )}
                        {wine.status === 'RESERVED' && (
                            <Chip
                                icon="star"
                                style={styles.statusChipReserved}
                                textStyle={styles.statusChipText}
                            >
                                Reserved
                            </Chip>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    {/* Quantity Control */}
                    <Surface style={styles.quantityCard} elevation={1}>
                        <View style={styles.quantityRow}>
                            <Text style={styles.quantityLabel}>Quantity in Cellar</Text>
                            <View style={styles.quantityControls}>
                                <IconButton
                                    icon="minus"
                                    size={20}
                                    onPress={() => updateWineQuantity({
                                        variables: {
                                            id: wine.id,
                                            quantity: Math.max(0, wine.quantity - 1),
                                        },
                                    })}
                                    disabled={wine.quantity <= 0}
                                    style={styles.quantityButton}
                                />
                                <Text style={styles.quantityValue}>{wine.quantity}</Text>
                                <IconButton
                                    icon="plus"
                                    size={20}
                                    onPress={() => updateWineQuantity({
                                        variables: {
                                            id: wine.id,
                                            quantity: wine.quantity + 1,
                                        },
                                    })
                                    }
                                    style={styles.quantityButton}
                                />
                            </View>
                        </View>
                    </Surface>

                    {/* Location Info */}
                    {(wine.winery.region || wine.winery.country) && (
                        <>
                            <Text style={styles.sectionTitle}>Origin</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <InfoRow
                                        label="Region"
                                        value={wine.region || wine.winery.region}
                                        icon="map-marker"
                                    />
                                    {wine.subRegion && (
                                        <InfoRow label="Sub-Region" value={wine.subRegion} icon="map-marker-outline" />
                                    )}
                                    <InfoRow
                                        label="Country"
                                        value={wine.country || wine.winery.country}
                                        icon="earth"
                                    />
                                    {wine.appellation && (
                                        <InfoRow label="Appellation" value={wine.appellation} icon="certificate" />
                                    )}
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Valuation */}
                    {(wine.purchasePrice || wine.currentValue) && (
                        <>
                            <Text style={styles.sectionTitle}>Valuation</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.valuationGrid}>
                                        {wine.purchasePrice && (
                                            <View style={styles.valuationItem}>
                                                <Text style={styles.valuationLabel}>Purchase Price</Text>
                                                <Text style={styles.valuationValue}>
                                                    ${parseFloat(wine.purchasePrice).toFixed(2)}
                                                </Text>
                                            </View>
                                        )}
                                        {wine.currentValue && (
                                            <View style={styles.valuationItem}>
                                                <Text style={styles.valuationLabel}>Current Value</Text>
                                                <Text style={styles.valuationValueCurrent}>
                                                    ${parseFloat(wine.currentValue).toFixed(2)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {wine.purchasePrice && wine.currentValue && (
                                        <View style={styles.valuationChange}>
                                            {parseFloat(wine.currentValue) > parseFloat(wine.purchasePrice) ? (
                                                <Text style={styles.valuationGain}>
                                                    📈 +${(parseFloat(wine.currentValue) - parseFloat(wine.purchasePrice)).toFixed(2)} per bottle
                                                </Text>
                                            ) : parseFloat(wine.currentValue) < parseFloat(wine.purchasePrice) ? (
                                                <Text style={styles.valuationLoss}>
                                                    📉 -${(parseFloat(wine.purchasePrice) - parseFloat(wine.currentValue)).toFixed(2)} per bottle
                                                </Text>
                                            ) : (
                                                <Text style={styles.valuationNeutral}>No change in value</Text>
                                            )}
                                        </View>
                                    )}
                                    {wine.purchaseLocation && (
                                        <InfoRow label="Purchased From" value={wine.purchaseLocation} icon="store" />
                                    )}
                                    {wine.purchaseDate && (
                                        <InfoRow
                                            label="Purchase Date"
                                            value={new Date(wine.purchaseDate).toLocaleDateString()}
                                            icon="calendar-clock"
                                        />
                                    )}
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Drinking Window */}
                    {(wine.drinkFrom || wine.drinkTo || wine.peakDrinking) && (
                        <>
                            <Text style={styles.sectionTitle}>Drinking Window</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.drinkingWindow}>
                                        {wine.drinkFrom && (
                                            <View style={styles.drinkingWindowItem}>
                                                <Text style={styles.drinkingWindowLabel}>Drink From</Text>
                                                <Text style={styles.drinkingWindowYear}>{wine.drinkFrom}</Text>
                                            </View>
                                        )}
                                        {wine.peakDrinking && (
                                            <View style={styles.drinkingWindowItem}>
                                                <Text style={styles.drinkingWindowLabel}>Peak</Text>
                                                <Text style={[styles.drinkingWindowYear, styles.peakYear]}>
                                                    {wine.peakDrinking}
                                                </Text>
                                            </View>
                                        )}
                                        {wine.drinkTo && (
                                            <View style={styles.drinkingWindowItem}>
                                                <Text style={styles.drinkingWindowLabel}>Drink By</Text>
                                                <Text style={styles.drinkingWindowYear}>{wine.drinkTo}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {wine.drinkTo && wine.drinkTo < new Date().getFullYear() && (
                                        <View style={styles.warningBanner}>
                                            <MaterialCommunityIcons name="alert" size={20} color="#d32f2f" />
                                            <Text style={styles.warningText}>Past optimal drinking window</Text>
                                        </View>
                                    )}
                                    {wine.drinkFrom && wine.drinkFrom <= new Date().getFullYear() && (!wine.drinkTo || wine.drinkTo >= new Date().getFullYear()) && (
                                        <View style={styles.readyBanner}>
                                            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                                            <Text style={styles.readyText}>Ready to drink now!</Text>
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Storage Location */}
                    {(wine.location || wine.binNumber || wine.rackNumber) && (
                        <>
                            <Text style={styles.sectionTitle}>Storage</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <InfoRow label="Location" value={wine.location} icon="home" />
                                    <View style={styles.storageGrid}>
                                        {wine.rackNumber && (
                                            <View style={styles.storageItem}>
                                                <Text style={styles.storageLabel}>Rack</Text>
                                                <Text style={styles.storageValue}>{wine.rackNumber}</Text>
                                            </View>
                                        )}
                                        {wine.binNumber && (
                                            <View style={styles.storageItem}>
                                                <Text style={styles.storageLabel}>Bin</Text>
                                                <Text style={styles.storageValue}>{wine.binNumber}</Text>
                                            </View>
                                        )}
                                        {wine.cellarZone && (
                                            <View style={styles.storageItem}>
                                                <Text style={styles.storageLabel}>Zone</Text>
                                                <Text style={styles.storageValue}>{wine.cellarZone}</Text>
                                            </View>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Ratings */}
                    {(wine.personalRating || wine.criticsRating) && (
                        <>
                            <Text style={styles.sectionTitle}>Ratings</Text>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.ratingsGrid}>
                                        {wine.personalRating && (
                                            <View style={styles.ratingItem}>
                                                <Text style={styles.ratingLabel}>Your Rating</Text>
                                                <View style={styles.ratingScore}>
                                                    <Text style={styles.ratingValue}>{wine.personalRating}</Text>
                                                    <Text style={styles.ratingMax}>/100</Text>
                                                </View>
                                            </View>
                                        )}
                                        {wine.criticsRating && (
                                            <View style={styles.ratingItem}>
                                                <Text style={styles.ratingLabel}>
                                                    {wine.criticName || 'Critics Rating'}
                                                </Text>
                                                <View style={styles.ratingScore}>
                                                    <Text style={styles.ratingValue}>{wine.criticsRating}</Text>
                                                    <Text style={styles.ratingMax}>/100</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        </>
                    )}

                    {/* Notes */}
                    {(wine.tastingNotes || wine.personalNotes) && (
                        <>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            {wine.tastingNotes && (
                                <Card style={styles.card}>
                                    <Card.Content>
                                        <Text style={styles.notesTitle}>Tasting Notes</Text>
                                        <Text style={styles.notesText}>{wine.tastingNotes}</Text>
                                    </Card.Content>
                                </Card>
                            )}
                            {wine.personalNotes && (
                                <Card style={styles.card}>
                                    <Card.Content>
                                        <Text style={styles.notesTitle}>Personal Notes</Text>
                                        <Text style={styles.notesText}>{wine.personalNotes}</Text>
                                    </Card.Content>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Additional Details */}
                    <Text style={styles.sectionTitle}>Details</Text>
                    <Card style={styles.card}>
                        <Card.Content>
                            <InfoRow label="Bottle Size" value={wine.bottleSize.replace('_', ' ')} icon="bottle-wine-outline" />
                            {wine.sweetness && (
                                <InfoRow label="Sweetness" value={wine.sweetness.replace('_', ' ')} icon="water" />
                            )}
                        </Card.Content>
                    </Card>

                    {/* Tags */}
                    {wine.tags && wine.tags.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Tags</Text>
                            <View style={styles.tagsContainer}>
                                {wine.tags.map((tag: any) => (
                                    <Chip
                                        key={tag.id}
                                        style={[styles.tag, { backgroundColor: tag.color || '#e0e0e0' }]}
                                        textStyle={styles.tagText}
                                    >
                                        {tag.name}
                                    </Chip>
                                ))}
                            </View>
                        </>
                    )}
                    <View style={styles.spacer} />

                    {/* Quick Photo Actions */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Photos</Text>
                            <View style={styles.photoActions}>
                                <Button
                                    mode="outlined"
                                    icon="camera"
                                    onPress={() => takePhoto()}
                                    disabled={uploading}
                                    style={styles.photoActionButton}
                                >
                                    Take Photo
                                </Button>
                                <Button
                                    mode="outlined"
                                    icon="image"
                                    onPress={() => pickFromLibrary()}
                                    disabled={uploading}
                                    style={styles.photoActionButton}
                                >
                                    Choose Photo
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>

                    <View style={styles.bottomSpacer} />
                </View>
            </ScrollView>

            {/* Photo Modal - FIXED VERSION */}
            <Portal>
                <Modal
                    visible={photoModalVisible}
                    onDismiss={() => {
                        setPhotoModalVisible(false);
                        setSelectedPhoto(null);
                    }}
                    contentContainerStyle={styles.photoModal}
                >
                    {selectedPhoto && (
                        <View style={styles.photoModalContent}>
                            {/* Close button at top */}
                            <IconButton
                                icon="close"
                                iconColor="#fff"
                                size={30}
                                onPress={() => {
                                    setPhotoModalVisible(false);
                                    setSelectedPhoto(null);
                                }}
                                style={styles.modalCloseButton}
                            />

                            {/* Full-size photo */}
                            <View style={styles.photoContainer}>
                                <Image
                                    source={{ uri: selectedPhoto.url }}
                                    style={styles.fullPhoto}
                                    resizeMode="contain"
                                    onError={(error) => {
                                        console.error('Modal photo failed to load:', error.nativeEvent);
                                        Alert.alert('Error', 'Failed to load photo');
                                    }}
                                />
                            </View>

                            {/* Action buttons at bottom */}
                            <View style={styles.photoModalActions}>
                                {!selectedPhoto.isPrimary && (
                                    <Button
                                        mode="contained"
                                        icon="star"
                                        onPress={() => handleSetPrimary(selectedPhoto)}
                                        style={styles.modalButton}
                                        buttonColor="#FFD700"
                                        textColor="#000"
                                    >
                                        Set as Primary
                                    </Button>
                                )}
                                {selectedPhoto.isPrimary && (
                                    <View style={styles.primaryIndicator}>
                                        <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
                                        <Text style={styles.primaryText}>Primary Photo</Text>
                                    </View>
                                )}
                                <Button
                                    mode="outlined"
                                    icon="delete"
                                    onPress={() => handleDeletePhoto(selectedPhoto)}
                                    style={styles.modalButton}
                                    textColor="#d32f2f"
                                >
                                    Delete Photo
                                </Button>
                            </View>
                        </View>
                    )}
                </Modal>
            </Portal>
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
        height: 300,
        backgroundColor: '#000',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c2c2c',
    },
    noPhotoText: {
        color: '#999',
        marginTop: 8,
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
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    uploadingText: {
        color: '#fff',
        marginTop: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    progressBar: {
        width: '80%',
        height: 8,
        borderRadius: 4,
    },
    photoGallery: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    thumbnailContainer: {
        marginHorizontal: 4,
        position: 'relative',
    },
    thumbnail: {
        width: 80,
        height: 100,
        borderRadius: 8,
    },
    primaryBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 4,
    },
    // FIXED PHOTO MODAL STYLES
    photoModal: {
        backgroundColor: '#000',
        margin: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    photoModalContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    photoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullPhoto: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.7,
    },
    photoModalActions: {
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        gap: 12,
    },
    modalButton: {
        marginVertical: 4,
    },
    primaryIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderRadius: 8,
        gap: 8,
    },
    primaryText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: '600',
    },
    photoActions: {
        flexDirection: 'row',
        gap: 8,
    },
    photoActionButton: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    wineName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2c2c2c',
        marginBottom: 8,
    },
    winery: {
        fontSize: 18,
        color: '#8B2E2E',
        fontWeight: '600',
        marginBottom: 12,
    },
    headerChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: '#f5f5f5',
    },
    typeChip: {
        backgroundColor: '#8B2E2E',
    },
    typeChipText: {
        color: '#fff',
    },
    statusChipReady: {
        backgroundColor: '#4CAF50',
        alignSelf: 'flex-start',
    },
    statusChipReserved: {
        backgroundColor: '#FFD700',
        alignSelf: 'flex-start',
    },
    statusChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    divider: {
        marginVertical: 16,
    },
    quantityCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c2c2c',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantityButton: {
        backgroundColor: '#f5f5f5',
        margin: 0,
    },
    quantityValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B2E2E',
        minWidth: 40,
        textAlign: 'center',
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
    valuationGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    valuationItem: {
        flex: 1,
    },
    valuationLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    valuationValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    valuationValueCurrent: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4CAF50',
    },
    valuationChange: {
        marginTop: 8,
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    valuationGain: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        textAlign: 'center',
    },
    valuationLoss: {
        fontSize: 14,
        color: '#d32f2f',
        fontWeight: '600',
        textAlign: 'center',
    },
    valuationNeutral: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    drinkingWindow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    drinkingWindowItem: {
        alignItems: 'center',
    },
    drinkingWindowLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    drinkingWindowYear: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    peakYear: {
        color: '#8B2E2E',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#ffebee',
        borderRadius: 8,
        gap: 8,
    },
    warningText: {
        color: '#d32f2f',
        fontWeight: '600',
    },
    readyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        gap: 8,
    },
    readyText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    storageGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    storageItem: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    storageLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    storageValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c2c2c',
    },
    ratingsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    ratingItem: {
        flex: 1,
        alignItems: 'center',
    },
    ratingLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    ratingScore: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    ratingValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#8B2E2E',
    },
    ratingMax: {
        fontSize: 16,
        color: '#666',
        marginLeft: 2,
    },
    notesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    notesText: {
        fontSize: 16,
        color: '#2c2c2c',
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        marginVertical: 4,
    },
    tagText: {
        color: '#fff',
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 100,
    },
    spacer: {
        height: 16,
    }
});