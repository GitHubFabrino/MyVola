import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Modal, TouchableOpacity, FlatList, Alert, Dimensions, Platform } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface Facture {
  id: number;
  famille_id: number;
  categorie_id?: number;
  montant: number;
  date_echeance: string;
  frequence: 'unique' | 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
  statut: 'paye' | 'en_attente' | 'en_retard';
  description?: string;
  categorie_nom?: string;
}

interface Categorie {
  id: number;
  nom: string;
  couleur: string;
}

const STATIC_CATEGORIES: Categorie[] = [
  { id: 1, nom: 'Logement', couleur: '#10B981' },
  { id: 2, nom: 'Télécommunications', couleur: '#3B82F6' },
  { id: 3, nom: 'Services publics', couleur: '#8B5CF6' },
  { id: 4, nom: 'Alimentation', couleur: '#EC4899' },
  { id: 5, nom: 'Transport', couleur: '#F59E0B' },
  { id: 6, nom: 'Santé', couleur: '#EF4444' },
  { id: 7, nom: 'Loisirs', couleur: '#06B6D4' },
  { id: 8, nom: 'Autre', couleur: '#6B7280' },
];

const FacturesScreen = () => {
  const { isDark } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // États pour le filtrage
  const [filtreMois, setFiltreMois] = useState<string>('tous');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [selectedCategorie, setSelectedCategorie] = useState<number | 'tous'>('tous');
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });

  const [formData, setFormData] = useState<Omit<Facture, 'id' | 'categorie_nom'>>({
    famille_id: 1,
    categorie_id: 1,
    montant: 0,
    date_echeance: new Date().toISOString().split('T')[0],
    frequence: 'mensuel',
    statut: 'en_attente',
    description: '',
  });

  // Sample data based on the database schema
  const factures: Facture[] = [
    {
      id: 1,
      famille_id: 1,
      categorie_id: 1,
      montant: 120.50,
      date_echeance: '2025-07-05',
      frequence: 'mensuel',
      statut: 'en_attente',
      description: 'Loyer du mois de Juillet',
      categorie_nom: 'Logement'
    },
    {
      id: 2,
      famille_id: 1,
      categorie_id: 2,
      montant: 45.30,
      date_echeance: '2025-07-10',
      frequence: 'mensuel',
      statut: 'en_attente',
      description: 'Abonnement internet',
      categorie_nom: 'Télécommunications'
    },
    {
      id: 3,
      famille_id: 1,
      categorie_id: 3,
      montant: 89.99,
      date_echeance: '2025-07-15',
      frequence: 'mensuel',
      statut: 'en_retard',
      description: 'Électricité',
      categorie_nom: 'Services publics'
    },
  ];

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'paye':
          return 'bg-green-900/30 border border-green-500/30';
        case 'en_attente':
          return 'bg-yellow-900/30 border border-yellow-500/30';
        case 'en_retard':
          return 'bg-red-900/30 border border-red-500/30';
        default:
          return 'bg-gray-800/50 border border-gray-600/30';
      }
    } else {
      switch (status) {
        case 'paye':
          return 'bg-green-100 border border-green-200';
        case 'en_attente':
          return 'bg-yellow-100 border border-yellow-200';
        case 'en_retard':
          return 'bg-red-100 border border-red-200';
        default:
          return 'bg-gray-100 border border-gray-200';
      }
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Ici vous pourriez ajouter la logique pour sauvegarder les données
    if (editingId) {
      // Mise à jour d'une facture existante
      Alert.alert('Succès', 'Facture mise à jour avec succès');
    } else {
      // Ajout d'une nouvelle facture
      Alert.alert('Succès', 'Facture ajoutée avec succès');
    }
    setShowAddModal(false);
  };

  const handleEdit = (facture: Facture) => {
    setEditingId(facture.id);
    setFormData({
      famille_id: facture.famille_id,
      categorie_id: facture.categorie_id || 1,
      montant: facture.montant,
      date_echeance: facture.date_echeance,
      frequence: facture.frequence,
      statut: facture.statut,
      description: facture.description || '',
    });
    setShowAddModal(true);
  };

  const filteredFactures = factures.filter(facture => {
    // Filtre par statut
    if (selectedStatut !== 'tous' && facture.statut !== selectedStatut) {
      return false;
    }
    
    // Filtre par catégorie
    if (selectedCategorie !== 'tous' && facture.categorie_id !== selectedCategorie) {
      return false;
    }
    
    // Filtre par date
    const factureDate = new Date(facture.date_echeance);
    if (filtreMois === 'mois_courant') {
      const now = new Date();
      return factureDate.getMonth() === now.getMonth() && 
             factureDate.getFullYear() === now.getFullYear();
    } else if (filtreMois === 'plage_dates') {
      return factureDate >= dateRange.startDate && factureDate <= dateRange.endDate;
    }
    
    return true;
  });

  const renderFilterBar = () => (
    <View className={`px-4 py-3 border-b border-gray-100 ${isDark ? 'border-gray-900' : 'border-gray-50'}`}>
      {/* Barre de filtres de statut */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-3 -mx-1"
      >
        <View className="flex-row space-x-2 px-1">
          {[
            { value: 'tous', label: 'Tous', icon: 'list', color: 'blue' },
            { value: 'en_attente', label: 'En attente', icon: 'time-outline', color: 'yellow' },
            { value: 'paye', label: 'Payé', icon: 'checkmark-done', color: 'green' },
            { value: 'en_retard', label: 'En retard', icon: 'alert-circle', color: 'red' }
          ].map((filter) => (
            <TouchableOpacity 
              key={filter.value}
              className={`px-4 py-2 rounded-full flex-row items-center space-x-2 ${selectedStatut === filter.value 
                ? `bg-${filter.color}-500` 
                : 'bg-gray-100 dark:bg-gray-800'}`}
              activeOpacity={0.8}
              onPress={() => setSelectedStatut(filter.value)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={selectedStatut === filter.value ? 'white' : isDark ? '#9CA3AF' : '#4B5563'} 
              />
              <Text 
                className={`text-sm font-medium ${selectedStatut === filter.value 
                  ? 'text-white' 
                  : 'text-gray-700 dark:text-gray-300'}`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Filtres avancés */}
      <View className="space-y-3">
        <View className="flex-row space-x-3">
          {/* Sélecteur de période */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">Période</Text>
            </View>
            <View className="relative">
              <Picker
                selectedValue={filtreMois}
                style={{ 
                  height: 44,
                  color: isDark ? '#F3F4F6' : '#111827',
                }}
                dropdownIconColor={isDark ? '#9CA3AF' : '#6B7280'}
                onValueChange={(itemValue) => {
                  setFiltreMois(itemValue);
                  if (itemValue === 'plage_dates') {
                    setShowDateRangePicker(true);
                  }
                }}
              >
                <Picker.Item label="Toutes les dates" value="tous" />
                <Picker.Item label="Mois courant" value="mois_courant" />
                <Picker.Item label="Plage personnalisée" value="plage_dates" />
              </Picker>
              <View className="absolute right-3 top-0 bottom-0 justify-center">
                <Ionicons name="chevron-down" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
            </View>
          </View>

          {/* Sélecteur de catégorie */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="pricetags" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">Catégorie</Text>
            </View>
            <View className="relative">
              <Picker
                selectedValue={selectedCategorie}
                style={{ 
                  height: 44,
                  color: isDark ? '#F3F4F6' : '#111827',
                }}
                dropdownIconColor={isDark ? '#9CA3AF' : '#6B7280'}
                onValueChange={(itemValue) => setSelectedCategorie(itemValue)}
              >
                <Picker.Item label="Toutes catégories" value="tous" />
                {STATIC_CATEGORIES.map(cat => (
                  <Picker.Item key={cat.id} label={cat.nom} value={cat.id} />
                ))}
              </Picker>
              <View className="absolute right-3 top-0 bottom-0 justify-center">
                <Ionicons name="chevron-down" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </View>
            </View>
          </View>

          {/* Bouton d'ajout */}
          <View className="justify-end">
            <TouchableOpacity 
              className="h-11 w-11 items-center justify-center bg-blue-500 rounded-xl"
              activeOpacity={0.9}
              onPress={() => {
                setEditingId(null);
                setFormData({
                  famille_id: 1,
                  categorie_id: 1,
                  montant: 0,
                  date_echeance: new Date().toISOString().split('T')[0],
                  frequence: 'mensuel',
                  statut: 'en_attente',
                  description: '',
                });
                setShowAddModal(true);
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Plage de dates */}
        {filtreMois === 'plage_dates' && (
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <TouchableOpacity 
                className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                activeOpacity={0.8}
                onPress={() => setShowStartDatePicker(true)}
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text className="ml-2 text-gray-700 dark:text-gray-300">
                    {dateRange.startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <View className="flex-1">
              <TouchableOpacity 
                className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                activeOpacity={0.8}
                onPress={() => setShowEndDatePicker(true)}
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text className="ml-2 text-gray-700 dark:text-gray-300">
                    {dateRange.endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddModal}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View className="flex-1 justify-center bg-black/50 p-4">
        <View className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingId ? 'Modifier la facture' : 'Nouvelle facture'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="max-h-[80%]">
            <View className="mb-4">
              <Text className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</Text>
              <TextInput
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Description de la facture"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </View>
            
            <View className="mb-4">
              <Text className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Montant</Text>
              <View className="flex-row items-center">
                <TextInput
                  className={`flex-1 p-3 rounded-l-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  value={formData.montant ? formData.montant.toString() : ''}
                  onChangeText={(text) => handleInputChange('montant', parseFloat(text) || 0)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
                <View className={`p-3 rounded-r-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Text className={isDark ? 'text-white' : 'text-gray-900'}>Ar</Text>
                </View>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date d'échéance</Text>
              <TouchableOpacity 
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                onPress={() => setShowDatePicker(true)}
              >
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                  {new Date(formData.date_echeance).toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.date_echeance)}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      handleInputChange('date_echeance', selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>
            
            <View className="mb-4">
              <Text className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fréquence</Text>
              <View className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Picker
                  selectedValue={formData.frequence}
                  style={{ 
                    height: 50, 
                    color: isDark ? '#fff' : '#000',
                  }}
                  onValueChange={(itemValue) => handleInputChange('frequence', itemValue)}
                >
                  <Picker.Item label="Unique" value="unique" />
                  <Picker.Item label="Quotidien" value="quotidien" />
                  <Picker.Item label="Hebdomadaire" value="hebdomadaire" />
                  <Picker.Item label="Mensuel" value="mensuel" />
                  <Picker.Item label="Trimestriel" value="trimestriel" />
                  <Picker.Item label="Annuel" value="annuel" />
                </Picker>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Catégorie</Text>
              <View className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Picker
                  selectedValue={formData.categorie_id}
                  style={{ 
                    height: 50, 
                    color: isDark ? '#fff' : '#000',
                  }}
                  onValueChange={(itemValue) => handleInputChange('categorie_id', itemValue)}
                >
                  {STATIC_CATEGORIES.map(cat => (
                    <Picker.Item key={cat.id} label={cat.nom} value={cat.id} />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View className="mb-6">
              <Text className={`mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Statut</Text>
              <View className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Picker
                  selectedValue={formData.statut}
                  style={{ 
                    height: 50, 
                    color: isDark ? '#fff' : '#000',
                  }}
                  onValueChange={(itemValue) => handleInputChange('statut', itemValue)}
                >
                  <Picker.Item label="En attente" value="en_attente" />
                  <Picker.Item label="Payé" value="paye" />
                  <Picker.Item label="En retard" value="en_retard" />
                </Picker>
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            className="bg-blue-500 py-3 rounded-lg mt-2"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-bold">
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="p-5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Factures
            </Text>
            <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Gestion des factures et échéances
            </Text>
          </View>
        </View>
      </View>

      {renderFilterBar()}
      
      <FlatList
        className={`flex-1 px-5 py-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
        data={filteredFactures}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: facture }) => (
          <View 
            key={facture.id}
            className="mb-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <View className="flex-row justify-between items-start mb-3">
              <Text 
                className="text-lg font-semibold text-gray-900 dark:text-white flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {facture.description}
              </Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {facture.montant.toLocaleString('fr-MG', { minimumFractionDigits: 2 })} Ar
              </Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <View className={`px-3 py-1 rounded-full ${getStatusColor(facture.statut)}`}>
                <Text className="text-xs font-medium text-white capitalize">
                  {facture.statut.replace('_', ' ')}
                </Text>
              </View>
              <View className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Text className="text-xs text-gray-600 dark:text-gray-300">
                  {facture.categorie_nom}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(facture.date_echeance)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons 
                  name={
                    facture.frequence === 'mensuel' ? 'repeat' : 
                    facture.frequence === 'annuel' ? 'calendar' : 'sync'
                  } 
                  size={14} 
                  color={isDark ? '#9CA3AF' : '#6B7280'} 
                />
                <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {facture.frequence}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons 
              name="receipt-outline" 
              size={48} 
              color={isDark ? '#4B5563' : '#9CA3AF'} 
            />
            <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucune facture trouvée
            </Text>
          </View>
        }
      />
      
      {renderAddModal()}
      
      {showStartDatePicker && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900">
          <DateTimePicker
            value={dateRange.startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setDateRange(prev => ({
                  ...prev,
                  startDate: selectedDate
                }));
              }
            }}
            style={isDark ? { backgroundColor: '#1F2937' } : {}}
            textColor={isDark ? '#F3F4F6' : '#111827'}
          />
          {Platform.OS === 'ios' && (
            <View className="flex-row justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <TouchableOpacity 
                onPress={() => setShowStartDatePicker(false)}
                className="px-4 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white font-medium">Valider</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {showEndDatePicker && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900">
          <DateTimePicker
            value={dateRange.endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setDateRange(prev => ({
                  ...prev,
                  endDate: selectedDate
                }));
              }
            }}
            style={isDark ? { backgroundColor: '#1F2937' } : {}}
            textColor={isDark ? '#F3F4F6' : '#111827'}
          />
          {Platform.OS === 'ios' && (
            <View className="flex-row justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <TouchableOpacity 
                onPress={() => setShowEndDatePicker(false)}
                className="px-4 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white font-medium">Valider</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default FacturesScreen;
