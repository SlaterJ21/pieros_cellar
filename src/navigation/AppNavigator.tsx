// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import InventoryScreen from '../screens/InventoryScreen';
import WineDetailScreen from '../screens/WineDetailScreen';
import AddWineScreen from '../screens/AddWineScreen';
import AddWineryScreen from '../screens/AddWineryScreen';
import StatsScreen from '../screens/StatsScreen';
import WineriesScreen from '../screens/WineriesScreen';
import VarietalsScreen from '../screens/VarietalsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WineryDetailScreen from "@/screens/WineryDetailScreen";
import VarietalDetailScreen from "../screens/VarietalDetailScreen";
import AddVarietalScreen from "../screens/AddVarietalScreen";

export type RootStackParamList = {
    Home: undefined;
    WineDetail: { wineId: string };
    AddWine: { preselectedWineryId: string, preselectedWineryName: string };
    EditWine: { wineId: string };
    AddWinery: undefined;
    EditWinery: { wineryId: string };
    WineryDetail: { wineryId: string };
    AddVarietal: undefined;
    EditVarietal: { varietalId: string };
    VarietalDetail: { varietalId: string };
};

export type TabParamList = {
    Inventory: undefined;
    Wineries: undefined;
    Varietals: undefined;
    Stats: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#8B2E2E',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                },
                headerShown: true,
            }}
        >
            <Tab.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                    title: "Piero's Cellar",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bottle-wine" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Wineries"
                component={WineriesScreen}
                options={{
                    title: 'Wineries',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="domain" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Varietals"
                component={VarietalsScreen}
                options={{
                    title: 'Varietals',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="fruit-grapes" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{
                    title: 'Statistics',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="WineDetail"
                component={WineDetailScreen}
                options={{
                    title: 'Wine Details',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="AddWine"
                component={AddWineScreen}
                options={{
                    title: 'Add Wine',
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="EditWine"
                component={AddWineScreen}
                options={{
                    title: 'Edit Wine',
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="AddWinery"
                component={AddWineryScreen}
                options={{
                    title: 'Add Winery',
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="EditWinery"
                component={AddWineryScreen}
                options={{
                    title: 'Edit Winery',
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="WineryDetail"
                component={WineryDetailScreen}
                options={{
                    title: 'Winery Details',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="AddVarietal"
                component={AddVarietalScreen}
                options={{
                    title: 'Add Varietal',
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="EditVarietal"
                component={AddVarietalScreen}
                options={{
                    title: 'Edit Varietal',
                    presentation: 'modal',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="VarietalDetail"
                component={VarietalDetailScreen}
                options={{
                    title: 'Varietal Details',
                    headerStyle: {
                        backgroundColor: '#8B2E2E',
                    },
                    headerTintColor: '#fff',
                }}
            />
        </Stack.Navigator>
    );
}