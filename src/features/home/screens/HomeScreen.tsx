import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '~/store/auth/hooks';
import { useTheme } from '~/theme/ThemeContext';

export const HomeScreen = () => {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <View className={`flex-1 justify-center items-center p-5 ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      <Text className={`text-2xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Bienvenue sur MyVola {isDark ? '🌙' : '☀️'}
      </Text>
      <Text className={`text-base mb-6 ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>
        Votre application de gestion financière
      </Text>

      <View className="w-full px-10">
        <Button 
          title={isDark ? '🌙 Mode clair' : '☀️ Mode sombre'} 
          onPress={toggleTheme}
          color={isDark ? '#6b7280' : '#2563eb'}
        />
        
        <View className="h-4" />
        
        <Button 
          title="Se déconnecter" 
          onPress={signOut}
          color={isDark ? '#ef4444' : '#dc2626'}
        />
      </View>
    </View>
  );
};

export default HomeScreen;