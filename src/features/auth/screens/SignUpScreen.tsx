import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthStackScreenProps } from '~/navigation/types';
import { useAuth } from '~/store/auth/hooks';
import { useTheme } from '~/theme/ThemeContext';

export const SignUpScreen = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { signUp, isLoading, error, isAuthenticated } = useAuth();

  const { isDark, toggleTheme } = useTheme();
  
  type Props = AuthStackScreenProps<'SignUp'>;
  const navigation = useNavigation<Props['navigation']>();

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  // La navigation est gérée dans handleSignUp après un signUp réussi

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!nom.trim()) newErrors.nom = 'Le nom est requis';
    
    if (!email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    } else if (mot_de_passe.length < 6) {
      newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (mot_de_passe !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      // Appel à l'API d'inscription
      const success = await signUp({ nom, email, mot_de_passe });
      
      // La navigation est gérée automatiquement par le AppContent qui écoute les changements de isAuthenticated
      if (!success) {
        throw new Error("L'inscription a échoué");
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <View className={`flex-1 justify-center p-5 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View className="absolute top-4 right-4">
        <TouchableOpacity onPress={toggleTheme} className="p-2">
          <MaterialIcons 
            name={isDark ? 'light-mode' : 'dark-mode'} 
            size={24} 
            color={isDark ? '#ffffff' : '#000000'} 
          />
        </TouchableOpacity>
      </View>
      
      <Text className={`text-2xl font-bold text-center mb-8 ${isDark ? 'text-white' : 'text-black'}`}>Créer un compte</Text>
      
      <View className="mb-4">
        <TextInput
          className={`h-12 border rounded-lg px-4 text-base ${errors.nom ? 'border-red-500' : isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
          placeholder="Nom complet"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={nom}
          onChangeText={(text) => {
            setNom(text);
            if (errors.nom) setErrors({...errors, nom: ''});
          }}
        />
        {errors.nom && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.nom}</Text>}
      </View>
      
      <View className="mb-4">
        <TextInput
          className={`h-12 border rounded-lg px-4 text-base ${errors.email ? 'border-red-500' : isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
          placeholder="Email"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({...errors, email: ''});
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>}
      </View>
      
      <View className="mb-4">
        <TextInput
          className={`h-12 border rounded-lg px-4 text-base ${errors.mot_de_passe ? 'border-red-500' : isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
          placeholder="Mot de passe (min. 6 caractères)"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={mot_de_passe}
          onChangeText={(text) => {
            setMotDePasse(text);
            if (errors.mot_de_passe) setErrors({...errors, mot_de_passe: ''});
          }}
          secureTextEntry
        />
        {errors.mot_de_passe && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.mot_de_passe}</Text>}
      </View>
      
      <View className="mb-6">
        <TextInput
          className={`h-12 border rounded-lg px-4 text-base ${errors.confirmPassword ? 'border-red-500' : isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
          }}
          secureTextEntry
        />
        {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>}
      </View>
      
      <TouchableOpacity 
        className={`h-12 bg-blue-600 rounded-lg items-center justify-center ${isLoading ? 'bg-gray-400' : ''}`}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-semibold">S'inscrire</Text>
        )}
      </TouchableOpacity>
      
      <View className="flex-row justify-center mt-6">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>Vous avez déjà un compte ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text className="text-blue-500 font-semibold">Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


