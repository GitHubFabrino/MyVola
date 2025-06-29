import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface Budget {
  id: number;
  categorie_id: number;
  categorie_nom: string;
  montant: number;
  mois: number;
  annee: number;
  depense_actuelle: number;
  depenseur_nom: string;
  depenseur_id: number;
}

interface Category {
  id: number;
  nom: string;
  type: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// Données statiques pour les catégories
const STATIC_CATEGORIES: Category[] = [
  { id: 1, nom: 'Alimentation', type: 'depense' },
  { id: 2, nom: 'Transport', type: 'depense' },
  { id: 3, nom: 'Logement', type: 'depense' },
  { id: 4, nom: 'Loisirs', type: 'depense' },
  { id: 5, nom: 'Santé', type: 'depense' },
  { id: 6, nom: 'Éducation', type: 'depense' },
];

// Données statiques pour les budgets
const STATIC_BUDGETS: Budget[] = [
  { 
    id: 1, 
    categorie_id: 1, 
    categorie_nom: 'Alimentation', 
    montant: 300000, 
    mois: currentMonth, 
    annee: currentYear,
    depense_actuelle: 150000,
    depenseur_nom: 'Jean Dupont',
    depenseur_id: 1
  },
  { 
    id: 2, 
    categorie_id: 2, 
    categorie_nom: 'Transport', 
    montant: 150000, 
    mois: currentMonth, 
    annee: currentYear,
    depense_actuelle: 120000,
    depenseur_nom: 'Marie Martin',
    depenseur_id: 2
  },
  { 
    id: 3, 
    categorie_id: 3, 
    categorie_nom: 'Logement', 
    montant: 500000, 
    mois: currentMonth, 
    annee: currentYear,
    depense_actuelle: 500000,
    depenseur_nom: 'Pierre Durand',
    depenseur_id: 3
  },
];

const BudgetsScreen = () => {
  const { isDark } = useTheme();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>(STATIC_BUDGETS);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<Omit<Budget, 'id' | 'categorie_nom' | 'depense_actuelle'>>({ 
    categorie_id: 0, 
    montant: 0, 
    mois: currentMonth, 
    annee: currentYear,
    depenseur_nom: 'Jean Dupont', // Default value
    depenseur_id: 1 // Default value
  });

  const handleSaveBudget = () => {
    if (!formData.categorie_id || formData.montant <= 0) {
      return;
    }

    if (editingBudget) {
      // Mise à jour d'un budget existant
      setBudgets(budgets.map(b => 
        b.id === editingBudget.id 
          ? { 
              ...b, 
              categorie_id: formData.categorie_id,
              categorie_nom: STATIC_CATEGORIES.find(c => c.id === formData.categorie_id)?.nom || '',
              montant: formData.montant,
              mois: selectedMonth,
              annee: selectedYear,
              depenseur_nom: formData.depenseur_nom,
              depenseur_id: formData.depenseur_id
            } 
          : b
      ));
    } else {
      // Création d'un nouveau budget
      const newBudget: Budget = {
        id: Math.max(0, ...budgets.map(b => b.id)) + 1,
        categorie_id: formData.categorie_id,
        categorie_nom: STATIC_CATEGORIES.find(c => c.id === formData.categorie_id)?.nom || '',
        montant: formData.montant,
        mois: selectedMonth,
        annee: selectedYear,
        depense_actuelle: 0,
        depenseur_nom: formData.depenseur_nom || 'Jean Dupont',
        depenseur_id: formData.depenseur_id || 1
      };
      setBudgets([...budgets, newBudget]);
    }
    
    setShowForm(false);
    setEditingBudget(null);
    setFormData({ 
      categorie_id: 0, 
      montant: 0, 
      mois: selectedMonth, 
      annee: selectedYear,
      depenseur_nom: 'Jean Dupont',
      depenseur_id: 1
    });
  };

  const handleDeleteBudget = (id: number) => {
    setBudgets(budgets.filter(budget => budget.id !== id));
  };

  const getProgressBarColor = (depense: number, budget: number) => {
    const percentage = (depense / budget) * 100;
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryName = (categoryId: number) => {
    const category = STATIC_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.nom : 'Catégorie inconnue';
  };

  const renderBudgetModal = () => (
    <Modal
      visible={!!selectedBudget}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedBudget(null)}
    >
      <View style={styles.modalOverlay}>
        <View className={`p-6 rounded-xl w-5/6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Détails du budget
            </Text>
            <TouchableOpacity onPress={() => setSelectedBudget(null)}>
              <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          
          {selectedBudget && (
            <View className="space-y-4">
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Catégorie</Text>
                <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBudget.categorie_nom}
                </Text>
              </View>
              
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dépensé par</Text>
                <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBudget.depenseur_nom || 'Non spécifié'}
                </Text>
              </View>
              
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Budget alloué</Text>
                <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBudget.montant.toLocaleString()} Ar
                </Text>
              </View>
              
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dépense actuelle</Text>
                <Text className={`text-lg ${selectedBudget.depense_actuelle > selectedBudget.montant ? 'text-red-500' : isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {selectedBudget.depense_actuelle.toLocaleString()} Ar
                </Text>
              </View>
              
              <View className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Période</Text>
                <Text className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {MONTHS[selectedBudget.mois - 1]} {selectedBudget.annee}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {renderBudgetModal()}
      {/* En-tête */}
      <View className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Gestion des Budgets
        </Text>
        
        {/* Sélecteur de mois/année */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity 
            onPress={() => {
              const newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
              const newYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
              setSelectedMonth(newMonth);
              setSelectedYear(newYear);
            }}
            className="p-2"
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={isDark ? '#9CA3AF' : '#4B5563'} 
            />
          </TouchableOpacity>
          
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </Text>
          
          <TouchableOpacity 
            onPress={() => {
              const newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
              const newYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
              setSelectedMonth(newMonth);
              setSelectedYear(newYear);
            }}
            className="p-2"
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={isDark ? '#9CA3AF' : '#4B5563'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Résumé des budgets */}
        <View className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Budgets du mois
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setEditingBudget(null);
                setFormData({ 
                  categorie_id: 0, 
                  montant: 0, 
                  mois: selectedMonth, 
                  annee: selectedYear,
                  depenseur_nom: 'Jean Dupont',
                  depenseur_id: 1
                });
                setShowForm(true);
              }}
              className="p-2 bg-blue-500 rounded-full"
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {budgets.length === 0 ? (
            <View className="items-center py-8">
              <MaterialIcons 
                name="account-balance-wallet" 
                size={48} 
                color={isDark ? '#6B7280' : '#9CA3AF'} 
                className="mb-2"
              />
              <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Aucun budget défini pour ce mois-ci
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {budgets.map((budget) => (
                <View 
                  key={budget.id} 
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity onPress={() => setSelectedBudget(budget)} className="flex-1">
                      <View>
                        <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {budget.categorie_nom || getCategoryName(budget.categorie_id)}
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Par {budget.depenseur_nom || 'Utilisateur'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View className="flex-row space-x-2">
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditingBudget(budget);
                          setFormData({
                            categorie_id: budget.categorie_id,
                            montant: budget.montant,
                            mois: budget.mois,
                            annee: budget.annee,
                            depenseur_nom: budget.depenseur_nom,
                            depenseur_id: budget.depenseur_id
                          });
                          setShowForm(true);
                        }}
                        className="p-1"
                      >
                        <Ionicons 
                          name="pencil" 
                          size={18} 
                          color={isDark ? '#9CA3AF' : '#6B7280'} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteBudget(budget.id!)}
                        className="p-1"
                      >
                        <Ionicons 
                          name="trash" 
                          size={18} 
                          color="#EF4444" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <TouchableOpacity onPress={() => setSelectedBudget(budget)} className="mt-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Dépensé: {budget.depense_actuelle?.toLocaleString('fr-MG')} Ar
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Budget: {budget.montant.toLocaleString('fr-MG')} Ar
                      </Text>
                    </View>
                    
                    <View className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <View 
                        className={`h-full rounded-full ${getProgressBarColor(budget.depense_actuelle, budget.montant)}`}
                        style={{ 
                          width: `${Math.min(100, (budget.depense_actuelle / budget.montant) * 100)}%` 
                        }}
                      />
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {((budget.depense_actuelle / budget.montant) * 100).toFixed(0)}% du budget utilisé
                      </Text>
                      <Text className={`text-xs font-medium ${
                        budget.depense_actuelle > budget.montant 
                          ? 'text-red-500' 
                          : isDark 
                            ? 'text-green-400' 
                            : 'text-green-600'
                      }`}>
                        {budget.montant - budget.depense_actuelle > 0 
                          ? `Reste: ${(budget.montant - budget.depense_actuelle).toLocaleString('fr-MG')} Ar` 
                          : 'Budget dépassé'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Formulaire d'ajout/modification de budget */}
      {showForm && (
        <View className={`absolute inset-0 bg-black bg-opacity-50 justify-center p-4`}>
          <View className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {editingBudget ? 'Modifier le budget' : 'Nouveau budget'}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <View className="mb-4">
              <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Catégorie</Text>
              <View className={`border rounded-lg p-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <View className="flex-row justify-between items-center">
                  <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formData.categorie_id ? 
                      STATIC_CATEGORIES.find(c => c.id === formData.categorie_id)?.nom : 
                      'Sélectionner une catégorie'}
                  </Text>
                  <Ionicons 
                    name="chevron-down" 
                    size={20} 
                    color={isDark ? '#9CA3AF' : '#6B7280'} 
                  />
                </View>
              </View>
              
              <View className={`mt-2 border rounded-lg max-h-40 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <ScrollView className="max-h-36">
                  {STATIC_CATEGORIES.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setFormData({...formData, categorie_id: category.id})}
                      className={`p-3 ${formData.categorie_id === category.id ? 
                        (isDark ? 'bg-blue-900' : 'bg-blue-100') : 
                        ''}`}
                    >
                      <Text className={isDark ? 'text-white' : 'text-gray-900'}>{category.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View className="mb-6">
              <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Montant du budget</Text>
              <View className={`flex-row items-center border rounded-lg p-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                <Text className={`mr-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ar</Text>
                <TextInput
                  className={`flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                  keyboardType="numeric"
                  value={formData.montant ? formData.montant.toString() : ''}
                  onChangeText={(text: string) => {
                    const value = text.replace(/[^0-9]/g, '');
                    setFormData({...formData, montant: value ? parseFloat(value) : 0});
                  }}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                />
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className={`flex-1 py-3 rounded-lg items-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <Text className={isDark ? 'text-white' : 'text-gray-900'}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveBudget}
                className="flex-1 py-3 bg-blue-500 rounded-lg items-center"
              >
                <Text className="text-white font-medium">Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default BudgetsScreen;
