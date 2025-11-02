import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
    Modal as RNModal,
    TouchableOpacity
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    ActivityIndicator,
    IconButton,
    Surface,
    Divider
} from 'react-native-paper';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_WINE, UPDATE_WINE } from '../graphql/mutations/wines';
import { GET_WINES, GET_WINE } from '../graphql/queries/wines';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WinerySelector from '../components/WinerySelector';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDefaultWineValues } from '../hooks/useSettings';
import VarietalSelector from '@/components/VarietalSelector';
import {GET_WINERIES, GET_WINERY} from "@/graphql/queries/wineries";

type Props = NativeStackScreenProps<RootStackParamList, 'AddWine' | 'EditWine'>;

const wineTypes = [
    { value: 'RED', label: 'Red' },
    { value: 'WHITE', label: 'White' },
    { value: 'ROSE', label: 'Rosé' },
    { value: 'SPARKLING', label: 'Sparkling' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'FORTIFIED', label: 'Fortified' },
    { value: 'ORANGE', label: 'Orange' },
];

const bottleSizes = [
    { value: 'HALF', label: 'Half (375ml)' },
    { value: 'STANDARD', label: 'Standard (750ml)' },
    { value: 'MAGNUM', label: 'Magnum (1.5L)' },
    { value: 'DOUBLE_MAGNUM', label: 'Double Magnum (3L)' },
    { value: 'JEROBOAM', label: 'Jeroboam (4.5L)' },
    { value: 'IMPERIAL', label: 'Imperial (6L)' },
];

const sweetnessLevels = [
    { value: 'BONE_DRY', label: 'Bone Dry' },
    { value: 'DRY', label: 'Dry' },
    { value: 'OFF_DRY', label: 'Off Dry' },
    { value: 'MEDIUM_SWEET', label: 'Medium Sweet' },
    { value: 'SWEET', label: 'Sweet' },
    { value: 'VERY_SWEET', label: 'Very Sweet' },
];

const wineStatuses = [
    { value: 'IN_CELLAR', label: 'In Cellar' },
    { value: 'READY_TO_DRINK', label: 'Ready to Drink' },
    { value: 'RESERVED', label: 'Reserved' },
];

// Picker Modal Component
interface PickerModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (value: string) => void;
    options: { value: string; label: string }[];
    title: string;
    selectedValue: string;
}

 function PickerModal({ visible, onDismiss, onSelect, options, title, selectedValue }: PickerModalProps) {
    return (
        <RNModal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onDismiss}
        >
            <View style={styles.pickerOverlay}>
                <TouchableOpacity
                    style={styles.pickerOverlayTouchable}
                    activeOpacity={1}
                    onPress={onDismiss}
                />
                <View style={styles.pickerBottomContainer}>
                    <Surface style={styles.pickerContent} elevation={5}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>{title}</Text>
                            <IconButton icon="close" size={24} onPress={onDismiss} />
                        </View>
                        <ScrollView style={styles.pickerList} contentContainerStyle={styles.pickerListContent}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => {
                                        onSelect(option.value);
                                        onDismiss();
                                    }}
                                    style={styles.pickerItem}
                                >
                                    <Text style={[
                                        styles.pickerItemText,
                                        selectedValue === option.value && styles.pickerItemTextSelected
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {selectedValue === option.value && (
                                        <IconButton icon="check" size={20} iconColor="#8B2E2E" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Surface>
                </View>
            </View>
        </RNModal>
    );
}

export default function AddWineScreen({ navigation, route }: Props) {
    const { preselectedWineryId, preselectedWineryName } = route.params;
    const isEditing = route.name === 'EditWine';
    const wineId = isEditing ? (route.params as any).wineId : null;

    // Load default values from settings (only for new wines)
    const { bottleSize: defaultBottleSize, wineType: defaultWineType, loading: defaultsLoading } = useDefaultWineValues();

    // Fetch existing wine data if editing
    const { data: existingWineData, loading: loadingWine } = useQuery(GET_WINE, {
        variables: { id: wineId },
        skip: !isEditing,
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        wineryId: '',
        wineryName: '',
        vintage: '',
        varietalId: null as string | null,
        varietalName: '',
        region: '',
        subRegion: '',
        country: '',
        appellation: '',
        type: 'RED',
        sweetness: null as string | null,
        quantity: '1',
        bottleSize: 'STANDARD',
        purchaseDate: new Date(),
        purchasePrice: '',
        purchaseLocation: '',
        retailer: '',
        location: '',
        binNumber: '',
        rackNumber: '',
        cellarZone: '',
        drinkFrom: '',
        drinkTo: '',
        peakDrinking: '',
        personalRating: '',
        criticsRating: '',
        criticName: '',
        personalNotes: '',
        tastingNotes: '',
        currentValue: '',
        estimatedValue: '',
        status: 'IN_CELLAR',
    });

    const [defaultsApplied, setDefaultsApplied] = useState(false);

    // Apply default settings for NEW wines only (when not editing)
    useEffect(() => {
        if (!isEditing && !defaultsLoading && !defaultsApplied) {
            setFormData(prev => ({
                ...prev,
                bottleSize: defaultBottleSize,
                type: defaultWineType,
            }));
            setDefaultsApplied(true);
        }
    }, [isEditing, defaultsLoading, defaultBottleSize, defaultWineType, defaultsApplied]);

    // Populate form when editing
    useEffect(() => {
        if (preselectedWineryId && preselectedWineryName && !isEditing) {
            setFormData(prev => ({
                ...prev,
                wineryId: preselectedWineryId,
                wineryName: preselectedWineryName
            }));
        }
        if (isEditing && existingWineData?.wine) {
            const wine = existingWineData.wine;
            setFormData({
                name: wine.name || '',
                wineryId: wine.winery.id || '',
                wineryName: wine.winery.name || '',
                vintage: wine.vintage ? String(wine.vintage) : '',
                varietalId: wine.varietal?.id || null,
                varietalName: wine.varietal?.name || '',
                region: wine.region || '',
                subRegion: wine.subRegion || '',
                country: wine.country || '',
                appellation: wine.appellation || '',
                type: wine.type || 'RED',
                sweetness: wine.sweetness || null,
                quantity: String(wine.quantity || 1),
                bottleSize: wine.bottleSize || 'STANDARD',
                purchaseDate: wine.purchaseDate ? new Date(wine.purchaseDate) : new Date(),
                purchasePrice: wine.purchasePrice ? String(wine.purchasePrice) : '',
                purchaseLocation: wine.purchaseLocation || '',
                retailer: wine.retailer || '',
                location: wine.location || '',
                binNumber: wine.binNumber || '',
                rackNumber: wine.rackNumber || '',
                cellarZone: wine.cellarZone || '',
                drinkFrom: wine.drinkFrom ? String(wine.drinkFrom) : '',
                drinkTo: wine.drinkTo ? String(wine.drinkTo) : '',
                peakDrinking: wine.peakDrinking ? String(wine.peakDrinking) : '',
                personalRating: wine.personalRating ? String(wine.personalRating) : '',
                criticsRating: wine.criticsRating ? String(wine.criticsRating) : '',
                criticName: wine.criticName || '',
                personalNotes: wine.personalNotes || '',
                tastingNotes: wine.tastingNotes || '',
                currentValue: wine.currentValue ? String(wine.currentValue) : '',
                estimatedValue: wine.estimatedValue ? String(wine.estimatedValue) : '',
                status: wine.status || 'IN_CELLAR',
            });
        }
    }, [isEditing, existingWineData, preselectedWineryId, preselectedWineryName]);

    const [showWinerySelector, setShowWinerySelector] = useState(false);
    const [showVarietalSelector, setShowVarietalSelector] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showBottleSizeModal, setShowBottleSizeModal] = useState(false);
    const [showSweetnessModal, setShowSweetnessModal] = useState(false);
    const [showWineTypeModal, setShowWineTypeModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    const [createWine, { loading: creating }] = useMutation(CREATE_WINE, {
        refetchQueries: [{ query: GET_WINES, variables: { take: 10000 } },
            { query: GET_WINERY, variables: { id: formData.wineryId } },
            { query: GET_WINERIES, variables: { take: 1000 } }
        ],
    });

    const [updateWine, { loading: updating }] = useMutation(UPDATE_WINE, {
        refetchQueries: [
            { query: GET_WINES, variables: { take: 10000 } },
            { query: GET_WINE, variables: { id: wineId } },
        ],
    });

    const isLoading = creating || updating;

    // Check if form is valid
    const hasName = formData.name.trim().length > 0;
    const hasWinery = formData.wineryId.length > 0;
    const hasValidQuantity = formData.quantity.length > 0 && parseInt(formData.quantity) > 0;
    const isFormValid = hasName && hasWinery && hasValidQuantity;

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleVarietalSelect = (varietalId: string, varietalName: string) => {
        setFormData({
            ...formData,
            varietalId,
            varietalName,
        });
        setShowVarietalSelector(false);
    };

    const handleClearVarietal = () => {
        setFormData({
            ...formData,
            varietalId: null,
            varietalName: '',
        });
    };

    const handleSubmit = async () => {
        const variables = {
            input: {
                name: formData.name,
                wineryId: formData.wineryId,
                vintage: formData.vintage ? parseInt(formData.vintage) : null,
                varietalId: formData.varietalId || null,
                region: formData.region || null,
                subRegion: formData.subRegion || null,
                country: formData.country || null,
                appellation: formData.appellation || null,
                type: formData.type,
                sweetness: formData.sweetness,
                quantity: parseInt(formData.quantity) || 1,
                bottleSize: formData.bottleSize,
                purchaseDate: formData.purchaseDate.toISOString(),
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
                purchaseLocation: formData.purchaseLocation || null,
                retailer: formData.retailer || null,
                location: formData.location || null,
                binNumber: formData.binNumber || null,
                rackNumber: formData.rackNumber || null,
                cellarZone: formData.cellarZone || null,
                drinkFrom: formData.drinkFrom ? parseInt(formData.drinkFrom) : null,
                drinkTo: formData.drinkTo ? parseInt(formData.drinkTo) : null,
                peakDrinking: formData.peakDrinking ? parseInt(formData.peakDrinking) : null,
                personalRating: formData.personalRating ? parseInt(formData.personalRating) : null,
                criticsRating: formData.criticsRating ? parseInt(formData.criticsRating) : null,
                criticName: formData.criticName || null,
                personalNotes: formData.personalNotes || null,
                tastingNotes: formData.tastingNotes || null,
                currentValue: formData.currentValue ? parseFloat(formData.currentValue) : null,
                estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
                status: formData.status,
            },
        };

        try {
            if (isEditing) {
                await updateWine({
                    variables: {
                        id: wineId,
                        ...variables,
                    },
                });
                Alert.alert('Success', 'Wine updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                await createWine({ variables });
                Alert.alert('Success', 'Wine added to your cellar!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || `Failed to ${isEditing ? 'update' : 'add'} wine`);
        }
    };

    if (isEditing && loadingWine) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading wine details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* Essential Information */}
                <Text style={styles.sectionTitle}>Essential Information</Text>

                {/* Winery Selection */}
                <View style={styles.field}>
                    <Text style={styles.label}>Winery *</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowWinerySelector(true)}
                        icon={formData.wineryId ? "check-circle" : "domain"}
                        style={styles.wineryButton}
                    >
                        {formData.wineryName || 'Select Winery'}
                    </Button>
                </View>

                {/* Wine Name */}
                <TextInput
                    label="Wine Name *"
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Cabernet Sauvignon Reserve"
                />

                {/* Vintage */}
                <TextInput
                    label="Vintage"
                    value={formData.vintage}
                    onChangeText={(text) => updateField('vintage', text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="e.g., 2018"
                    maxLength={4}
                />

                {/* Wine Type */}
                <View style={styles.field}>
                    <Text style={styles.label}>Wine Type</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowWineTypeModal(true)}
                        icon="water"
                        style={styles.menuButton}
                    >
                        {wineTypes.find(t => t.value === formData.type)?.label || 'Select Type'}
                    </Button>
                </View>

                {/* Varietal Selector */}
                <View style={styles.field}>
                    <Text style={styles.label}>Varietal/Blend</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowVarietalSelector(true)}
                        icon="fruit-grapes"
                        style={styles.varietalButton}
                    >
                        {formData.varietalName || 'Select Varietal'}
                    </Button>
                </View>

                {/* Quantity */}
                <TextInput
                    label="Quantity *"
                    value={formData.quantity}
                    onChangeText={(text) => updateField('quantity', text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                />

                <Divider style={styles.divider} />

                {/* Additional Details */}
                <Text style={styles.sectionTitle}>Additional Details</Text>

                {/* Bottle Size */}
                <View style={styles.field}>
                    <Text style={styles.label}>Bottle Size</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowBottleSizeModal(true)}
                        icon="bottle-wine"
                        style={styles.menuButton}
                    >
                        {bottleSizes.find(s => s.value === formData.bottleSize)?.label || 'Select Size'}
                    </Button>
                </View>

                {/* Sweetness */}
                <View style={styles.field}>
                    <Text style={styles.label}>Sweetness</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowSweetnessModal(true)}
                        icon="water"
                        style={styles.menuButton}
                    >
                        {sweetnessLevels.find(s => s.value === formData.sweetness)?.label || 'Select Sweetness'}
                    </Button>
                </View>

                {/* Status */}
                <View style={styles.field}>
                    <Text style={styles.label}>Status</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowStatusModal(true)}
                        icon="information"
                        style={styles.menuButton}
                    >
                        {wineStatuses.find(s => s.value === formData.status)?.label || 'Select Status'}
                    </Button>
                </View>

                <Divider style={styles.divider} />

                {/* Location Details */}
                <Text style={styles.sectionTitle}>Location & Origin</Text>

                <View style={styles.row}>
                    <TextInput
                        label="Region"
                        value={formData.region}
                        onChangeText={(text) => updateField('region', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        placeholder="e.g., Napa Valley"
                    />
                    <TextInput
                        label="Country"
                        value={formData.country}
                        onChangeText={(text) => updateField('country', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        placeholder="e.g., USA"
                    />
                </View>

                <TextInput
                    label="Sub-Region"
                    value={formData.subRegion}
                    onChangeText={(text) => updateField('subRegion', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Oakville"
                />

                <TextInput
                    label="Appellation"
                    value={formData.appellation}
                    onChangeText={(text) => updateField('appellation', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Oakville AVA"
                />

                <Divider style={styles.divider} />

                {/* Purchase Information */}
                <Text style={styles.sectionTitle}>Purchase Information</Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Purchase Date</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowDatePicker(true)}
                        icon="calendar"
                        style={styles.dateButton}
                    >
                        {formData.purchaseDate.toLocaleDateString()}
                    </Button>
                </View>

                {Platform.OS === 'ios' && showDatePicker && (
                    <RNModal
                        visible={showDatePicker}
                        animationType="fade"
                        transparent={true}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={styles.pickerOverlay}>
                            <TouchableOpacity
                                style={styles.pickerOverlayTouchable}
                                activeOpacity={1}
                                onPress={() => setShowDatePicker(false)}
                            />
                            <View style={styles.datePickerModalContainer}>
                                <View style={styles.datePickerHeader}>
                                    <Button onPress={() => setShowDatePicker(false)}>
                                        Cancel
                                    </Button>
                                    <Text style={styles.datePickerTitle}>Select Date</Text>
                                    <Button
                                        onPress={() => setShowDatePicker(false)}
                                        textColor="#8B2E2E"
                                    >
                                        Done
                                    </Button>
                                </View>
                                <View style={styles.datePickerWrapper}>
                                    <DateTimePicker
                                        value={formData.purchaseDate}
                                        mode="date"
                                        display="spinner"
                                        onChange={(event, selectedDate) => {
                                            if (selectedDate) {
                                                updateField('purchaseDate', selectedDate);
                                            }
                                        }}
                                        style={styles.iosDatePicker}
                                        textColor="#000000"
                                    />
                                </View>
                            </View>
                        </View>
                    </RNModal>
                )}

                {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                        value={formData.purchaseDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                updateField('purchaseDate', selectedDate);
                            }
                        }}
                    />
                )}

                <View style={styles.row}>
                    <TextInput
                        label="Purchase Price"
                        value={formData.purchasePrice}
                        onChangeText={(text) => updateField('purchasePrice', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        keyboardType="decimal-pad"
                        left={<TextInput.Affix text="$" />}
                    />
                    <TextInput
                        label="Current Value"
                        value={formData.currentValue}
                        onChangeText={(text) => updateField('currentValue', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        keyboardType="decimal-pad"
                        left={<TextInput.Affix text="$" />}
                    />
                </View>

                <TextInput
                    label="Purchase Location"
                    value={formData.purchaseLocation}
                    onChangeText={(text) => updateField('purchaseLocation', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Wine Shop, Winery Direct"
                />

                <TextInput
                    label="Retailer"
                    value={formData.retailer}
                    onChangeText={(text) => updateField('retailer', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., K&L Wine Merchants"
                />

                <Divider style={styles.divider} />

                {/* Storage */}
                <Text style={styles.sectionTitle}>Storage Location</Text>

                <TextInput
                    label="Location"
                    value={formData.location}
                    onChangeText={(text) => updateField('location', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Main Cellar, Wine Fridge"
                />

                <View style={styles.row}>
                    <TextInput
                        label="Rack Number"
                        value={formData.rackNumber}
                        onChangeText={(text) => updateField('rackNumber', text)}
                        mode="outlined"
                        style={[styles.input, styles.thirdWidth]}
                        placeholder="A1"
                    />
                    <TextInput
                        label="Bin Number"
                        value={formData.binNumber}
                        onChangeText={(text) => updateField('binNumber', text)}
                        mode="outlined"
                        style={[styles.input, styles.thirdWidth]}
                        placeholder="12"
                    />
                    <TextInput
                        label="Zone"
                        value={formData.cellarZone}
                        onChangeText={(text) => updateField('cellarZone', text)}
                        mode="outlined"
                        style={[styles.input, styles.thirdWidth]}
                        placeholder="Zone 1"
                    />
                </View>

                <Divider style={styles.divider} />

                {/* Drinking Window */}
                <Text style={styles.sectionTitle}>Drinking Window</Text>

                <View style={styles.row}>
                    <TextInput
                        label="Drink From"
                        value={formData.drinkFrom}
                        onChangeText={(text) => updateField('drinkFrom', text)}
                        mode="outlined"
                        style={[styles.input, styles.thirdWidth]}
                        keyboardType="numeric"
                        placeholder="2025"
                        maxLength={4}
                    />
                    <TextInput
                        label="Peak Year"
                        value={formData.peakDrinking}
                        onChangeText={(text) => updateField('peakDrinking', text)}
                        mode="outlined"
                        style={[styles.input, styles.thirdWidth]}
                        keyboardType="numeric"
                        placeholder="2030"
                        maxLength={4}
                    />
                    <TextInput
                        label="Drink To"
                        value={formData.drinkTo}
                        onChangeText={(text) => updateField('drinkTo', text)}
                        mode="outlined"
                        style={[styles.input, styles.thirdWidth]}
                        keyboardType="numeric"
                        placeholder="2040"
                        maxLength={4}
                    />
                </View>

                <Divider style={styles.divider} />

                {/* Ratings & Reviews */}
                <Text style={styles.sectionTitle}>Ratings & Notes</Text>

                <View style={styles.row}>
                    <TextInput
                        label="Personal Rating"
                        value={formData.personalRating}
                        onChangeText={(text) => updateField('personalRating', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        keyboardType="numeric"
                        placeholder="1-100"
                        maxLength={3}
                    />
                    <TextInput
                        label="Critics Rating"
                        value={formData.criticsRating}
                        onChangeText={(text) => updateField('criticsRating', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        keyboardType="numeric"
                        placeholder="1-100"
                        maxLength={3}
                    />
                </View>

                <TextInput
                    label="Critic Name"
                    value={formData.criticName}
                    onChangeText={(text) => updateField('criticName', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Robert Parker, Wine Spectator"
                />

                <TextInput
                    label="Personal Notes"
                    value={formData.personalNotes}
                    onChangeText={(text) => updateField('personalNotes', text)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="Your thoughts about this wine..."
                />

                <TextInput
                    label="Tasting Notes"
                    value={formData.tastingNotes}
                    onChangeText={(text) => updateField('tastingNotes', text)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="Aromas, flavors, structure..."
                />

                {/* Bottom spacer for fixed buttons */}
                <View style={styles.scrollBottomSpacer} />
            </ScrollView>

            {/* Fixed Bottom Buttons */}
            <View style={styles.fixedButtonContainer}>
                <View style={styles.buttonRow}>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                        style={styles.cancelButtonInline}
                        contentStyle={styles.buttonContent}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={!isFormValid || isLoading}
                        style={[
                            styles.submitButtonInline,
                            (!isFormValid || isLoading) && styles.submitButtonDisabled
                        ]}
                        contentStyle={styles.buttonContent}
                        icon="check"
                    >
                        {isEditing ? 'Update Wine' : 'Add Wine'}
                    </Button>
                </View>
                {!isFormValid && !isLoading && (
                    <Text style={styles.validationHint}>
                        Please fill in wine name, winery, and quantity
                    </Text>
                )}
            </View>

            {/* Winery Selector Modal */}
            <WinerySelector
                visible={showWinerySelector}
                onDismiss={() => setShowWinerySelector(false)}
                onSelect={(wineryId, wineryName) => {
                    setFormData(prev => ({
                        ...prev,
                        wineryId: wineryId,
                        wineryName: wineryName
                    }));
                }}
            />

            {/* Varietal Selector Modal */}
            <VarietalSelector
                visible={showVarietalSelector}
                onDismiss={() => setShowVarietalSelector(false)}
                onSelect={handleVarietalSelect}
                selectedVarietalId={formData.varietalId}
                wineType={formData.type}
            />

            {/* Wine Type Picker */}
            <PickerModal
                visible={showWineTypeModal}
                onDismiss={() => setShowWineTypeModal(false)}
                onSelect={(value) => updateField('type', value)}
                options={wineTypes}
                title="Select Wine Type"
                selectedValue={formData.type}
            />

            {/* Bottle Size Picker */}
            <PickerModal
                visible={showBottleSizeModal}
                onDismiss={() => setShowBottleSizeModal(false)}
                onSelect={(value) => updateField('bottleSize', value)}
                options={bottleSizes}
                title="Select Bottle Size"
                selectedValue={formData.bottleSize}
            />

            {/* Sweetness Picker */}
            <PickerModal
                visible={showSweetnessModal}
                onDismiss={() => setShowSweetnessModal(false)}
                onSelect={(value) => updateField('sweetness', value)}
                options={sweetnessLevels}
                title="Select Sweetness Level"
                selectedValue={formData.sweetness || ''}
            />

            {/* Status Picker */}
            <PickerModal
                visible={showStatusModal}
                onDismiss={() => setShowStatusModal(false)}
                onSelect={(value) => updateField('status', value)}
                options={wineStatuses}
                title="Select Status"
                selectedValue={formData.status}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#8B2E2E',
        marginTop: 16,
        marginBottom: 12,
    },
    defaultsHint: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    defaultsHintText: {
        fontSize: 13,
        color: '#1565C0',
        lineHeight: 18,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    thirdWidth: {
        flex: 1,
    },
    wineryButton: {
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    varietalButton: {
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    varietalChipContainer: {
        marginTop: 8,
    },
    varietalChip: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
    },
    dateButton: {
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    menuButton: {
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    segmentedButtons: {
        marginBottom: 8,
    },
    moreTypesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        marginVertical: 4,
    },
    validField: {
        borderColor: '#4CAF50',
        borderWidth: 1,
    },
    divider: {
        marginVertical: 16,
    },
    scrollBottomSpacer: {
        height: 100,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    submitButtonInline: {
        flex: 2,
        backgroundColor: '#8B2E2E',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    cancelButtonInline: {
        flex: 1,
        borderColor: '#8B2E2E',
    },
    buttonContent: {
        height: 48,
    },
    validationHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    // Picker Modal Styles
    pickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    pickerOverlayTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerBottomContainer: {
        // Ensures content stays at bottom
    },
    pickerContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 0,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c2c2c',
    },
    pickerList: {
        maxHeight: 400,
    },
    pickerListContent: {
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    pickerItemText: {
        fontSize: 16,
        color: '#2c2c2c',
    },
    pickerItemTextSelected: {
        fontWeight: '600',
        color: '#8B2E2E',
    },
    datePickerModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    datePickerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    datePickerWrapper: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        minHeight: 216, // Important: iOS picker needs minimum height
    },
    iosDatePicker: {
        height: 216, // Fixed height for iOS picker
        backgroundColor: '#fff',
    },
});