// src/config/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getGraphQLUri = () => {
    if (__DEV__) {
        // iOS Simulator
        if (Platform.OS === 'ios') {
            return 'http://localhost:4000/graphql';
        }
        // Android Emulator
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:4000/graphql';
        }
        // Web
        return 'http://localhost:4000/graphql';
    }
    // Production
    return 'https://your-production-url.com/graphql';
};

const httpLink = new HttpLink({
    uri: getGraphQLUri(),
});

const authLink = setContext(async (_, { headers }) => {
    try {
        const token = await SecureStore.getItemAsync('authToken');

        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : '',
            },
        };
    } catch (error) {
        console.error('Error getting auth token:', error);
        return { headers };
    }
});

export const apolloClient = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});