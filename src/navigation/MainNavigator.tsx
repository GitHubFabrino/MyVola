// MainNavigator.tsx
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, MainStackParamList } from './types';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { TransactionsScreen } from '../features/transactions/screens/TransactionsScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '~/store/auth/hooks';
import { useTheme } from '~/theme/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? colors.dark.primary : colors.light.primary,
        tabBarInactiveTintColor: isDark ? colors.dark.text : colors.light.text,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? colors.dark.background : colors.light.background,
          borderTopColor: isDark ? colors.dark.border : colors.light.border,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? colors.dark.background : colors.light.background,
        }
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default MainNavigator;