import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { useAuth } from '~/store/auth/hooks';
import { useTheme } from '~/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';





import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '~/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StatCard from './components/StatCard';
import QuickAction from './components/QuickAction';
import GraphiqueDepense from './components/GraphiqueDepense';
import DernieresTransactions from './components/DernieresTransactions';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'TableauDeBord'> & {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Données factices pour la démo
  const stats: Array<{
    id: string;
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }> = [
    { id: '1', title: 'Solde actuel', value: '1 250 000 Ar', icon: 'wallet', color: '#10b981' },
    { id: '4', title: 'Épargne', value: '350 000 Ar', icon: 'save', color: '#8b5cf6' },
    { id: '2', title: 'Dépenses du mois', value: '450 000 Ar', icon: 'trending-down', color: '#ef4444' },
    { id: '3', title: 'Revenus du mois', value: '1 700 000 Ar', icon: 'trending-up', color: '#3b82f6' },
  ];

  // Fonction pour obtenir la couleur en fonction du pourcentage du montant par rapport au max
  const getBarColor = (amount: number, max: number) => {
    const percentage = (amount / max) * 100;
    if (percentage > 80) return isDark ? '#ef4444' : '#dc2626'; // Rouge pour les montants élevés
    if (percentage > 50) return isDark ? '#f59e0b' : '#d97706'; // Orange pour les montants moyens
    if (percentage > 20) return isDark ? '#3b82f6' : '#2563eb'; // Bleu pour les montants modérés
    return isDark ? '#10b981' : '#059669'; // Vert pour les petits montants
  };

  // Données pour le graphique des dépenses par catégorie
  const expenseData = [
    { category: 'Alimentation', amount: 150000 },
    { category: 'Transport', amount: 80000 },
    { category: 'Logement', amount: 120000 },
    { category: 'Loisirs', amount: 50000 },
    { category: 'Autres', amount: 50000 },
  ];

  const maxAmount = Math.max(...expenseData.map(item => item.amount));

  // État pour la modale d'ajout de catégorie
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState({
    nom: '',
    type: 'depense', // 'revenu', 'depense', ou 'transfert'
    icone: 'pricetag', // icône par défaut
    couleur: '#3b82f6',
  });

  // Types de catégories disponibles
  const categoryTypes = [
    { value: 'depense', label: 'Dépense' },
    { value: 'revenu', label: 'Revenu' },
    { value: 'transfert', label: 'Transfert' },
  ];

  // Icônes disponibles pour les catégories
  const categoryIcons = [
    { name: 'pricetag', label: 'Étiquette' },
    { name: 'cart', label: 'Courses' },
    { name: 'restaurant', label: 'Restaurant' },
    { name: 'home', label: 'Maison' },
    { name: 'car', label: 'Transport' },
    { name: 'medical', label: 'Santé' },
    { name: 'school', label: 'Éducation' },
    { name: 'gift', label: 'Cadeau' },
  ];

  // Couleurs disponibles pour les catégories
  const categoryColors = [
    { value: '#3b82f6', name: 'Bleu' },
    { value: '#10b981', name: 'Vert' },
    { value: '#f59e0b', name: 'Orange' },
    { value: '#ef4444', name: 'Rouge' },
    { value: '#8b5cf6', name: 'Violet' },
    { value: '#ec4899', name: 'Rose' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#14b8a6', name: 'Turquoise' },
  ];

  const handleAddCategory = async () => {
    if (!newCategory.nom.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la catégorie');
      return;
    }

    try {
      // Ici, vous devrez récupérer le famille_id de l'utilisateur connecté
      const familleId = 1; // À remplacer par le vrai ID de la famille
      
      // Exemple d'appel à la base de données
      // await db.transactionAsync(async (tx) => {
      //   await tx.executeSqlAsync(
      //     'INSERT INTO categories (famille_id, nom, type, icone, couleur) VALUES (?, ?, ?, ?, ?)',
      //     [familleId, newCategory.nom, newCategory.type, newCategory.icone, newCategory.couleur]
      //   );
      // });
      
      console.log('Nouvelle catégorie:', {
        famille_id: familleId,
        ...newCategory,
      });
      
      // Réinitialiser le formulaire et fermer la modale
      setNewCategory({
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

  const quickActions: Array<{
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }> = [
    { 
      id: '1', 
      icon: 'add-circle', 
      label: 'Nouvelle dépense',
      onPress: () => console.log('Nouvelle dépense')
    },
    { 
      id: '2', 
      icon: 'cash', 
      label: 'Nouveau revenu',
      onPress: () => console.log('Nouveau revenu')
    },
    { 
      id: '3', 
      icon: 'pricetag', 
      label: 'Nouvelle Catégorie',
      onPress: () => setIsAddCategoryModalVisible(true)
    },
    { 
      id: '4', 
      icon: 'person-add', 
      label: 'Nouveau Membre',
      onPress: () => console.log('Nouveau membre')
    },
  ];

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* En-tête */}
      <View className={`flex-row justify-between items-center px-5 py-2.5 border-b ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <View>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Cartes de statistiques */}
        <View className="flex-row flex-wrap justify-between mb-6 gap-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              onPress={() => console.log('View details for:', stat.title)}
            />
          ))}
        </View>

        {/* Actions rapides */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Actions rapides
          </Text>
          <View className="flex-row flex-wrap justify-between gap-3">
            {quickActions.map((action) => (
              <QuickAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>

        {/* Graphique des dépenses par catégorie */}
        <GraphiqueDepense 
          expenseData={expenseData} 
          maxAmount={maxAmount} 
          getBarColor={getBarColor} 
          isDark={isDark}
        />

        {/* Dernières transactions */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Dernières transactions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Main' as never)}>
              <Text className="text-blue-500 font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {/* Liste des transactions récentes */}
         <DernieresTransactions navigation={navigation} />
        </View>
      </ScrollView>

      {/* Modale d'ajout de catégorie */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddCategoryModalVisible}
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
      >
        <View style={styles.centeredView}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row">
                {categoryIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => setNewCategory({...newCategory, icone: icon.name})}
                    className={`w-12 h-12 rounded-full m-1 items-center justify-center ${
                      newCategory.icone === icon.name 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Ionicons 
                      name={icon.name as any} 
                      size={24} 
                      color={newCategory.icone === icon.name ? newCategory.couleur : (isDark ? '#9CA3AF' : '#6B7280')} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
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
            
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setIsAddCategoryModalVisible(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                <Text className="text-gray-900 dark:text-white">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCategory}
                className="px-4 py-2 rounded-lg bg-blue-500"
              >
                <Text className="text-white font-semibold">Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};



const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default HomeScreen;