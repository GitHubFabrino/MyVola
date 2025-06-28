import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const { title, amount, date, category, type } = transaction;
  const amountColor = type === 'income' ? '#4CAF50' : '#F44336';
  const amountSign = type === 'income' ? '+' : '-';

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.title}>{title}</Text>
        {category && <Text style={styles.category}>{category}</Text>}
        <Text style={styles.date}>
          {new Date(date).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {amountSign} {amount.toFixed(2)} Ar
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  leftContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionItem;