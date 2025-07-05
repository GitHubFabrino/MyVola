import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "~/theme/ThemeContext";
import { useState } from "react";
import { categoryTypes, categoryIcons, categoryColors } from "../services/statiqueData";
import Btn from "../screens/components/bouton/Btn";
import { useAuth } from "~/store/auth/hooks";
import { addCategorieNew, selectAllCategories } from "~/store/categorie/categorieSlice";
import { CreateCategorieDTO } from "~/services/db/types/categorieType";
import { useAppDispatch, useAppSelector } from "~/store/hooks";

interface AjoutCategorieProps {
    isAddCategoryModalVisible: boolean;
    setIsAddCategoryModalVisible: (visible: boolean) => void;
}

const AjoutCategorie = ({ isAddCategoryModalVisible, setIsAddCategoryModalVisible }: AjoutCategorieProps) => {
    const { isDark } = useTheme();
    const { user } = useAuth();

    // Hook personnalisé pour dispatcher des actions Redux avec le typage TypeScript approprié
    // Permet d'envoyer des actions comme addCategorieNew au store Redux
    const dispatch = useAppDispatch();
    // Récupère la liste complète des catégories depuis le store Redux
    const categories = useAppSelector(selectAllCategories);
    // Récupère l'état actuel du chargement des catégories (idle/loading/succeeded/failed)
    const status = useAppSelector(state => state.categorie.status);
    // Récupère les erreurs éventuelles liées aux opérations sur les catégories
    const error = useAppSelector(state => state.categorie.error);

      const [newCategory, setNewCategory] = useState<CreateCategorieDTO>({
        famille_id: 0,
        nom: '',
        type: 'depense', // 'revenu', 'depense', ou 'transfert'
        icone: 'pricetag', // icône par défaut
        couleur: '#3b82f6',
      });

      
  const handleAddCategory = async () => {
      if (!newCategory.nom.trim()) {
        Alert.alert('Erreur', 'Veuillez entrer un nom pour la catégorie');
        return;
      }
  
      try {
      
        const familleId = user?.id; 
        if (!familleId) {
          Alert.alert('Erreur', 'Veuillez vous connecter pour ajouter une catégorie');
          return;
        }

        const newCategorie: CreateCategorieDTO = {
            ...newCategory,
            famille_id: familleId,
         
          };

        await dispatch(addCategorieNew(newCategorie)).unwrap();

     
        
        console.log('Nouvelle catégorie:', {
          ...newCategory,
          famille_id: familleId,
        });
        
        // Réinitialiser le formulaire et fermer la modale
        setNewCategory({
          famille_id: familleId,
          nom: '',
          type: 'depense',
          icone: 'pricetag',
          couleur: '#3b82f6',
        });
        
        setIsAddCategoryModalVisible(false);
        Alert.alert('Succès', 'La catégorie a été ajoutée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la catégorie:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de la catégorie');
      }
    };

    
    
    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={isAddCategoryModalVisible}
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
        >
        <View className="flex-1 justify-center items-center bg-black/50">
        <View className={`p-5 rounded-xl w-11/12 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Nouvelle catégorie
            </Text>
            
            {/* Champ Nom */}
            <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Nom de la catégorie *
            </Text>
            <TextInput
            className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
            placeholder="Ex: Loisirs"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={newCategory.nom}
            onChangeText={(text) => setNewCategory({...newCategory, nom: text})}
            />
            
            {/* Sélection du type */}
            <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Type de catégorie *
            </Text>
            <View className="flex-row flex-wrap mb-4">
            {categoryTypes.map((type) => (
                <TouchableOpacity
                key={type.value}
                onPress={() => setNewCategory({...newCategory, type: type.value as any})}
                className={`px-4 py-2 rounded-full m-1 ${
                    newCategory.type === type.value 
                    ? 'bg-blue-500' 
                    : isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}
                >
                <Text className={`text-sm ${
                    newCategory.type === type.value ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                    {type.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>
            
            {/* Sélection de l'icône */}
            <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Icône
            </Text>
            <View className="w-full mb-4">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                contentContainerClassName="px-2 py-2"
                className="mb-4 py-2"
              >
                {categoryIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={`${icon.name}-${index}`}
                    onPress={() => setNewCategory({...newCategory, icone: icon.name})}
                    className={`w-12 h-12 rounded-full mx-1 items-center justify-center relative
                      ${newCategory.icone === icon.name 
                        ? isDark ? 'bg-blue-900/50' : 'bg-blue-200/70'
                        : isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                  >
                   <Ionicons 
  name={icon.name as any} 
  size={24} 
  color={newCategory.icone === icon.name 
    ? (newCategory.couleur || (isDark ? '#9CA3AF' : '#6B7280')) 
    : (isDark ? '#9CA3AF' : '#6B7280')
  } 
/>
                    {newCategory.icone === icon.name && (
                      <View 
                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: newCategory.couleur || (isDark ? '#9CA3AF' : '#6B7280') }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Sélection de la couleur */}
            <Text className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Couleur
            </Text>
            <View className="flex-row flex-wrap mb-6">
            {categoryColors.map((color) => (
                <TouchableOpacity
                key={color.value}
                onPress={() => setNewCategory({...newCategory, couleur: color.value})}
                className={`w-10 h-10 rounded-full m-1 items-center justify-center ${
                    newCategory.couleur === color.value ? 'border-2 border-blue-500' : ''
                }`}
                style={{ backgroundColor: color.value }}
                >
                {newCategory.couleur === color.value && (
                    <Ionicons name="checkmark" size={20} color="white" />
                )}
                </TouchableOpacity>
            ))}
            </View>
            
            <View className="flex-row justify-end items-center space-x-3">
            <Btn onPress={() => setIsAddCategoryModalVisible(false)} title="Annuler" isDark={isDark} />
            <Btn onPress={handleAddCategory} title="Ajouter" isDark={isDark} />
            </View>
        </View>
        </View>
        </Modal>
    );
};

export default AjoutCategorie;

