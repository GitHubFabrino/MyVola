import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { ObjectifEpargne, StatutObjectif } from '../types/objectif';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Données en dur initiales
const initialObjectifs: ObjectifEpargne[] = [
  {
    id: 1,
    famille_id: 1,
    nom: 'Nouvelle Voiture',
    montant_cible: 15000000, // 15 millions Ar
    montant_actuel: 4500000, // 4.5 millions Ar
    date_objectif: '2024-12-31',
    description: 'Achat d\'une nouvelle voiture familiale',
    statut: 'en_cours',
  },
  {
    id: 2,
    famille_id: 1,
    nom: 'Voyage en Europe',
    montant_cible: 10000000, // 10 millions Ar
    montant_actuel: 7500000, // 7.5 millions Ar
    date_objectif: '2024-10-15',
    description: 'Voyage de 2 semaines en Europe',
    statut: 'en_cours',
  },
  {
    id: 3,
    famille_id: 1,
    nom: 'Fonds d\'urgence',
    montant_cible: 5000000, // 5 millions Ar
    montant_actuel: 5000000, // 5 millions Ar
    date_objectif: '2024-08-01',
    description: 'Épargne de sécurité',
    statut: 'atteint',
  },
];

const ObjectifsScreen = () => {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [objectifs, setObjectifs] = useState<ObjectifEpargne[]>(initialObjectifs);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<ObjectifEpargne | null>(null);
  const [filters, setFilters] = useState({
    nom: '',
    statut: '' as StatutObjectif | '',
    dateDebut: '',
    dateFin: ''
  });
  
  // Nouvel objectif
  const [newObjectif, setNewObjectif] = useState<Omit<ObjectifEpargne, 'id' | 'famille_id' | 'statut'>>({ 
    nom: '',
    montant_cible: 0,
    montant_actuel: 0,
    date_objectif: new Date().toISOString().split('T')[0],
    description: ''
  });

  const getStatusColor = (statut: StatutObjectif) => {
    switch (statut) {
      case 'atteint':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'abandonne':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const calculateProgress = (actuel: number, cible: number) => {
    return Math.min(Math.round((actuel / cible) * 100), 100);
  };

  const handleUpdateObjectif = (updatedObjectif: ObjectifEpargne) => {
    setObjectifs(objectifs.map(obj => obj.id === updatedObjectif.id ? updatedObjectif : obj));
    setShowModal(false);
    setEditingObjectif(null);
  };

  const handleAddObjectif = () => {
    // Ici, vous devrez ajouter la logique pour sauvegarder dans la base de données
    const nouvelObjectif: ObjectifEpargne = {
      ...newObjectif,
      id: Math.max(0, ...objectifs.map(o => o.id || 0)) + 1,
      famille_id: 1, // À remplacer par l'ID de la famille connectée
      statut: 'en_cours' as const
    };
    
    setObjectifs([...objectifs, nouvelObjectif]);
    setShowModal(false);
    setNewObjectif({ 
      nom: '',
      montant_cible: 0,
      montant_actuel: 0,
      date_objectif: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const filteredObjectifs = objectifs.filter(objectif => {
    const matchesNom = objectif.nom.toLowerCase().includes(filters.nom.toLowerCase());
    const matchesStatut = !filters.statut || objectif.statut === filters.statut;
    const matchesDateDebut = !filters.dateDebut || objectif.date_objectif >= filters.dateDebut;
    const matchesDateFin = !filters.dateFin || objectif.date_objectif <= filters.dateFin;
    
    return matchesNom && matchesStatut && matchesDateDebut && matchesDateFin;
  });

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="p-4">
        {/* En-tête */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Objectifs d'épargne
          </Text>
          <TouchableOpacity 
            className="p-2"
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add-circle" size={28} color={isDark ? '#ffffff' : '#111827'} />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View className="mb-4">
          <View className="flex-row items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              className="flex-1 ml-2 text-base dark:text-white"
              placeholder="Rechercher un objectif..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              value={filters.nom}
              onChangeText={(text) => setFilters({...filters, nom: text})}
            />
          </View>
        </View>

        {/* Filtres par statut */}
        <View className="mb-4">
          <Text className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Filtrer par statut :
          </Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity
              key="tous"
              className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                !filters.statut 
                  ? 'bg-blue-500' 
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
              onPress={() => setFilters({
                ...filters,
                statut: ''
              })}
            >
              <Text className={`text-sm ${
                !filters.statut 
                  ? 'text-white' 
                  : isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tous
              </Text>
            </TouchableOpacity>
            {(['en_cours', 'atteint', 'abandonne'] as const).map((statut) => (
              <TouchableOpacity
                key={statut}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  filters.statut === statut 
                    ? 'bg-blue-500' 
                    : isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
                onPress={() => setFilters({
                  ...filters,
                  statut: filters.statut === statut ? '' : statut
                })}
              >
                <Text className={`text-sm ${
                  filters.statut === statut 
                    ? 'text-white' 
                    : isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {statut === 'en_cours' ? 'En cours' : statut === 'atteint' ? 'Atteint' : 'Abandonné'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredObjectifs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-10">
            <Ionicons name="search-outline" size={48} color={isDark ? '#4B5563' : '#9CA3AF'} style={{ marginBottom: 16 }} />
            <Text className={`text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {filters.nom || filters.statut || filters.dateDebut || filters.dateFin 
                ? 'Aucun objectif ne correspond à vos critères de recherche'
                : 'Aucun objectif pour le moment'}
            </Text>
            {filters.nom || filters.statut || filters.dateDebut || filters.dateFin ? (
              <TouchableOpacity 
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}
                onPress={() => setFilters({
                  nom: '',
                  statut: '' as StatutObjectif | '',
                  dateDebut: '',
                  dateFin: ''
                })}
              >
                <Text className="text-white font-medium">Réinitialiser les filtres</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}
                onPress={() => setShowModal(true)}
              >
                <Text className="text-white font-medium">Créer un objectif</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView  className="max-h-96">
            {filteredObjectifs.map((objectif) => (
              <View 
                key={objectif.id}
                className={`mb-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {objectif.nom}
                  </Text>
                  <View className="flex-row items-center space-x-2">
                    <View className={`px-2 py-1 rounded-full ${getStatusColor(objectif.statut)}`}>
                      <Text className="text-xs font-medium">
                        {objectif.statut === 'en_cours' ? 'En cours' : 
                         objectif.statut === 'atteint' ? 'Atteint' : 'Abandonné'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingObjectif(objectif);
                        setNewObjectif({
                          ...objectif,
                          montant_cible: objectif.montant_cible,
                          montant_actuel: objectif.montant_actuel
                        });
                        setShowModal(true);
                      }}
                      className="p-1"
                    >
                      <Ionicons name="create-outline" size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {objectif.description}
                </Text>

                <View className="mb-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Progression
                    </Text>
                    <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {calculateProgress(objectif.montant_actuel, objectif.montant_cible)}%
                    </Text>
                  </View>
                  <View className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <View 
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${calculateProgress(objectif.montant_actuel, objectif.montant_cible)}%`,
                      }}
                    />
                  </View>
                </View>

                <View className="flex-row justify-between mt-3">
                  <View>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Économisé
                    </Text>
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {objectif.montant_actuel.toLocaleString('fr-FR')} Ar
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Objectif
                    </Text>
                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {objectif.montant_cible.toLocaleString('fr-FR')} Ar
                    </Text>
                  </View>
                </View>

                <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Date butoir: {formatDate(objectif.date_objectif)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modal d'ajout d'objectif */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center p-5 bg-black/50">
          <View className={`w-full p-5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-xl font-bold mb-5 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingObjectif ? 'Modifier objectif' : 'Nouvel objectif'}
            </Text>
            
            <TextInput
              className={`h-12 px-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
              placeholder="Nom de l'objectif"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={newObjectif.nom}
              onChangeText={(text) => setNewObjectif({...newObjectif, nom: text})}
            />
            
            <TextInput
              className={`h-12 px-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
              placeholder="Montant cible"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              keyboardType="numeric"
              value={newObjectif.montant_cible ? newObjectif.montant_cible.toString() : ''}
              onChangeText={(text) => setNewObjectif({...newObjectif, montant_cible: Number(text) || 0})}
            />
            
            <TouchableOpacity 
              className={`h-12 px-4 rounded-lg mb-4 justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
              onPress={() => setShowDatePicker(true)}
            >
              <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Date butoir: {newObjectif.date_objectif}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={new Date(newObjectif.date_objectif)}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setNewObjectif({
                      ...newObjectif,
                      date_objectif: date.toISOString().split('T')[0]
                    });
                  }
                }}
              />
            )}
            
            <TextInput
              className={`h-24 px-4 py-3 rounded-lg mb-6 text-justify ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
              placeholder="Description (optionnel)"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              multiline
              value={newObjectif.description}
              onChangeText={(text) => setNewObjectif({...newObjectif, description: text})}
            />
            
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="flex-1 h-12 rounded-lg justify-center items-center mr-2 bg-gray-200"
                onPress={() => setShowModal(false)}
              >
                <Text className="text-gray-800">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 h-12 rounded-lg justify-center items-center ml-2 ${
                  !newObjectif.nom || !newObjectif.montant_cible ? 'bg-blue-400' : 'bg-blue-500'
                }`}
                onPress={editingObjectif ? () => handleUpdateObjectif(newObjectif as ObjectifEpargne) : handleAddObjectif}
                disabled={!newObjectif.nom || !newObjectif.montant_cible}
              >
                <Text className="text-white font-medium">{editingObjectif ? 'Modifier' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};



export default ObjectifsScreen;
