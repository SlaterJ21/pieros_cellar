// src/screens/AddVarietalScreen.tsx
import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {
    TextInput,
    Button,
    Chip,
    Text,
    ActivityIndicator,
} from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp , useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import PickerModal from '../components/PickerModal';
import { CREATE_VARIETAL, UPDATE_VARIETAL } from '@/graphql/mutations/varietals';
import { GET_VARIETAL } from '@/graphql/queries/varietals';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddVarietalRouteProp = RouteProp<RootStackParamList, 'EditVarietal'>;
const wineTypes = [
    { value: 'RED', label: 'Red' },
    { value: 'WHITE', label: 'White' },
    { value: 'ROSE', label: 'Rosé' },
    { value: 'SPARKLING', label: 'Sparkling' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'FORTIFIED', label: 'Fortified' },
    { value: 'ORANGE', label: 'Orange' },
];
export default function AddVarietalScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<AddVarietalRouteProp>();
    const varietalId = route.params?.varietalId;
    const isEditing = !!varietalId;

    const [name, setName] = useState('');
    const [type, setType] = useState<string>('RED');
    const [description, setDescription] = useState('');
    const [commonRegions, setCommonRegions] = useState<string[]>([]);
    const [characteristics, setCharacteristics] = useState<string[]>([]);
    const [aliases, setAliases] = useState<string[]>([]);
    const [regionInput, setRegionInput] = useState('');
    const [characteristicInput, setCharacteristicInput] = useState('');
    const [aliasInput, setAliasInput] = useState('');

    const { data, loading: loadingVarietal } = useQuery(GET_VARIETAL, {
        variables: { id: varietalId },
        skip: !isEditing,
        onCompleted: (data) => {
            if (data?.varietal) {
                const v = data.varietal;
                setName(v.name || '');
                setType(v.type || 'RED');
                setDescription(v.description || '');
                setCommonRegions(v.commonRegions || []);
                setCharacteristics(v.characteristics || []);
                setAliases(v.aliases || []);
            }
        },
    });

    const [createVarietal, { loading: creating }] = useMutation(CREATE_VARIETAL, {
        refetchQueries: ['GetVarietals'],
    });

    const [updateVarietal, { loading: updating }] = useMutation(UPDATE_VARIETAL, {
        refetchQueries: ['GetVarietals', 'GetVarietal'],
    });

    const handleAddRegion = () => {
        if (regionInput.trim()) {
            setCommonRegions([...commonRegions, regionInput.trim()]);
            setRegionInput('');
        }
    };

    const handleRemoveRegion = (index: number) => {
        setCommonRegions(commonRegions.filter((_, i) => i !== index));
    };

    const handleAddCharacteristic = () => {
        if (characteristicInput.trim()) {
            setCharacteristics([...characteristics, characteristicInput.trim()]);
            setCharacteristicInput('');
        }
    };

    const handleRemoveCharacteristic = (index: number) => {
        setCharacteristics(characteristics.filter((_, i) => i !== index));
    };

    const handleAddAlias = () => {
        if (aliasInput.trim()) {
            setAliases([...aliases, aliasInput.trim()]);
            setAliasInput('');
        }
    };

    const handleRemoveAlias = (index: number) => {
        setAliases(aliases.filter((_, i) => i !== index));
    };

    const [showWineTypeModal, setShowWineTypeModal] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a varietal name');
            return;
        }

        const input = {
            name: name.trim(),
            type,
            description: description.trim() || null,
            commonRegions: commonRegions.length > 0 ? commonRegions : null,
            characteristics: characteristics.length > 0 ? characteristics : null,
            aliases: aliases.length > 0 ? aliases : null,
        };

        try {
            if (isEditing) {
                await updateVarietal({
                    variables: { id: varietalId, input },
                });
                Alert.alert('Success', 'Varietal updated successfully');
            } else {
                await createVarietal({
                    variables: { input },
                });
                Alert.alert('Success', 'Varietal created successfully');
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save varietal');
        }
    };

    if (loadingVarietal) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading varietal...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Name */}
                <TextInput
                    label="Varietal Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Cabernet Sauvignon"
                />

                {/* Type */}
                <View style={styles.field}>
                    <Text style={styles.label}>Wine Type</Text>
                    <Button
                        mode="outlined"
                        onPress={() => setShowWineTypeModal(true)}
                        icon="water"
                        style={styles.menuButton}
                    >
                        {wineTypes.find(t => t.value === type)?.label || 'Select Type'}
                    </Button>
                </View>


                {/* Wine Type Picker */}
                <PickerModal
                    visible={showWineTypeModal}
                    onDismiss={() => setShowWineTypeModal(false)}
                    onSelect={setType}
                    options={wineTypes}
                    title="Select Wine Type"
                    selectedValue={type}
                />

                {/* Description */}
                <TextInput
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="Brief description of this varietal..."
                />

                {/* Common Regions */}
                <Text style={styles.label}>Common Regions</Text>
                <View style={styles.chipInputRow}>
                    <TextInput
                        value={regionInput}
                        onChangeText={setRegionInput}
                        mode="outlined"
                        style={styles.chipInput}
                        placeholder="e.g., Bordeaux"
                        onSubmitEditing={handleAddRegion}
                    />
                    <Button mode="contained" onPress={handleAddRegion} style={styles.addButton}>
                        Add
                    </Button>
                </View>
                <View style={styles.chipContainer}>
                    {commonRegions.map((region, index) => (
                        <Chip
                            key={index}
                            onClose={() => handleRemoveRegion(index)}
                            style={styles.chip}
                        >
                            {region}
                        </Chip>
                    ))}
                </View>

                {/* Characteristics */}
                <Text style={styles.label}>Characteristics</Text>
                <View style={styles.chipInputRow}>
                    <TextInput
                        value={characteristicInput}
                        onChangeText={setCharacteristicInput}
                        mode="outlined"
                        style={styles.chipInput}
                        placeholder="e.g., Full-bodied"
                        onSubmitEditing={handleAddCharacteristic}
                    />
                    <Button mode="contained" onPress={handleAddCharacteristic} style={styles.addButton}>
                        Add
                    </Button>
                </View>
                <View style={styles.chipContainer}>
                    {characteristics.map((char, index) => (
                        <Chip
                            key={index}
                            onClose={() => handleRemoveCharacteristic(index)}
                            style={styles.chip}
                        >
                            {char}
                        </Chip>
                    ))}
                </View>

                {/* Aliases */}
                <Text style={styles.label}>Aliases / Other Names</Text>
                <View style={styles.chipInputRow}>
                    <TextInput
                        value={aliasInput}
                        onChangeText={setAliasInput}
                        mode="outlined"
                        style={styles.chipInput}
                        placeholder="e.g., Shiraz"
                        onSubmitEditing={handleAddAlias}
                    />
                    <Button mode="contained" onPress={handleAddAlias} style={styles.addButton}>
                        Add
                    </Button>
                </View>
                <View style={styles.chipContainer}>
                    {aliases.map((alias, index) => (
                        <Chip
                            key={index}
                            onClose={() => handleRemoveAlias(index)}
                            style={styles.chip}
                        >
                            {alias}
                        </Chip>
                    ))}
                </View>

                {/* Submit Button */}
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={creating || updating}
                    disabled={creating || updating}
                >
                    {isEditing ? 'Update Varietal' : 'Create Varietal'}
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
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
    content: {
        padding: 16,
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
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c2c2c',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    segmentedButtons: {
        marginBottom: 16,
    },
    chipInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    chipInput: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#8B2E2E',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
        marginHorizontal: -4,
    },
    chip: {
        marginHorizontal: 4,
        marginVertical: 4,
    },
    submitButton: {
        marginTop: 24,
        marginBottom: 32,
        backgroundColor: '#8B2E2E',
        paddingVertical: 8,
    },
    field: {
        marginBottom: 16,
    },
    menuButton: {
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
});