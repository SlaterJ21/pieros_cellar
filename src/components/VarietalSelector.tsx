import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Modal as RNModal,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
    Platform,
} from 'react-native';
import {
    Searchbar,
    List,
    ActivityIndicator,
    Text,
    Chip,
    Surface,
    IconButton,
    Button,
    TextInput,
    HelperText
} from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_VARIETALS } from '@/graphql/queries/varietals';
import { CREATE_VARIETAL } from '@/graphql/mutations/varietals';

interface VarietalSelectorProps {
    visible: boolean;
    onDismiss: () => void;
    selectedVarietalId?: string | null;
    onSelect: (varietalId: string, varietalName: string) => void;
    wineType?: string;
}

export default function VarietalSelector({
                                             visible,
                                             onDismiss,
                                             selectedVarietalId,
                                             onSelect,
                                             wineType
                                         }: VarietalSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVarietal, setNewVarietal] = useState({
        name: '',
        description: '',
        aliases: '',
        characteristics: '',
    });

    const { data, loading, error } = useQuery(GET_VARIETALS, {
        variables: {
            type: wineType,
            search: searchQuery || undefined,
        },
    });

    const [createVarietal, { loading: creating }] = useMutation(CREATE_VARIETAL, {
        refetchQueries: [{ query: GET_VARIETALS }],
    });

    const filteredVarietals = useMemo(() => {
        if (!data?.varietals) return [];

        const query = searchQuery.toLowerCase();
        if (!query) return data.varietals;

        return data.varietals.filter((varietal: any) => {
            return (
                varietal.name.toLowerCase().includes(query) ||
                varietal.aliases?.some((alias: string) => alias.toLowerCase().includes(query))
            );
        });
    }, [data?.varietals, searchQuery]);

    const handleCreateVarietal = async () => {
        if (!newVarietal.name.trim()) return;

        try {
            const aliases = newVarietal.aliases
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0);

            const characteristics = newVarietal.characteristics
                .split(',')
                .map(c => c.trim())
                .filter(c => c.length > 0);

            const result = await createVarietal({
                variables: {
                    input: {
                        name: newVarietal.name.trim(),
                        type: wineType || null,
                        description: newVarietal.description.trim() || null,
                        aliases: aliases.length > 0 ? aliases : [],
                        characteristics: characteristics.length > 0 ? characteristics : [],
                        commonRegions: [],
                    },
                },
            });

            const varietal = result.data.createVarietal;
            onSelect(varietal.id, varietal.name);
            setShowAddForm(false);
            setNewVarietal({ name: '', description: '', aliases: '', characteristics: '' });
            setSearchQuery('');
            Keyboard.dismiss();
            onDismiss();
        } catch (error) {
            console.error('Error creating varietal:', error);
            alert('Failed to create varietal. Please try again.');
        }
    };

    const handleSelect = (varietalId: string, varietalName: string) => {
        onSelect(varietalId, varietalName);
        setSearchQuery('');
        onDismiss();
    };

    const handleClose = () => {
        Keyboard.dismiss();
        setShowAddForm(false);
        setSearchQuery('');
        setNewVarietal({ name: '', description: '', aliases: '', characteristics: '' });
        onDismiss();
    };

    const handleBackToList = () => {
        Keyboard.dismiss();
        setShowAddForm(false);
        setNewVarietal({ name: '', description: '', aliases: '', characteristics: '' });
    };

    return (
        <RNModal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <Surface style={styles.modalContent} elevation={5}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    {showAddForm ? 'Add New Varietal' : 'Select Varietal'}
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
                                        placeholder="Search varietals..."
                                        onChangeText={setSearchQuery}
                                        value={searchQuery}
                                        style={styles.searchbar}
                                    />

                                    {/* Varietals List */}
                                    {loading ? (
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
                                            data={filteredVarietals}
                                            keyExtractor={(item) => item.id}
                                            style={styles.list}
                                            contentContainerStyle={styles.listContent}
                                            renderItem={({ item }) => (
                                                <List.Item
                                                    title={item.name}
                                                    titleStyle={styles.listItemTitle}
                                                    description={
                                                        <View style={styles.description}>
                                                            {item.aliases && item.aliases.length > 0 && (
                                                                <Text style={styles.aliases}>
                                                                    Also known as: {item.aliases.join(', ')}
                                                                </Text>
                                                            )}
                                                            {item.characteristics && item.characteristics.length > 0 && (
                                                                <View style={styles.characteristics}>
                                                                    {item.characteristics.slice(0, 3).map((char: string) => (
                                                                        <Chip key={char} style={styles.chip} compact textStyle={styles.chipText}>
                                                                            {char}
                                                                        </Chip>
                                                                    ))}
                                                                </View>
                                                            )}
                                                        </View>
                                                    }
                                                    onPress={() => handleSelect(item.id, item.name)}
                                                    left={(props) => (
                                                        <List.Icon
                                                            {...props}
                                                            icon='fruit-grapes'
                                                            color='#8B2E2E'
                                                        />
                                                    )}
                                                    style={[
                                                        styles.listItem,
                                                        item.id === selectedVarietalId && styles.selectedItem,
                                                    ]}
                                                />
                                            )}
                                            ListEmptyComponent={
                                                <View style={styles.empty}>
                                                    <Text style={styles.emptyIcon}>🍇</Text>
                                                    <Text style={styles.emptyText}>
                                                        {searchQuery ? 'No varietals found' : 'No varietals available'}
                                                    </Text>
                                                    <Text style={styles.emptySubtext}>
                                                        {searchQuery
                                                            ? 'Try a different search term or add a new varietal'
                                                            : 'Add your first varietal below'}
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
                                            Add New Varietal
                                        </Button>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {/* Add Varietal Form */}
                                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                        <ScrollView
                                            style={styles.formScroll}
                                            contentContainerStyle={styles.form}
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            <TextInput
                                                label="Varietal Name *"
                                                value={newVarietal.name}
                                                onChangeText={(text) => setNewVarietal({ ...newVarietal, name: text })}
                                                style={styles.input}
                                                mode="outlined"
                                                autoFocus
                                                placeholder="e.g., Cabernet Sauvignon"
                                                returnKeyType="next"
                                            />
                                            <HelperText type="info" visible={!newVarietal.name}>
                                                Required
                                            </HelperText>

                                            <TextInput
                                                label="Description"
                                                value={newVarietal.description}
                                                onChangeText={(text) => setNewVarietal({ ...newVarietal, description: text })}
                                                style={styles.input}
                                                mode="outlined"
                                                multiline
                                                numberOfLines={2}
                                                placeholder="Brief description of this varietal"
                                                returnKeyType="done"
                                                blurOnSubmit={true}
                                                onSubmitEditing={Keyboard.dismiss}
                                            />

                                            <TextInput
                                                label="Aliases"
                                                value={newVarietal.aliases}
                                                onChangeText={(text) => setNewVarietal({ ...newVarietal, aliases: text })}
                                                style={styles.input}
                                                mode="outlined"
                                                placeholder="e.g., Shiraz, Syrah (comma-separated)"
                                                returnKeyType="done"
                                                blurOnSubmit={true}
                                                onSubmitEditing={Keyboard.dismiss}
                                            />
                                            <HelperText type="info" visible={true}>
                                                Enter alternative names separated by commas
                                            </HelperText>

                                            <TextInput
                                                label="Characteristics"
                                                value={newVarietal.characteristics}
                                                onChangeText={(text) => setNewVarietal({ ...newVarietal, characteristics: text })}
                                                style={styles.input}
                                                mode="outlined"
                                                multiline
                                                numberOfLines={2}
                                                placeholder="e.g., Full-bodied, Dark fruit, High tannins (comma-separated)"
                                                returnKeyType="done"
                                                blurOnSubmit={true}
                                                onSubmitEditing={Keyboard.dismiss}
                                            />
                                            <HelperText type="info" visible={true}>
                                                Enter characteristics separated by commas
                                            </HelperText>

                                            {/* Extra space for keyboard */}
                                            <View style={{ height: 120 }} />
                                        </ScrollView>
                                    </TouchableWithoutFeedback>

                                    {/* Form Buttons */}
                                    <View style={styles.formButtons}>
                                        {/*{Platform.OS === 'ios' && (*/}
                                        {/*    <Button*/}
                                        {/*        mode="text"*/}
                                        {/*        onPress={Keyboard.dismiss}*/}
                                        {/*        textColor="#8B2E2E"*/}
                                        {/*        icon="keyboard-close"*/}
                                        {/*        style={styles.doneButton}*/}
                                        {/*    >*/}
                                        {/*        Done Editing*/}
                                        {/*    </Button>*/}
                                        {/*)}*/}
                                        <Button
                                            mode="contained"
                                            onPress={handleCreateVarietal}
                                            loading={creating}
                                            disabled={!newVarietal.name.trim() || creating}
                                            style={styles.createButton}
                                            buttonColor="#8B2E2E"
                                            icon="check"
                                            contentStyle={styles.buttonContent}
                                        >
                                            Create Varietal
                                        </Button>
                                        <Button
                                            mode="outlined"
                                            onPress={handleBackToList}
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
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
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
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 600,
        height: '90%',
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
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    characteristics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        marginHorizontal: -2,
        paddingBottom: 4,
    },
    selectedItem: {
        backgroundColor: '#fef3f3',
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c2c2c',
    },
    description: {
        marginTop: 4,
        paddingBottom: 8,
    },
    aliases: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 6,
    },
    chip: {
        backgroundColor: '#E8F5E9',
        height: 32,
        marginHorizontal: 2,
        marginVertical: 2,
    },
    chipText: {
        fontSize: 11,
        color: '#2E7D32',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 12,
        opacity: 0.5,
    },
    error: {
        color: '#d32f2f',
        fontSize: 18,
        marginBottom: 4,
        fontWeight: '600',
    },
    errorDetail: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
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
    formScroll: {
        flex: 1,
    },
    form: {
        padding: 20,
        paddingBottom: 40,
    },
    input: {
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    formButtons: {
        padding: 20,
        paddingTop: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    doneButton: {
        marginBottom: 4,
    },
    createButton: {
        width: '100%',
    },
    backButton: {
        width: '100%',
        borderColor: '#8B2E2E',
    },
});