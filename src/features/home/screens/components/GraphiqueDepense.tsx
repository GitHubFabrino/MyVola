import { View, Text } from 'react-native';

interface GraphiqueDepenseProps {
    expenseData: Array<{ category: string; amount: number }>;
    maxAmount: number;
    getBarColor: (amount: number, max: number) => string;
    isDark: boolean;
  }

  const GraphiqueDepense = ({ expenseData, maxAmount, getBarColor, isDark }: GraphiqueDepenseProps) => {
    return (
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
    );
  };

  export default GraphiqueDepense;