import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '~/store/auth/hooks';
import { useTheme } from '~/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Composants réutilisables
interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const StatCard = ({ title, value, icon, color, onPress }: StatCardProps) => {
  const { isDark } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex flex-row w-[48%] p-4 rounded-xl border shadow-sm items-center justify-between ${
        isDark ? 'bg-gray-800 border-gray-700 shadow-black' : 'bg-white border-gray-200 shadow-gray-400'
      }`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mb-3`} style={{ backgroundColor: `${color}20` }}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </Text>
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

const QuickAction = ({ icon, label, onPress }: QuickActionProps) => {
  const { isDark } = useTheme();
  
  return (
    <TouchableOpacity 
      className="w-[48%] p-4 rounded-xl items-center border border-gray-200"
      style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }}
      onPress={onPress}
    >
      <View className="w-12 h-12 rounded-full justify-center items-center mb-2" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
        <Ionicons name={icon} size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
      </View>
      <Text className="text-xs text-center text-gray-500 dark:text-gray-300">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '~/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

  const quickActions: Array<{
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }> = [
    { id: '1', icon: 'add-circle', label: 'Nouvelle dépense' },
    { id: '2', icon: 'cash', label: 'Nouveau revenu' },
    // { id: '3', icon: 'swap-horizontal', label: 'Transfert' },
    // { id: '4', icon: 'document-text', label: 'Rapports' },
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
                onPress={() => console.log('Action:', action.label)}
              />
            ))}
          </View>
        </View>

        {/* Graphique des dépenses par catégorie */}
        <View className="mb-6">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Dépenses par catégorie
          </Text>
          <View className="flex-row justify-around items-end h-48 mt-2.5">
            {expenseData.map((item, index) => (
              <View key={index} className="items-center w-15">
                <View className="h-[80%] w-7 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden justify-end">
                  <View 
                    className="w-full rounded-t"
                    style={{ 
                      height: `${(item.amount / maxAmount) * 100}%`,
                      backgroundColor: getBarColor(item.amount, maxAmount)
                    }} 
                  />
                </View>
                <Text className="text-xs mt-1 text-center text-gray-500 dark:text-gray-400">
                  {item.amount.toLocaleString('fr-MG')} Ar
                </Text>
                <Text className="text-xs mt-1 text-center font-medium text-gray-900 dark:text-gray-100">
                  {item.category}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
          <View className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <View 
                  className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                >
                  <Ionicons 
                    name={index % 2 === 0 ? 'cart' : 'restaurant'} 
                    size={20} 
                    color={index % 2 === 0 ? '#10b981' : '#ef4444'} 
                  />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                    {index % 2 === 0 ? 'Courses du mois' : 'Restaurant'}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {index === 0 ? 'Aujourd\'hui' : 'Hier'} • 12:30
                  </Text>
                </View>
                <Text 
                  className={`text-sm font-semibold ${
                    index % 2 === 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {index % 2 === 0 ? '+ 1 200 000 Ar' : '- 45 000 Ar'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};



export default HomeScreen;