import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '~/theme/ThemeContext';

type StatutDette = 'actif' | 'rembourse' | 'en_retard';

interface Dette {
  id: number;
  famille_id: number;
  creancier: string;
  montant_initial: number;
  montant_actuel: number;
  taux_interet: number;
  date_debut: string;
  date_echeance: string | null;
  statut: StatutDette;
  description?: string;
}

// Données de démonstration
const dettesDemo: Dette[] = [
  {
    id: 1,
    famille_id: 1,
    creancier: 'Banque MGA',
    montant_initial: 5000000,
    montant_actuel: 3200000,
    taux_interet: 5.5,
    date_debut: '2024-01-15',
    date_echeance: '2025-12-31',
    statut: 'actif',
    description: 'Prêt immobilier'
  },
  {
    id: 2,
    famille_id: 1,
    creancier: 'AMI Finance',
    montant_initial: 2000000,
    montant_actuel: 1500000,
    taux_interet: 8.0,
    date_debut: '2024-03-10',
    date_echeance: '2024-09-10',
    statut: 'en_retard',
    description: 'Crédit consommation'
  }
];

const DettesScreen = () => {
  const { isDark } = useTheme();
  const [dettes, setDettes] = useState<Dette[]>(dettesDemo);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDette, setSelectedDette] = useState<Dette | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [formData, setFormData] = useState<Omit<Dette, 'id' | 'famille_id'>>({
    creancier: '',
    montant_initial: 0,
    montant_actuel: 0,
    taux_interet: 0,
    date_debut: new Date().toISOString().split('T')[0],
    date_echeance: null,
    statut: 'actif',
    description: ''
  });
  const [showDateDebutPicker, setShowDateDebutPicker] = useState(false);
  const [showDateEcheancePicker, setShowDateEcheancePicker] = useState(false);

  const filteredDettes = dettes.filter(dette =>
    dette.creancier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dette.description && dette.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (statut: StatutDette) => {
    switch (statut) {
      case 'actif': return isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'rembourse': return isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'en_retard': return isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      default: return isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      creancier: '',
      montant_initial: 0,
      montant_actuel: 0,
      taux_interet: 0,
      date_debut: new Date().toISOString().split('T')[0],
      date_echeance: null,
      statut: 'actif',
      description: ''
    });
  };

  const handleAddDette = () => {
    setFormMode('add');
    resetForm();
    setModalVisible(true);
  };

  const handleEditDette = (dette: Dette) => {
    setFormMode('edit');
    setSelectedDette(dette);
    setFormData({
      creancier: dette.creancier,
      montant_initial: dette.montant_initial,
      montant_actuel: dette.montant_actuel,
      taux_interet: dette.taux_interet,
      date_debut: dette.date_debut,
      date_echeance: dette.date_echeance,
      statut: dette.statut,
      description: dette.description || ''
    });
    setModalVisible(true);
  };

  const handleDeleteDette = (id: number) => {
    Alert.alert(
      'Supprimer la dette',
      'Êtes-vous sûr de vouloir supprimer cette dette ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setDettes(prev => prev.filter(d => d.id !== id));
            if (selectedDette?.id === id) {
              setModalVisible(false);
              setSelectedDette(null);
            }
          },
        }
      ]
    );
  };

  const handleSubmit = () => {
    if (!formData.creancier || formData.montant_initial <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formMode === 'add') {
      const newDette: Dette = {
        ...formData,
        id: Math.max(0, ...dettes.map(d => d.id)) + 1,
        famille_id: 1,
        montant_actuel: formData.montant_actuel || formData.montant_initial
      };
      setDettes(prev => [...prev, newDette]);
    } else if (formMode === 'edit' && selectedDette) {
      setDettes(prev => prev.map(d =>
        d.id === selectedDette.id
          ? { ...d, ...formData, montant_actuel: formData.montant_actuel || formData.montant_initial }
          : d
      ));
    }

    setModalVisible(false);
    setFormMode(null);
    resetForm();
  };

  const renderDetteItem = ({ item }: { item: Dette }) => (
    <TouchableOpacity
      className={`mb-3 rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      onPress={() => {
        setSelectedDette(item);
        setModalVisible(true);
      }}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {item.creancier}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {item.description}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(item.montant_actuel)}
          </Text>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            sur {formatCurrency(item.montant_initial)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-full ${getStatusColor(item.statut)}`}>
            <Text className="text-xs font-medium">
              {item.statut.charAt(0).toUpperCase() + item.statut.slice(1)}
            </Text>
          </View>
          <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
            {item.taux_interet}% d'intérêt
          </Text>
        </View>
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Échéance: {item.date_echeance ? new Date(item.date_echeance).toLocaleDateString('fr-FR') : 'Non définie'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderForm = () => (
    <ScrollView>
      <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {formMode === 'add' ? 'Ajouter une dette' : 'Modifier la dette'}
      </Text>

      <View className="mb-4">
        <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Créancier <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
          value={formData.creancier}
          onChangeText={(text) => handleInputChange('creancier', text)}
          placeholder="Nom du créancier"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        />
      </View>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Montant initial <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
            value={formData.montant_initial.toString()}
            onChangeText={(text) => handleInputChange('montant_initial', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Montant actuel
          </Text>
          <TextInput
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
            value={formData.montant_actuel.toString()}
            onChangeText={(text) => handleInputChange('montant_actuel', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Taux d'intérêt (%)
        </Text>
        <TextInput
          className={`p-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
          value={formData.taux_interet.toString()}
          onChangeText={(text) => handleInputChange('taux_interet', parseFloat(text) || 0)}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        />
      </View>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Date de début
          </Text>
          <TouchableOpacity
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            onPress={() => setShowDateDebutPicker(true)}
          >
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>
              {format(new Date(formData.date_debut), 'PPP', { locale: fr })}
            </Text>
          </TouchableOpacity>
          {showDateDebutPicker && (
            <DateTimePicker
              value={new Date(formData.date_debut)}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDateDebutPicker(false);
                if (date) {
                  handleInputChange('date_debut', date.toISOString().split('T')[0]);
                }
              }}
            />
          )}
        </View>
        <View className="flex-1 ml-2">
          <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Date d'échéance
          </Text>
          <TouchableOpacity
            className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            onPress={() => setShowDateEcheancePicker(true)}
          >
            <Text className={formData.date_echeance ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-400')}>
              {formData.date_echeance ? format(new Date(formData.date_echeance), 'PPP', { locale: fr }) : 'Non définie'}
            </Text>
          </TouchableOpacity>
          {showDateEcheancePicker && (
            <DateTimePicker
              value={formData.date_echeance ? new Date(formData.date_echeance) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDateEcheancePicker(false);
                if (date) {
                  handleInputChange('date_echeance', date.toISOString().split('T')[0]);
                } else {
                  handleInputChange('date_echeance', null);
                }
              }}
            />
          )}
        </View>
      </View>

      <View className="mb-4">
        <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Statut
        </Text>
        <View className="flex-row">
          {(['actif', 'en_retard', 'rembourse'] as const).map((statut) => (
            <TouchableOpacity
              key={statut}
              className={`flex-1 p-2 mr-2 rounded-lg items-center ${formData.statut === statut ? 'bg-blue-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
              onPress={() => handleInputChange('statut', statut)}
            >
              <Text className={formData.statut === statut ? 'text-white font-semibold' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                {statut.charAt(0).toUpperCase() + statut.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Description (optionnel)
        </Text>
        <TextInput
          className={`p-3 rounded-lg h-24 text-align-top ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Ajoutez des détails sur cette dette..."
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          multiline
        />
      </View>

      <View className="flex-row">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center mr-2 ${isDark ? 'bg-red-600' : 'bg-red-500'}`}
          onPress={() => {
            setFormMode(null);
            setModalVisible(false);
            resetForm();
          }}
        >
          <Text className="text-white font-semibold">Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ml-2 ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold">
            {formMode === 'add' ? 'Ajouter' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View className={`flex-1 p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Mes Dettes
      </Text>

      <View className={`mb-4 p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <View className="flex-row items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
          <Ionicons name="search" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <TextInput
            placeholder="Rechercher une dette..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className={`p-3 rounded-lg flex-1 mr-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Total dû</Text>
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(dettes.reduce((sum, d) => sum + d.montant_actuel, 0))}
          </Text>
        </View>
        <View className={`p-3 rounded-lg flex-1 ml-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Dettes en retard</Text>
          <Text className="text-lg font-semibold text-red-500">
            {dettes.filter(d => d.statut === 'en_retard').length}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredDettes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDetteItem}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Aucune dette trouvée
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        className={`absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}
        onPress={handleAddDette}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          {formMode  ? (
            <View className={`w-full rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              {renderForm()}
            </View>
          ) : selectedDette  ? (
            <View className={`w-full rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="flex-row justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedDette.creancier}
                </Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className="p-2 mr-2"
                    onPress={() => handleEditDette(selectedDette)}
                  >
                    <Ionicons name="pencil" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteDette(selectedDette.id)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView className="max-h-[70vh] p-6">
                <View className="mb-4">
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Description</Text>
                  <Text className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDette.description || 'Aucune description'}
                  </Text>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Montant initial</Text>
                    <Text className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(selectedDette.montant_initial)}
                    </Text>
                  </View>
                  <View>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Montant actuel</Text>
                    <Text className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(selectedDette.montant_actuel)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Taux d'intérêt</Text>
                    <Text className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDette.taux_interet}%
                    </Text>
                  </View>
                  <View>
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Statut</Text>
                    <View className={`mt-1 px-2 py-1 rounded-full self-start ${getStatusColor(selectedDette.statut)}`}>
                      <Text className="text-xs font-medium">
                        {selectedDette.statut.charAt(0).toUpperCase() + selectedDette.statut.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date de début</Text>
                  <Text className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(selectedDette.date_debut).toLocaleDateString('fr-FR')}
                  </Text>
                </View>

                {selectedDette.date_echeance && (
                  <View className="mb-6">
                    <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date d'échéance</Text>
                    <Text className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedDette.date_echeance).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  className={`py-3 rounded-lg items-center ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-semibold">Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : null}

        </View>
      </Modal>
    </View>
  );
};

export default DettesScreen;
