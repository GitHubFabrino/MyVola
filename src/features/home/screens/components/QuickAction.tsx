import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';
import { TouchableOpacity, View, Text } from 'react-native';
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

  export default QuickAction;