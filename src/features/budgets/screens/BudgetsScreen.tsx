import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '~/store/hooks';
import { selectAllCategories } from '~/store/categorie/categorieSlice';
import { selectAllBudgets, fetchBudgets } from '~/store/budget/budgetSlice';
import DetailsBudgetModal from './modals/DetailsBudgetModal';
import AjoutBudgetModal from './modals/AjoutBudgetModal';

import { Budget } from '~/services/db/types/budgetType';

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
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Omit<Budget, 'categorie_id'> & { categorie_id: number | null } | null>(null);
  const [formData, setFormData] = useState<{
    categorie_id: number | null;
    montant: number;
    mois: number;
    annee: number;
    depenseur_nom?: string;
    depenseur_id?: number;
    famille_id?: number;
  }>({ 
    categorie_id: null, 
    montant: 0, 
    mois: currentMonth, 
    annee: currentYear,
    depenseur_nom: 'Jean Dupont',
    depenseur_id: 1,
    famille_id: 1 // Valeur par défaut, à remplacer par l'ID de la famille de l'utilisateur connecté
  });

  // Récupérer les budgets depuis le store Redux
  const budgets = useAppSelector(selectAllBudgets);
  console.log('======>Budgets depuis le store Redux:', budgets);
  const budgetsStatus = useAppSelector((state) => state.budget.status);
  
  // Récupérer les catégories depuis le store Redux
  const categories = useAppSelector(selectAllCategories);
  const categoriesStatus = useAppSelector((state) => state.categorie.status);
  
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (budgetsStatus === 'idle') {
      dispatch(fetchBudgets());
    }
  }, [dispatch, budgetsStatus]);
  
  const isLoading = budgetsStatus === 'loading';




  const handleDeleteBudget = async (id: number) => {
    try {
      // Ici, vous pouvez ajouter une logique de suppression si nécessaire
      // Par exemple : await dispatch(deleteBudget(id));
      console.log('Suppression du budget avec ID:', id);
    } catch (error) {
      console.error('Erreur lors de la suppression du budget:', error);
    }
  };

  const getProgressBarColor = (depense: number, budget: number) => {
    const percentage = (depense / budget) * 100;
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCategoryName = (categoryId: number | null) => {
    if (categoryId === null) return 'Aucune catégorie';
    const category = STATIC_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.nom : 'Catégorie inconnue';
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DetailsBudgetModal selectedBudget={selectedBudget} selectedMonth={selectedMonth} selectedYear={selectedYear} MONTHS={MONTHS} setSelectedBudget={setSelectedBudget} />
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
                          Par {budget.famille_nom || budget.utilisateur_nom || 'Utilisateur'}
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
                        className={`h-full rounded-full ${getProgressBarColor(budget.depense_actuelle!, budget.montant)}`}
                        style={{ 
                          width: `${Math.min(100, (budget.depense_actuelle! / budget.montant) * 100)}%` 
                        }}
                      />
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {((budget.depense_actuelle! / budget.montant) * 100).toFixed(0)}% du budget utilisé
                      </Text>
                      <Text className={`text-xs font-medium ${
                        budget.depense_actuelle! > budget.montant 
                          ? 'text-red-500' 
                          : isDark 
                            ? 'text-green-400' 
                            : 'text-green-600'
                      }`}>
                        {budget.montant - budget.depense_actuelle! > 0 
                          ? `Reste: ${(budget.montant - budget.depense_actuelle!).toLocaleString('fr-MG')} Ar` 
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
        <AjoutBudgetModal 
          selectedBudget={selectedBudget}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          MONTHS={MONTHS}
          showForm={showForm}
          setShowForm={setShowForm}
          setSelectedBudget={setSelectedBudget}
        />
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
