import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '~/store/hooks';
import EditProfileModal from '../components/EditProfileModal';
import { useTheme } from '~/theme/ThemeContext';
import { parametresDemo, Parametre } from '../data/parametresDemo';

const ParametresScreen = () => {
  const { isDark, toggleTheme } = useTheme();
  const [parametres, setParametres] = useState<Parametre[]>(parametresDemo);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingParam, setEditingParam] = useState<Parametre | null>(null);
  const [editValue, setEditValue] = useState('');

  // Grouper les paramètres par catégorie
  const parametresParCategorie = parametres.reduce<Record<string, Parametre[]>>((acc, param) => {
    const categorie = param.categorie || 'Autres';
    if (!acc[categorie]) {
      acc[categorie] = [];
    }
    acc[categorie].push(param);
    return acc;
  }, {});

  // Filtrer les paramètres en fonction de la recherche
  const filteredCategories = Object.entries(parametresParCategorie).filter(([categorie, params]) => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      categorie.toLowerCase().includes(searchLower) ||
      params.some(p => 
        p.cle.toLowerCase().includes(searchLower) || 
        p.description?.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleUpdateParam = (param: Parametre) => {
    if (editingParam?.id === param.id) {
      // Mettre à jour le paramètre
      setParametres(prev => 
        prev.map(p => 
          p.id === param.id ? { ...p, valeur: editValue, date_modification: new Date().toISOString() } : p
        )
      );
      setEditingParam(null);
    } else {
      // Passer en mode édition
      setEditingParam(param);
      setEditValue(param.valeur);
    }
  };

  const handleToggleSwitch = (param: Parametre) => {
    const newValue = param.valeur === 'true' ? 'false' : 'true';
    setParametres(prev => 
      prev.map(p => 
        p.id === param.id ? { ...p, valeur: newValue, date_modification: new Date().toISOString() } : p
      )
    );
  };

  const renderParamInput = (param: Parametre) => {
    if (editingParam?.id === param.id) {
      return (
        <View className="flex-row items-center">
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            className={`flex-1 p-2 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'}`}
            autoFocus
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            style={isDark ? { color: 'white' } : {}}
          />
          <TouchableOpacity 
            className="ml-2 p-2 bg-blue-500 rounded"
            onPress={() => handleUpdateParam(param)}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="ml-1 p-2 bg-gray-500 rounded"
            onPress={() => setEditingParam(null)}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      );
    }

    if (param.cle === 'theme') {
      return (
        <View className="flex-row items-center space-x-2">
          <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {isDark ? 'Sombre' : 'Clair'}
          </Text>
          <TouchableOpacity 
            onPress={toggleTheme}
            className={`w-12 h-6 rounded-full flex items-center ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <View 
              className={`w-5 h-5 rounded-full bg-white absolute ${isDark ? 'right-1' : 'left-1'}`}
              style={{ top: 2 }}
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (param.valeur === 'true' || param.valeur === 'false') {
      return (
        <Switch
          value={param.valeur === 'true'}
          onValueChange={() => handleToggleSwitch(param)}
          trackColor={{ false: '#9CA3AF', true: isDark ? '#3B82F6' : '#2563EB' }}
          thumbColor="white"
        />
      );
    }

    return (
      <View className="flex-row items-center">
        <Text className={`mr-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {param.valeur}
        </Text>
        <TouchableOpacity onPress={() => handleUpdateParam(param)}>
          <Ionicons 
            name="pencil" 
            size={18} 
            color={isDark ? '#9CA3AF' : '#6B7280'} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* En-tête avec photo de profil */}
      <TouchableOpacity 
        className={`flex-row items-center p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        onPress={() => setIsEditModalVisible(true)}
      >
        <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
          {user?.photo ? (
            <Image 
              source={{ uri: user.photo }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={32} color={isDark ? '#9CA3AF' : '#6B7280'} />
          )}
        </View>
        <View className="ml-4 flex-1">
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {user?.nom || 'Utilisateur'}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {user?.email || ''}
          </Text>
        </View>
        <Ionicons 
          name="pencil" 
          size={20} 
          color={isDark ? '#9CA3AF' : '#6B7280'} 
        />
      </TouchableOpacity>
      {/* En-tête */}
      <View className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Paramètres
        </Text>
        <Text className={`mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Gérez vos préférences et paramètres
        </Text>
      </View>

      {/* Barre de recherche */}
      <View className="p-4">
        <View className={`flex-row items-center px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <Ionicons name="search" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            className={`flex-1 ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
            placeholder="Rechercher un paramètre..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des paramètres */}
      <ScrollView className="flex-1 px-4 pb-20">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(([categorie, params]) => (
            <View key={categorie} className="mb-6">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {categorie.toUpperCase()}
              </Text>
              <View className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                {params.map((param, index) => (
                  <View 
                    key={param.id} 
                    className={`flex-row items-center justify-between p-4 ${index < params.length - 1 ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}` : ''}`}
                  >
                    <View className="flex-1">
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {param.description || param.cle}
                      </Text>
                      {param.date_modification && (
                        <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Modifié le {new Date(param.date_modification).toLocaleDateString('fr-FR')}
                        </Text>
                      )}
                    </View>
                    {renderParamInput(param)}
                  </View>
                ))}
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons 
              name="search" 
              size={48} 
              color={isDark ? '#4B5563' : '#9CA3AF'} 
              className="opacity-50"
            />
            <Text className={`mt-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucun paramètre trouvé pour "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modale d'édition du profil */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user || { id: 0, nom: '', email: '' }}
      />
    </View>
  );
};

export default ParametresScreen;
