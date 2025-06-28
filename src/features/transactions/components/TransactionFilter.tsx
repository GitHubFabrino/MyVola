import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectTransactionsFilters, setFilters, resetFilters } from '../slice';

const TransactionFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectTransactionsFilters);

  const handleReset = () => {
    dispatch(resetFilters());
  };

  // Note: Pour une implémentation complète, vous pourriez ajouter des sélecteurs de date
  // et des sélecteurs de catégorie ici

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtres</Text>
      
      {/* Ici, vous pouvez ajouter vos contrôles de filtre */}
      <Text style={styles.filterText}>
        Filtres actifs: {Object.values(filters).filter(Boolean).length}
      </Text>
      
      <Button
        title="Réinitialiser les filtres"
        onPress={handleReset}
        color="#FF3B30"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterText: {
    marginBottom: 12,
    color: '#666',
  },
});

export default TransactionFilter;