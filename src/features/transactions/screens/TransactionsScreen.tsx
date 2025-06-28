import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TransactionsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vos Transactions</Text>
      <Text style={styles.subtitle}>Historique de vos opérations</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
