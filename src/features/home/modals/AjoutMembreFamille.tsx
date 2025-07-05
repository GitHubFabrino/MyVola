import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';
import Btn from '../screens/components/bouton/Btn';
import { useAuth } from '~/store/auth/hooks';
import { useAppDispatch } from '~/store/hooks';
import { addFamilleNew } from '~/store/famille/familleSlice';

interface AjoutMembreFamilleProps {
  isVisible: boolean;
  onClose: () => void;
  onMemberAdded?: () => void;
}

const AjoutMembreFamille = ({ isVisible, onClose, onMemberAdded }: AjoutMembreFamilleProps) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [nomMembre, setNomMembre] = useState('');
  const [role, setRole] = useState('membre');
  const [isLoading, setIsLoading] = useState(false);
  // const [familleId, setFamilleId] = useState<number >(0);

  const dispatch = useAppDispatch();


  const handleAddMember = async () => {
    if (!nomMembre.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour le membre');
      return;
    }
    setIsLoading(true);
    try {

      if (user?.id && (role === 'membre' || role === 'admin')) {
        await dispatch(addFamilleNew({nom: nomMembre, role: role, utilisateur_id: user?.id}));
     
      }
     
      Alert.alert('Succès', 'Membre ajouté avec succès');
      console.log('Membre ajouté:', nomMembre);
      setNomMembre('');
      setRole('membre');
      onMemberAdded?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout du membre');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className={`p-5 rounded-xl w-11/12 max-h-[80%] ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 top-4 z-10"
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>

          <ScrollView className="h-[80%] space-y-4" showsVerticalScrollIndicator={false}>
          <View className="w-full flex-1">
      {/* En-tête avec bouton retour */}
      <View className="flex-row items-center mb-8">
      
        <Text className={`text-2xl font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Ajouter un membre
        </Text>
      </View>

      {/* Illustration */}
      <View className="items-center mb-8">
        <View className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'} items-center justify-center mb-4`}>
          <Ionicons 
            name="person-add" 
            size={36} 
            color={isDark ? '#C084FC' : '#8B5CF6'} 
          />
        </View>
        <Text className={`text-center text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Inviter un nouveau membre
        </Text>
        <Text className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} px-4`}>
          Entrez le nom de la personne que vous souhaitez ajouter à la famille
        </Text>
      </View>

      {/* Formulaire */}
      <View className="mb-6">
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Nom du membre
        </Text>
        <View className={`rounded-xl overflow-hidden mb-6 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
          <TextInput
            className={`px-4 py-3 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
            placeholder="Nom du membre"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={nomMembre}
            onChangeText={setNomMembre}
            autoCapitalize="words"
            autoCorrect={false}
            selectionColor={isDark ? '#C084FC' : '#8B5CF6'}
          />
        </View>

        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Rôle dans la famille
        </Text>
        <View className="flex-row mb-6 rounded-xl overflow-hidden">
          <TouchableOpacity
            onPress={() => setRole('membre')}
            className={`flex-1 py-3 items-center ${
              role === 'membre'
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={role === 'membre' 
                ? (isDark ? '#C084FC' : '#8B5CF6') 
                : (isDark ? '#9CA3AF' : '#6B7280')
              } 
              className="mb-1"
            />
            <Text 
              className={`text-sm font-medium ${
                role === 'membre'
                  ? 'text-purple-600 dark:text-purple-400'
                  : (isDark ? 'text-gray-300' : 'text-gray-700')
              }`}
            >
              Membre
            </Text>
          </TouchableOpacity>
          
          <View className="w-px bg-gray-200 dark:bg-gray-600" />
          
          <TouchableOpacity
            onPress={() => setRole('admin')}
            className={`flex-1 py-3 items-center ${
              role === 'admin'
                ? 'bg-purple-100 dark:bg-purple-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="shield-outline" 
              size={20} 
              color={role === 'admin' 
                ? (isDark ? '#C084FC' : '#8B5CF6') 
                : (isDark ? '#9CA3AF' : '#6B7280')
              } 
              className="mb-1"
            />
            <Text 
              className={`text-sm font-medium ${
                role === 'admin'
                  ? 'text-purple-600 dark:text-purple-400'
                  : (isDark ? 'text-gray-300' : 'text-gray-700')
              }`}
            >
              Administrateur
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
          <View className="flex-row">
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={isDark ? '#60A5FA' : '#3B82F6'} 
              className="mr-2 mt-0.5"
            />
            <View className="flex-1">
              <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Différence entre les rôles
              </Text>
              <Text className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Les administrateurs peuvent modifier les paramètres de la famille et gérer les membres.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-auto">
        <Btn
          title={isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          onPress={handleAddMember}
          isDark={isDark}
          disabled={isLoading || !nomMembre.trim()}
          className="w-full py-3 rounded-xl"
          icon={isLoading ? (
            <ActivityIndicator 
              size="small" 
              color="white"
              style={{ marginRight: 8 }}
            />
          ) : undefined}
        />
        
        <Text className={`text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Le membre sera ajouté à votre famille
        </Text>
      </View>
    </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AjoutMembreFamille;

 