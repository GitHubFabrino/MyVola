import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '~/theme/ThemeContext';


// Types
interface Categorie {
  id: number;
  nom: string;
  couleur: string;
  icone: string;
}

interface Famille {
  id: number;
  nom: string;
}

interface Depense {
  id: number;
  description: string;
  montant: number;
  date: string;
  localisation?: string;
  categorie_id: number;
  famille_id: number;
  statut: 'valide' | 'en_attente' | 'annule' | 'rembourse';
}

// Données statiques
const STATIC_FAMILLES: Famille[] = [
  { id: 1, nom: 'Famille Dupont' },
  { id: 2, nom: 'Personnel' },
  { id: 3, nom: 'Voyage' },
];

const STATIC_CATEGORIES: Categorie[] = [
  { id: 1, nom: 'Alimentation', couleur: '#F59E0B', icone: 'restaurant' },
  { id: 2, nom: 'Transport', couleur: '#3B82F6', icone: 'directions-car' },
  { id: 3, nom: 'Loisirs', couleur: '#8B5CF6', icone: 'sports-esports' },
  { id: 4, nom: 'Santé', couleur: '#10B981', icone: 'medical-services' },
  { id: 5, nom: 'Courses', couleur: '#EC4899', icone: 'shopping-cart' },
];

const STATIC_DEPENSES: Depense[] = [
  {
    id: 1,
    description: 'Courses du week-end',
    montant: 125000,
    date: '2025-06-28',
    localisation: 'Supermarché Jumbo Score',
    categorie_id: 1,
    famille_id: 1,
    statut: 'valide',
  },
  {
    id: 2,
    description: 'Essence voiture',
    montant: 80000,
    date: '2025-06-27',
    localisation: 'Station Jovenna',
    categorie_id: 2,
    famille_id: 1,
    statut: 'valide',
  },
  {
    id: 3,
    description: 'Cinéma',
    montant: 30000,
    date: '2025-06-26',
    categorie_id: 3,
    famille_id: 2,
    statut: 'valide',
  },
];

const DepensesScreen = () => {
  const { isDark } = useTheme();
  const [depenses, setDepenses] = useState<Depense[]>(STATIC_DEPENSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState<Depense | null>(null);
  const [formData, setFormData] = useState<Omit<Depense, 'id'>>({
    description: '',
    montant: 0,
    date: new Date().toISOString().split('T')[0],
    localisation: '',
    categorie_id: 1,
    famille_id: 1,
    statut: 'valide',
  });

  const getCategoryById = (id: number) => {
    return STATIC_CATEGORIES.find(cat => cat.id === id) || STATIC_CATEGORIES[0];
  };

  const handleAddDepense = () => {
    const newDepense: Depense = {
      ...formData,
      id: Math.max(0, ...depenses.map(d => d.id)) + 1,
    };
    setDepenses([...depenses, newDepense]);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateDepense = () => {
    if (!selectedDepense) return;
    
    setDepenses(
      depenses.map(d => 
        d.id === selectedDepense.id ? { ...formData, id: selectedDepense.id } : d
      )
    );
    setShowAddModal(false);
    setSelectedDepense(null);
    resetForm();
  };

  const handleDeleteDepense = (id: number) => {
    setDepenses(depenses.filter(d => d.id !== id));
  };

  const resetForm = () => {
    setFormData({
      description: '',
      montant: 0,
      date: new Date().toISOString().split('T')[0],
      localisation: '',
      categorie_id: 1,
      famille_id: 1,
      statut: 'valide',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFamilleById = (id: number) => {
    return STATIC_FAMILLES.find(f => f.id === id) || { id: 0, nom: 'Inconnue' };
  };

  const renderDepenseItem = ({ item }: { item: Depense }) => {
    const category = getCategoryById(item.categorie_id);
    const famille = getFamilleById(item.famille_id);
    
    return (
      <View className={`p-5 mb-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <View className="flex-row justify-between items-start mb-3">
          {/* Left side - Category icon and details */}
          <View className="flex-row items-start flex-1">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${category.couleur}15` }}
            >
              <MaterialIcons 
                name={category.icone as any} 
                size={24} 
                color={category.couleur} 
              />
            </View>
            <View className="flex-1">
              <Text 
                className={`font-semibold text-base mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <View className="flex-col items-start">
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mr-2`}>
                  {new Date(item.date).toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric' 
                  })}
                </Text>
                
                <Text className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                  • {famille.nom}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Right side - Amount and status */}
          <View className="items-end ml-2">
            <Text 
              className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {formatCurrency(item.montant)}
            </Text>
            <View 
              className={`px-3 py-1 rounded-full ${
                item.statut === 'valide' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : item.statut === 'en_attente'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <Text 
                className={`text-xs font-medium ${
                  item.statut === 'valide' 
                    ? 'text-green-800 dark:text-green-300' 
                    : item.statut === 'en_attente'
                      ? 'text-yellow-800 dark:text-yellow-300'
                      : 'text-red-800 dark:text-red-300'
                }`}
              >
                {item.statut === 'valide' ? 'Validé' : 
                 item.statut === 'en_attente' ? 'En attente' : 
                 item.statut === 'annule' ? 'Annulé' : 'Remboursé'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Actions */}
        <View className="flex-row justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
          <TouchableOpacity 
            className="px-2 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex-row items-center justify-center mr-2"
            onPress={() => {
              setSelectedDepense(item);
              setFormData({
                description: item.description,
                montant: item.montant,
                date: item.date,
                localisation: item.localisation || '',
                categorie_id: item.categorie_id,
                famille_id: item.famille_id,
                statut: item.statut,
              });
              setShowAddModal(true);
            }}
          >
            <Ionicons name="pencil" size={16} color={isDark ? '#93C5FD' : '#3B82F6'} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="px-2 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex-row items-center justify-center mr-2"
            onPress={() => handleDeleteDepense(item.id)}
          >
            <Ionicons name="trash" size={16} color={isDark ? '#FCA5A5' : '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredDepenses = depenses.filter(depense => {
    // Filtre par recherche
    const matchesSearch = searchQuery === '' || 
      depense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryById(depense.categorie_id).nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getFamilleById(depense.famille_id).nom.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par date
    const depenseDate = new Date(depense.date);
    const matchesStartDate = !startDate || depenseDate >= new Date(startDate.setHours(0, 0, 0, 0));
    const matchesEndDate = !endDate || depenseDate <= new Date(endDate.setHours(23, 59, 59, 999));
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* En-tête */}
      <View className={`p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        {/* Barre de recherche */}
        <View className="mb-4">
          <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-2">
            <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              className="flex-1 ml-2 text-base dark:text-white"
              placeholder="Rechercher une dépense..."
              placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Ionicons 
                name="filter" 
                size={20} 
                color={showFilters ? (isDark ? '#3B82F6' : '#2563EB') : (isDark ? '#9CA3AF' : '#6B7280')} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Filtres */}
          {showFilters && (
            <View className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-2">
              <Text className="text-sm font-medium mb-2 dark:text-gray-300">Filtrer par date</Text>
              
              <View className="flex-row justify-between mb-2">
                <TouchableOpacity 
                  className="flex-1 mr-2 border border-gray-300 dark:border-gray-600 rounded p-2"
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text className="text-sm dark:text-gray-300">
                    {startDate ? startDate.toLocaleDateString('fr-FR') : 'Date de début'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 ml-2 border border-gray-300 dark:border-gray-600 rounded p-2"
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text className="text-sm dark:text-gray-300">
                    {endDate ? endDate.toLocaleDateString('fr-FR') : 'Date de fin'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {(startDate || endDate) && (
                <TouchableOpacity 
                  className="bg-red-100 dark:bg-red-900/30 rounded p-2 mt-2"
                  onPress={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  <Text className="text-red-600 dark:text-red-400 text-center text-sm font-medium">
                    Réinitialiser les filtres
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Sélecteurs de date */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartDatePicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>
        
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dépenses
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {depenses.length} dépenses ce mois-ci
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedDepense(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="p-2 bg-blue-500 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Filtres */}
        <View className="flex-row space-x-2">
          <TouchableOpacity 
            className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>Toutes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>Aujourd'hui</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>Cette semaine</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des dépenses */}
      <FlatList
        data={filteredDepenses}
        renderItem={renderDepenseItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <MaterialIcons 
              name="receipt" 
              size={48} 
              color={isDark ? '#4B5563' : '#9CA3AF'}
              className="mb-2"
            />
            <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucune dépense enregistrée
            </Text>
          </View>
        }
      />

      {/* Montant total */}
      <View className={`p-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <View className="flex-row justify-between items-center">
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Total du mois
          </Text>
          <Text className="text-xl font-bold text-blue-600">
            {formatCurrency(depenses.reduce((sum, dep) => sum + dep.montant, 0))}
          </Text>
        </View>
      </View>

      {/* Modal d'ajout/édition */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6 max-h-3/4`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedDepense ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDark ? '#9CA3AF' : '#6B7280'} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View className="space-y-4">
                {/* Famille */}
                <View className="mb-4">
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Famille
                  </Text>
                  <View className={`border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} rounded-lg overflow-hidden`}>
                    <Picker
                      selectedValue={formData.famille_id}
                      onValueChange={(itemValue) => setFormData({...formData, famille_id: itemValue})}
                      dropdownIconColor={isDark ? 'white' : 'black'}
                      style={{
                        color: isDark ? 'white' : 'black',
                      }}
                    >
                      <Picker.Item label="Sélectionner une famille" value={0} enabled={false} />
                      {STATIC_FAMILLES.map((famille) => (
                        <Picker.Item 
                          key={famille.id} 
                          label={famille.nom} 
                          value={famille.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Catégorie */}
                <View className="mb-4">
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Catégorie
                  </Text>
                  <View className={`border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'} rounded-lg`}>
                    <Picker
                      selectedValue={formData.categorie_id}
                      onValueChange={(itemValue) => setFormData({...formData, categorie_id: itemValue})}
                      dropdownIconColor={isDark ? 'white' : 'black'}
                      style={{
                        color: isDark ? 'white' : 'black',
                      }}
                    >
                      <Picker.Item label="Sélectionner une catégorie" value="" />
                      {STATIC_CATEGORIES.map((category) => (
                        <Picker.Item 
                          key={category.id}
                          label={category.nom}
                          value={category.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Montant */}
                <View>
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Montant (MGA)
                  </Text>
                  <View className={`flex-row items-center px-3 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Text className={`mr-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>MGA</Text>
                    <TextInput
                      className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      placeholder="0"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      keyboardType="numeric"
                      value={formData.montant ? formData.montant.toString() : ''}
                      onChangeText={text => 
                        setFormData({...formData, montant: parseFloat(text) || 0})
                      }
                    />
                  </View>
                </View>

                {/* Description */}
                <View>
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Description
                  </Text>
                  <TextInput
                    className={`px-3 py-2 rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    placeholder="Ex: Courses du week-end"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.description}
                    onChangeText={text => setFormData({...formData, description: text})}
                  />
                </View>

                {/* Localisation */}
                <View>
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Localisation (optionnel)
                  </Text>
                  <View className={`flex-row items-center px-3 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Ionicons 
                      name="location" 
                      size={16} 
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                      className="mr-2"
                    />
                    <TextInput
                      className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      placeholder="Ex: Supermarché Jumbo Score"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={formData.localisation || ''}
                      onChangeText={text => setFormData({...formData, localisation: text})}
                    />
                  </View>
                </View>

                {/* Date */}
                <View>
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Date
                  </Text>
                  <View className={`flex-row items-center px-3 py-2 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Ionicons 
                      name="calendar" 
                      size={16} 
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                      className="mr-2"
                    />
                    <TextInput
                      className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                      placeholder="AAAA-MM-JJ"
                      placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                      value={formData.date}
                      onChangeText={text => setFormData({...formData, date: text})}
                    />
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      AAAA-MM-JJ
                    </Text>
                  </View>
                </View>

                {/* Statut */}
                <View>
                  <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Statut
                  </Text>
                  <View className="flex-row space-x-2">
                    {['valide', 'en_attente', 'annule', 'rembourse'].map(status => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setFormData({...formData, statut: status as any})}
                        className={`px-3 py-1 rounded-full ${
                          formData.statut === status
                            ? status === 'valide'
                              ? 'bg-green-100 text-green-800'
                              : status === 'en_attente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : status === 'annule'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            : isDark
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Text className="text-xs">
                          {status === 'valide' ? 'Validé' : 
                           status === 'en_attente' ? 'En attente' : 
                           status === 'annule' ? 'Annulé' : 'Remboursé'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Boutons d'action */}
                <View className="flex-row space-x-3 mt-6">
                  <TouchableOpacity
                    className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
                    onPress={selectedDepense ? handleUpdateDepense : handleAddDepense}
                  >
                    <Text className="text-white font-medium">
                      {selectedDepense ? 'Mettre à jour' : 'Ajouter la dépense'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DepensesScreen;
