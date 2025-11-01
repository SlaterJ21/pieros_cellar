// DebugInfo.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugInfo() {
    const [healthStatus, setHealthStatus] = useState('Testing...');

    useEffect(() => {
        const API_URL = process.env.EXPO_PUBLIC_API_URL;

        fetch(`${API_URL}/health`)
            .then(res => res.json())
            .then(data => {
                setHealthStatus(`✅ Connected! ${JSON.stringify(data)}`);
            })
            .catch(err => {
                setHealthStatus(`❌ Failed: ${err.message}`);
            });
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>API: {process.env.EXPO_PUBLIC_API_URL}</Text>
            <Text style={styles.text}>{healthStatus}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 5,
        zIndex: 9999,
    },
    text: {
        color: 'white',
        fontSize: 10,
        fontFamily: 'monospace',
    },
});