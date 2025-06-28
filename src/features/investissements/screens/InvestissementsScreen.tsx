import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { colors } from '~/theme/colors';

const InvestissementsScreen = () => {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Investissements</Text>
      <Text style={{ color: themeColors.text }}>Suivez vos investissements.</Text>
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

export default InvestissementsScreen;
