// src/features/auth/screens/SignInScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { login } from '../authThunks';
import { RootState, AppDispatch } from '../../../store';
import { AuthForm } from '../components/AuthForm';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const [formError, setFormError] = useState<string | undefined>();

  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      await dispatch(login({ email, mot_de_passe: password })).unwrap();
      // La navigation après connexion réussie sera gérée par le composant AuthNavigator
    } catch (err) {
      setFormError('Identifiants invalides');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <AuthForm
          type="signin"
          onSubmit={handleSubmit}
          isLoading={status === 'loading'}
          error={formError}
        />
        
        <TouchableOpacity 
          style={styles.link}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkText}>
            Pas encore de compte ? S'inscrire
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});