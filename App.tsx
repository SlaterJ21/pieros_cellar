import React from 'react';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const getGraphQLUri = () => {
    if (__DEV__) {
        if (Platform.OS === 'ios') {
            return 'http://localhost:4000/graphql';
        }
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:4000/graphql';
        }
        return 'http://localhost:4000/graphql';
    }
    return 'https://your-production-url.com/graphql';
};

const client = new ApolloClient({
    link: new HttpLink({
        uri: getGraphQLUri(),
    }),
    cache: new InMemoryCache(),
});

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#722F37',
        secondary: '#7A7A7A',
    },
};

export default function App() {
    return (
        <ApolloProvider client={client}>
            <PaperProvider theme={theme}>
                <NavigationContainer>
                    <StatusBar style="auto" />
                    <AppNavigator />
                </NavigationContainer>
            </PaperProvider>
        </ApolloProvider>
    );
}