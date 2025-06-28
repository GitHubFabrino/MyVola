import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { colors } from '~/theme/colors';

const BudgetsScreen = () => {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Gestion des Budgets</Text>
      <Text style={{ color: themeColors.text }}>Ici vous pourrez gérer vos budgets.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default BudgetsScreen;
