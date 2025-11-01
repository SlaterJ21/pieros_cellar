// src/screens/AddWineryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    ActivityIndicator,
    Divider
} from 'react-native-paper';
import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { GET_WINES } from '../graphql/queries/wines';
import { CREATE_WINERY, UPDATE_WINERY } from '../graphql/mutations/wineries';
import { GET_WINERY, GET_WINERIES } from '../graphql/queries/wineries';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddWinery' | 'EditWinery'>;

export default function AddWineryScreen({ navigation, route }: Props) {
    const isEditing = route.name === 'EditWinery';
    const wineryId = isEditing ? (route.params as any).wineryId : null;

    // Fetch existing winery data if editing
    const { data: existingWineryData, loading: loadingWinery } = useQuery(GET_WINERY, {
        variables: { id: wineryId },
        skip: !isEditing,
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        region: '',
        country: '',
        website: '',
        description: '',
        email: '',
        phone: '',
        foundedYear: '',
        logo: '',
    });

    // Populate form when editing
    useEffect(() => {
        if (isEditing && existingWineryData?.winery) {
            const winery = existingWineryData.winery;
            setFormData({
                name: winery.name || '',
                region: winery.region || '',
                country: winery.country || '',
                website: winery.website || '',
                description: winery.description || '',
                email: winery.email || '',
                phone: winery.phone || '',
                foundedYear: winery.foundedYear ? String(winery.foundedYear) : '',
                logo: winery.logo || '',
            });
        }
    }, [isEditing, existingWineryData]);

    const [createWinery, { loading: creating }] = useMutation(CREATE_WINERY, {
        refetchQueries: [
            { query: GET_WINES, variables: { take: 10000 } },
            { query: GET_WINERIES },
        ],
    });

    const [updateWinery, { loading: updating }] = useMutation(UPDATE_WINERY, {
        refetchQueries: [
            { query: GET_WINES, variables: { take: 10000 } },
            { query: GET_WINERIES },
            { query: GET_WINERY, variables: { id: wineryId } },
        ],
    });

    const isLoading = creating || updating;

    // Check if form is valid
    const hasName = formData.name.trim().length > 0;
    const isFormValid = hasName;

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        const variables = {
            input: {
                name: formData.name,
                region: formData.region || null,
                country: formData.country || null,
                website: formData.website || null,
                description: formData.description || null,
                email: formData.email || null,
                phone: formData.phone || null,
                foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
                logo: formData.logo || null,
            },
        };

        try {
            if (isEditing) {
                await updateWinery({
                    variables: {
                        id: wineryId,
                        ...variables,
                    },
                });
                Alert.alert('Success', 'Winery updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                await createWinery({ variables });
                Alert.alert('Success', 'Winery added!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || `Failed to ${isEditing ? 'update' : 'add'} winery`);
        }
    };

    if (isEditing && loadingWinery) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading winery details...</Text>
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

                {/* Winery Name */}
                <TextInput
                    label="Winery Name *"
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Château Margaux"
                />

                <Divider style={styles.divider} />

                {/* Location Details */}
                <Text style={styles.sectionTitle}>Location</Text>

                <View style={styles.row}>
                    <TextInput
                        label="Region"
                        value={formData.region}
                        onChangeText={(text) => updateField('region', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        placeholder="e.g., Bordeaux"
                    />
                    <TextInput
                        label="Country"
                        value={formData.country}
                        onChangeText={(text) => updateField('country', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        placeholder="e.g., France"
                    />
                </View>

                <Divider style={styles.divider} />

                {/* Additional Details */}
                <Text style={styles.sectionTitle}>Additional Details</Text>

                <TextInput
                    label="Website"
                    value={formData.website}
                    onChangeText={(text) => updateField('website', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., https://www.example.com"
                    keyboardType="url"
                    autoCapitalize="none"
                />

                <View style={styles.row}>
                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => updateField('email', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        placeholder="contact@winery.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        label="Phone"
                        value={formData.phone}
                        onChangeText={(text) => updateField('phone', text)}
                        mode="outlined"
                        style={[styles.input, styles.halfWidth]}
                        placeholder="+1 (555) 123-4567"
                        keyboardType="phone-pad"
                    />
                </View>

                <TextInput
                    label="Year Founded"
                    value={formData.foundedYear}
                    onChangeText={(text) => updateField('foundedYear', text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="e.g., 1855"
                    maxLength={4}
                />

                <TextInput
                    label="Logo URL"
                    value={formData.logo}
                    onChangeText={(text) => updateField('logo', text)}
                    mode="outlined"
                    style={styles.input}
                    placeholder="https://example.com/logo.png"
                    keyboardType="url"
                    autoCapitalize="none"
                />

                <TextInput
                    label="Description"
                    value={formData.description}
                    onChangeText={(text) => updateField('description', text)}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                    placeholder="Tell us about this winery..."
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
                        {isEditing ? 'Update Winery' : 'Add Winery'}
                    </Button>
                </View>
                {!isFormValid && !isLoading && (
                    <Text style={styles.validationHint}>
                        Please fill in winery name
                    </Text>
                )}
            </View>
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
});