import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useAppSelector } from '../../../store/hooks';
import { selectAllTransactions } from '../slice';
import TransactionItem from './TransactionItem';

const TransactionList: React.FC = () => {
  const transactions = useAppSelector(selectAllTransactions);

  const renderItem = ({ item }: { item: any }) => (
    <TransactionItem 
      transaction={item} 
      onPress={() => {
        // Navigation vers l'écran de détail
        // navigation.navigate('TransactionDetail', { id: item.id });
      }} 
    />
  );

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucune transaction</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TransactionList;