import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Modal as RNModal, TouchableOpacity } from 'react-native';
import {
    Button,
    Searchbar,
    List,
    Text,
    TextInput,
    HelperText,
    Surface,
    IconButton,
    ActivityIndicator
} from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_WINERIES } from '../graphql/queries/wineries';
import { CREATE_WINERY } from '../graphql/mutations/wineries';

interface WinerySelectorProps {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (wineryId: string, wineryName: string) => void;
}

export default function WinerySelector({ visible, onDismiss, onSelect }: WinerySelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newWinery, setNewWinery] = useState({
        name: '',
        region: '',
        country: '',
    });

    const { data, loading, refetch } = useQuery(GET_WINERIES, {
        variables: { search: searchQuery },
    });

    const [createWinery, { loading: creating }] = useMutation(CREATE_WINERY, {
        refetchQueries: [{ query: GET_WINERIES }],
    });

    const handleCreateWinery = async () => {
        if (!newWinery.name.trim()) return;

        try {
            const result = await createWinery({
                variables: {
                    input: {
                        name: newWinery.name,
                        region: newWinery.region || null,
                        country: newWinery.country || null,
                    },
                },
            });

            const winery = result.data.createWinery;
            onSelect(winery.id, winery.name);
            setShowAddForm(false);
            setNewWinery({ name: '', region: '', country: '' });
            setSearchQuery('');
            onDismiss();
        } catch (error) {
            console.error('Error creating winery:', error);
        }
    };

    const handleClose = () => {
        setShowAddForm(false);
        setSearchQuery('');
        setNewWinery({ name: '', region: '', country: '' });
        onDismiss();
    };

    const wineries = data?.wineries || [];
    const filteredWineries = searchQuery
        ? wineries.filter((w: any) =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : wineries;

    return (
        <RNModal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={styles.modalWrapper}
                >
                    <Surface style={styles.modalContent} elevation={5}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {showAddForm ? 'Add New Winery' : 'Select Winery'}
                            </Text>
                            <IconButton
                                icon="close"
                                size={24}
                                onPress={handleClose}
                            />
                        </View>

                        {!showAddForm ? (
                            <>
                                {/* Search Bar */}
                                <Searchbar
                                    placeholder="Search wineries..."
                                    onChangeText={setSearchQuery}
                                    value={searchQuery}
                                    style={styles.searchbar}
                                />

                                {/* Wineries List */}
                                {loading ? (
                                    <View style={styles.centered}>
                                        <ActivityIndicator size="large" color="#8B2E2E" />
                                    </View>
                                ) : (
                                    <FlatList
                                        data={filteredWineries}
                                        keyExtractor={(item) => item.id}
                                        style={styles.list}
                                        contentContainerStyle={styles.listContent}
                                        renderItem={({ item }) => (
                                            <List.Item
                                                title={item.name}
                                                titleStyle={styles.listItemTitle}
                                                description={
                                                    item.region && item.country
                                                        ? `${item.region}, ${item.country}`
                                                        : item.country || 'No location'
                                                }
                                                descriptionStyle={styles.listItemDescription}
                                                onPress={() => {
                                                    onSelect(item.id, item.name);
                                                    handleClose();
                                                }}
                                                left={(props) => <List.Icon {...props} icon="domain" color="#8B2E2E" />}
                                                style={styles.listItem}
                                            />
                                        )}
                                        ListEmptyComponent={
                                            <View style={styles.empty}>
                                                <Text style={styles.emptyIcon}>🏛️</Text>
                                                <Text style={styles.emptyText}>
                                                    {searchQuery ? 'No wineries found' : 'No wineries yet'}
                                                </Text>
                                                <Text style={styles.emptySubtext}>
                                                    {searchQuery
                                                        ? 'Try a different search term'
                                                        : 'Add your first winery below'}
                                                </Text>
                                            </View>
                                        }
                                    />
                                )}

                                {/* Bottom Buttons */}
                                <View style={styles.bottomButtons}>
                                    <Button
                                        mode="contained"
                                        onPress={() => setShowAddForm(true)}
                                        icon="plus"
                                        style={styles.addButton}
                                        buttonColor="#8B2E2E"
                                        contentStyle={styles.buttonContent}
                                    >
                                        Add New Winery
                                    </Button>
                                </View>
                            </>
                        ) : (
                            <>
                                {/* Add Winery Form */}
                                <View style={styles.form}>
                                    <TextInput
                                        label="Winery Name *"
                                        value={newWinery.name}
                                        onChangeText={(text) => setNewWinery({ ...newWinery, name: text })}
                                        style={styles.input}
                                        mode="outlined"
                                        autoFocus
                                    />
                                    <HelperText type="info" visible={!newWinery.name}>
                                        Required
                                    </HelperText>

                                    <TextInput
                                        label="Region"
                                        value={newWinery.region}
                                        onChangeText={(text) => setNewWinery({ ...newWinery, region: text })}
                                        style={styles.input}
                                        mode="outlined"
                                        placeholder="e.g., Napa Valley"
                                    />

                                    <TextInput
                                        label="Country"
                                        value={newWinery.country}
                                        onChangeText={(text) => setNewWinery({ ...newWinery, country: text })}
                                        style={styles.input}
                                        mode="outlined"
                                        placeholder="e.g., USA"
                                    />
                                </View>

                                {/* Form Buttons */}
                                <View style={styles.formButtons}>
                                    <Button
                                        mode="contained"
                                        onPress={handleCreateWinery}
                                        loading={creating}
                                        disabled={!newWinery.name.trim() || creating}
                                        style={styles.createButton}
                                        buttonColor="#8B2E2E"
                                        icon="check"
                                        contentStyle={styles.buttonContent}
                                    >
                                        Create Winery
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        onPress={() => {
                                            setShowAddForm(false);
                                            setNewWinery({ name: '', region: '', country: '' });
                                        }}
                                        disabled={creating}
                                        style={styles.backButton}
                                        contentStyle={styles.buttonContent}
                                    >
                                        Back to List
                                    </Button>
                                </View>
                            </>
                        )}
                    </Surface>
                </TouchableOpacity>
            </TouchableOpacity>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalWrapper: {
        width: '100%',
        height: '90%',
        maxWidth: 600,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        flex: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c2c2c',
    },
    searchbar: {
        margin: 16,
        marginBottom: 12,
        elevation: 0,
        backgroundColor: '#f5f5f5',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 8,
    },
    listItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c2c2c',
    },
    listItemDescription: {
        fontSize: 14,
        color: '#666',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
    },
    empty: {
        flex: 1,
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.3,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    bottomButtons: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    addButton: {
        width: '100%',
    },
    buttonContent: {
        height: 48,
    },
    form: {
        padding: 20,
        flex: 1,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    formButtons: {
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    createButton: {
        width: '100%',
    },
    backButton: {
        width: '100%',
        borderColor: '#8B2E2E',
    },
});