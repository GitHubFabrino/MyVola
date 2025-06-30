import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';

interface DernieresTransactionsProps {
    navigation: any;
}

const DernieresTransactions = ({ navigation }: DernieresTransactionsProps) => {
    const { isDark } = useTheme();
    
    return (
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
    );
};

export default DernieresTransactions;