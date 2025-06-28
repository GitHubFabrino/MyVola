import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../store/auth/hooks';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (initializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={MainNavigator} 
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
