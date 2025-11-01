import React from "react";
import {Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {IconButton, Surface, Text} from "react-native-paper";

// Picker Modal Component
interface PickerModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSelect: (value: string) => void;
    options: { value: string; label: string }[];
    title: string;
    selectedValue: string;
}

export default function PickerModal({ visible, onDismiss, onSelect, options, title, selectedValue }: PickerModalProps) {
    return (
        <Modal
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
        </Modal>
    );
}

const styles = StyleSheet.create({
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
    }
});