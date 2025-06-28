import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { SignInScreen } from '../features/auth/screens/SignInScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ title: 'Connexion' }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ title: 'Créer un compte' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{
          headerShown: true,
          title: 'Mot de passe oublié',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
