import { ScrollView, TextInput, TouchableOpacity, View, Text, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "~/theme/ThemeContext";
import { useEffect, useState } from "react";
import { Budget, CreateBudgetDTO } from "~/services/db/types/budgetType";
import { Categorie } from "~/services/db/types/categorieType";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { selectAllCategories, fetchCategories } from "~/store/categorie/categorieSlice";
import { useAuth } from "~/store/auth/hooks";
import { addBudgetNew, fetchBudgets } from "~/store/budget/budgetSlice";
import { fetchFamilies, selectAllFamilles } from "~/store/famille/familleSlice";

interface AjoutBudgetModalProps {
    selectedBudget: any;
    selectedMonth: number;
    selectedYear: number;
    MONTHS: string[];
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    setSelectedBudget: (budget: any) => void;
}

const AjoutBudgetModal = ({ selectedBudget, selectedMonth, selectedYear, MONTHS, showForm, setShowForm, setSelectedBudget }: AjoutBudgetModalProps) => {
    const { isDark } = useTheme();

    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [formData, setFormData] = useState<Omit<Budget, 'id' | 'depense_actuelle'>>({ 
      categorie_id: 0, 
      montant: 0, 
      mois: selectedMonth, 
      annee: selectedYear,
      famille_id: 0,
      membre_famille_id: 0,
      type: 'personal',
    });
    const [budgetType, setBudgetType] = useState<'personal' | 'family'>('personal');
    const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showFamilyDropdownPersonal, setShowFamilyDropdownPersonal] = useState(false);
    const [showFamilyDropdownPersonalNom, setShowFamilyDropdownPersonalNom] = useState(false);
    const [showFamilyDropdownPersonalMembre, setShowFamilyDropdownPersonalMembre] = useState(false);
    const [showFamilyDropdownFamily, setShowFamilyDropdownFamily] = useState(false);

    const [selectedFamilyMembre, setSelectedFamilyMembre] = useState<number | null>(null);
    const [membreDispo, setMembreDispo] = useState<any[]>([]);

    const { user } = useAuth();
    const dispatch = useAppDispatch();

    // Récupérer les catégories depuis le store Redux
    const categories = useAppSelector(selectAllCategories);
    const families = useAppSelector(selectAllFamilles);
    const categoriesStatus = useAppSelector((state) => state.categorie.status);
    const familiesStatus = useAppSelector((state) => state.famille.status);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les catégories au montage du composant
    useEffect(() => {
      const loadCategories = async () => {
        try {
          await dispatch(fetchCategories()).unwrap();
        } catch (error) {
          console.error('Erreur lors du chargement des catégories:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const loadFamilies = async () => {
        try {
          const dataAllFamilies = await dispatch(fetchFamilies()).unwrap();
          console.log('Familles disponibles:', dataAllFamilies);
        } catch (error) {
          console.error('Erreur lors du chargement des familles:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadCategories();
      loadFamilies();
    }, [dispatch]);

    // Logs de débogage
    useEffect(() => {
      console.log('Statut des catégories:', categoriesStatus);
      console.log('Catégories disponibles:', categories);
      console.log('Statut des familles:', familiesStatus);
      console.log('Familles disponibles:', families);      
      if (categoriesStatus === 'succeeded') {
        if (categories.length > 0) {
          console.log('Catégories chargées avec succès:', categories);
        } else {
          console.log('Aucune catégorie disponible');
        }
      } else if (categoriesStatus === 'failed') {
        console.error('Erreur lors du chargement des catégories');
      }
    }, [categoriesStatus, categories]);

    const handleSaveBudget = async () => {
        if (!formData.categorie_id || formData.montant <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingBudget) {
        // Logique de mise à jour si nécessaire
      } else {
        // Création d'un nouveau budget
        const newBudget: CreateBudgetDTO = {
          categorie_id: formData.categorie_id,
          montant: formData.montant,
          mois: selectedMonth,
          annee: selectedYear,
          famille_id: selectedFamily || 0,
          type: budgetType,
          utilisateur_id: user?.id || 0
        };

        console.log('Nouveau budget:', newBudget);

        // Dispatch l'action et attendre qu'elle soit terminée
        const resultAction = await dispatch(addBudgetNew(newBudget));
        
        if (addBudgetNew.fulfilled.match(resultAction)) {
          // Si l'ajout a réussi, on peut fermer le modal
          setShowForm(false);
          setEditingBudget(null);
          setFormData({ 
            categorie_id: null, 
            montant: 0, 
            mois: selectedMonth, 
            annee: selectedYear,
            famille_id: user?.id || 0
          });
          
          // Recharger les budgets pour s'assurer que la liste est à jour
          dispatch(fetchBudgets());
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du budget:', error);
    }    };

    return (
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
              {/* Type de budget */}
              <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type de budget</Text>
              <View className="flex-row mb-4 space-x-4">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg items-center ${budgetType === 'personal' ? 
                    'bg-blue-500' : 
                    (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
                  onPress={() =>{ setBudgetType('personal'); setShowFamilyDropdownFamily(false); setShowFamilyDropdownPersonalNom(false); setShowFamilyDropdownPersonalMembre(false) }}
                >
                  <Text className={budgetType === 'personal' ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-700')}>
                    Personnel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg items-center ${budgetType === 'family' ? 
                    'bg-blue-500' : 
                    (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
                  onPress={() => {setBudgetType('family'); setShowFamilyDropdownPersonalNom(false); setShowFamilyDropdownPersonalMembre(false); setShowFamilyDropdownFamily(false)}}
                >
                  <Text className={budgetType === 'family' ? 'text-white' : (isDark ? 'text-gray-300' : 'text-gray-700')}>
                    Famille
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sélecteur de famille (visible uniquement si type = famille) */}
              {budgetType === 'family' && (<>
              
                <View className="mb-4">
                  <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Famillffffe</Text>
                  <TouchableOpacity
                    className={`border rounded-lg p-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                    onPress={() => setShowFamilyDropdownFamily(true)}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                        {selectedFamily ? 
                          families.find(f => f.id === selectedFamily)?.nom : 
                          'Sélectionner une famille'}
                      </Text>
                      <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                  {showFamilyDropdownFamily && (
                    <View className={`mt-1 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                      {isLoading ? (
                        <View className="p-4 items-center">
                          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Chargement...</Text>
                        </View>
                      ) : families.length === 0 ? (
                        <View className="p-4">
                          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Aucun membre disponible</Text>
                        </View>
                      ) : (
                        <ScrollView className="max-h-40">
                          {families.map(family => (
                            <TouchableOpacity
                              key={family.id}
                              onPress={() => {
                                setFormData({...formData, famille_id: family.id});
                                setShowFamilyDropdownFamily(false);
                                setSelectedFamily(family.id || null);
                              }}
                              className={`p-3 ${formData.famille_id === family.id ? 
                                (isDark ? 'bg-blue-900' : 'bg-blue-100') : 
                                ''}`}
                            >
                              <Text className={isDark ? 'text-white' : 'text-gray-900'}>{family.nom}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}
              </>)}














{/* 


{budgetType === 'personal' && (<>
  <View className="mb-4">
                  <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Famille</Text>
                  <TouchableOpacity
                    className={`border rounded-lg p-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                    onPress={() => {setShowFamilyDropdownPersonalNom(true) ; setShowFamilyDropdownPersonalMembre(false)}}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                        {selectedFamily ? 
                          families.find(f => f.id === selectedFamily)?.nom : 
                          'Sélectionner une famille'}
                      </Text>
                      <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                      />
                    </View>
                  </TouchableOpacity>

                  {showFamilyDropdownPersonalNom && (
                    <View className={`mt-1 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                      {isLoading ? (
                        <View className="p-4 items-center">
                          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Chargement...</Text>
                        </View>
                      ) : families.length === 0 ? (
                        <View className="p-4">
                          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Aucun membre disponible</Text>
                        </View>
                      ) : (
                        <ScrollView className="max-h-40">
                          {families.map(family => (
                            <TouchableOpacity
                              key={family.id}
                              onPress={() => {
                                setFormData({...formData, famille_id: family.id});
                                setShowFamilyDropdownPersonalNom(false);
                                setSelectedFamily(family.id || null);
                                // Ensure membres is an array and has elements before setting
                                const membres = Array.isArray(family.membres) ? family.membres : [];
                                console.log('Membres chargés:', membres);
                                setMembreDispo(membres);
                              }}
                              className={`p-3 ${formData.famille_id === family.id ? 
                                (isDark ? 'bg-blue-900' : 'bg-blue-100') : 
                                ''}`}
                            >
                              <Text className={isDark ? 'text-white' : 'text-gray-900'}>{family.nom}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>)}

                  <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Membre</Text>

                  <TouchableOpacity
                    className={`border rounded-lg p-3 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
                    onPress={() => {setShowFamilyDropdownPersonalMembre(true); setShowFamilyDropdownPersonalNom(false) ; console.log("membre dispo" ,  membreDispo);
                    }}
                    disabled={!selectedFamily} // Disable if no family is selected
                  >
                    <View className="flex-row justify-between items-center">
                      <Text 
                        className={`${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={!selectedFamily ? { opacity: 0.5 } : {}}
                      >
                        {selectedFamilyMembre ? 
                          (membreDispo.find(m => m.id === selectedFamilyMembre)?.nom || 'Membre inconnu') : 
                          (selectedFamily ? 'Sélectionner un membre' : 'Sélectionnez d\'abord une famille')}
                      </Text>
                      <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color={!selectedFamily ? (isDark ? '#4B5563' : '#D1D5DB') : (isDark ? '#9CA3AF' : '#6B7280')} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                {showFamilyDropdownPersonalMembre && (
                    <View className={`mt-1 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                      {isLoading ? (
                        <View className="p-4 items-center">
                          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Chargement...</Text>
                        </View>
                      ) : membreDispo.length === 0 ? (
                        <View className="p-4">
                          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Aucun membre disponible</Text>
                        </View>
                      ) : (
                        <ScrollView className="max-h-40">
                          {membreDispo.map(membre => (
                            <TouchableOpacity
                              key={membre.id}
                              onPress={() => {
                                setFormData({
                                  ...formData, 
                                  membre_famille_id: membre.id,
                                  type: 'personal'
                                });
                                setShowFamilyDropdownPersonalMembre(false);
                                console.log('membre selected ' , membre.id);
                                
                                setSelectedFamilyMembre(membre.id || null);
                              }}
                              className={`p-3 ${formData.membre_famille_id === membre.id ? 
                                (isDark ? 'bg-blue-900' : 'bg-blue-100') : 
                                ''}`}
                            >
                              <Text className={isDark ? 'text-white' : 'text-gray-900'}>
                                {membre.nom || `Membre ${membre.id}`}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>)}
                
</>
                
              )}



 */}










              {/* Sélecteur de catégorie simplifié */}
              <View className="mb-4">
                <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Catégorie</Text>
                <View className={`border rounded-lg p-0 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                  {isLoading ? (
                    <View className="p-4 items-center">
                      <Text className={isDark ? 'text-white' : 'text-gray-900'}>Chargement...</Text>
                    </View>
                  ) : categories.length === 0 ? (
                    <View className="p-4">
                      <Text className={isDark ? 'text-white' : 'text-gray-900'}>Aucune catégorie disponible</Text>
                    </View>
                  ) : (
                    <View className="p-3">
                      <Picker
                        selectedValue={formData.categorie_id || ''}
                        onValueChange={(itemValue) => setFormData({...formData, categorie_id: Number(itemValue)})}
                        style={{
                          color: isDark ? 'white' : 'black',
                        }}
                        dropdownIconColor={isDark ? 'white' : 'black'}
                      >
                        <Picker.Item label="Sélectionner une catégorie" value="" />
                        {categories.map(category => (
                          <Picker.Item 
                            key={category.id}
                            label={category.nom}
                            value={category.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                </View>
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
    
  );
};

export default AjoutBudgetModal;