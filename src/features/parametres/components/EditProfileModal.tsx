import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { SafeUtilisateur } from '~/features/auth/types';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { updateUserProfile } from '~/features/auth/authThunks';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: SafeUtilisateur;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose, user }) => {
  const [formData, setFormData] = useState<{
    nom: string;
    email: string;
    photo: string | null;
  }>({
    nom: '',
    email: '',
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        email: user.email || '',
        photo: user.photo || null,
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à votre bibliothèque photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          photo: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.nom.trim() || !formData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(updateUserProfile({
        userId: user.id!,
        updates: {
          nom: formData.nom,
          email: formData.email,
          ...(formData.photo && { photo: formData.photo }),
        },
      })).unwrap();
      
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center p-4 bg-black/50">
        <View className={`w-full max-w-md rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Modifier le profil
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage}>
              <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <Image 
                    source={{ uri: formData.photo }} 
                    className="w-full h-full" 
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={40} color={isDark ? '#9CA3AF' : '#6B7280'} />
                )}
                <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              </View>
            </TouchableOpacity>
            <Text className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Modifier la photo
            </Text>
          </View>

          <View className="mb-4">
            <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nom complet <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="Votre nom"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              value={formData.nom}
              onChangeText={(text) => handleChange('nom', text)}
            />
          </View>

          <View className="mb-6">
            <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Adresse email <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="votre@email.com"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-blue-500 rounded-lg items-center"
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text className="text-white font-medium">
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
