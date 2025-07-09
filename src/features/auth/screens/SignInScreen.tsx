import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AuthStackScreenProps } from '../../../navigation/types';
import { useAuth } from '../../../store/auth/hooks';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';

type SignInScreenProps = AuthStackScreenProps<'SignIn'>;

export const SignInScreen = ({ navigation }: SignInScreenProps) => {
  const [email, setEmail] = useState('admin@123.com');
  const [mot_de_passe, setMotDePasse] = useState('admin@123.com');
  const { signIn, isLoading, error } = useAuth();

  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  const handleSignIn = async () => {
    if (!email || !mot_de_passe) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    await signIn(email, mot_de_passe);
  };

  return (
    <View className={`flex-1 justify-center p-5 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
     
      <View className="absolute top-4 right-4">
        <TouchableOpacity onPress={toggleTheme} className="p-2">
          <MaterialIcons 
            name={isDark ? 'light-mode' : 'dark-mode'} 
            size={24} 
            color={isDark ? '#ffffff' : '#000000'} 
          />
        </TouchableOpacity>
      </View>
      <Text className={`text-2xl font-bold text-center mb-5 ${isDark ? 'text-white' : 'text-black'}`}>
        Connexion
      </Text>
      
      <TextInput
        className={`h-12 border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded-lg px-4 mb-4 text-base`}
        placeholder="Email"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      
      <TextInput
        className={`h-12 border ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded-lg px-4 mb-6 text-base`}
        placeholder="Mot de passe"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={mot_de_passe}
        onChangeText={setMotDePasse}
        secureTextEntry
        autoComplete="password"
      />
      
      <TouchableOpacity 
        className="self-end mb-5"
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text className="text-blue-500 font-semibold">Mot de passe oublié ?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className={`h-12 bg-blue-500 rounded-lg items-center justify-center ${isLoading ? 'bg-gray-400' : ''}`}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-semibold">Se connecter</Text>
        )}
      </TouchableOpacity>
      
      <View className="flex-row justify-center mt-5">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>
          Vous n'avez pas de compte ?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text className="text-blue-500 font-semibold">S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


