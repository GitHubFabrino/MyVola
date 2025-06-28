import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { useAppDispatch } from '../../../store/hooks';
import { addTransaction } from '../slice';
import { Transaction } from '../types';

const TransactionForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: '',
  });

  const handleSubmit = () => {
    if (!form.title || form.amount <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    dispatch(addTransaction({
      ...form,
      id: Date.now(), // À remplacer par un ID généré par votre base de données
    }));

    // Réinitialiser le formulaire
    setForm({
      title: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: '',
    });

    Alert.alert('Succès', 'Transaction ajoutée avec succès');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Titre *</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
        placeholder="Ex: Salaire, Courses..."
      />

      <Text style={styles.label}>Montant *</Text>
      <TextInput
        style={styles.input}
        value={form.amount.toString()}
        onChangeText={(text) => setForm({ ...form, amount: parseFloat(text) || 0 })}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.radioContainer}>
        <Button
          title="Dépense"
          onPress={() => setForm({ ...form, type: 'expense' })}
          color={form.type === 'expense' ? '#007AFF' : '#ccc'}
        />
        <View style={styles.radioSpacer} />
        <Button
          title="Revenu"
          onPress={() => setForm({ ...form, type: 'income' })}
          color={form.type === 'income' ? '#007AFF' : '#ccc'}
        />
      </View>

      <Text style={styles.label}>Catégorie</Text>
      <TextInput
        style={styles.input}
        value={form.category}
        onChangeText={(text) => setForm({ ...form, category: text })}
        placeholder="Ex: Nourriture, Transport..."
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={form.date}
        onChangeText={(text) => setForm({ ...form, date: text })}
        placeholder="AAAA-MM-JJ"
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Ajouter la transaction"
          onPress={handleSubmit}
          color="#4CAF50"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  radioSpacer: {
    width: 16,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});

export default TransactionForm;