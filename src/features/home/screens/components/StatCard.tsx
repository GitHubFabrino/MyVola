import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';

interface StatCardProps {
  title: string;
  value: string;
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

export default StatCard;
