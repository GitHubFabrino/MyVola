// src/features/auth/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { register } from '../authThunks';
import { AppDispatch } from '../../../store';
import { AuthForm } from '../components/AuthForm';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async ({ email, password, name = '' }: { 
    email: string; 
    password: string;
    name?: string;
  }) => {
    try {
      await dispatch(register({ 
        email, 
        mot_de_passe: password,
        nom: name,
        date_creation: new Date().toISOString(),
      })).unwrap();
      
      // Rediriger vers l'écran de connexion après inscription réussie
      navigation.navigate('SignIn');
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <AuthForm
          type="signup"
          onSubmit={handleSubmit}
          isLoading={false}
          error={error}
        />
        
        <TouchableOpacity 
          style={styles.link}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.linkText}>
            Déjà un compte ? Se connecter
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