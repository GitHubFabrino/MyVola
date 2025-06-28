// src/features/auth/components/AuthForm.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit: (data: { email: string; password: string; name?: string }) => void;
  isLoading: boolean;
  error?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ 
  type, 
  onSubmit, 
  isLoading,
  error 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const data = type === 'signup' 
      ? { email, password, name }
      : { email, password };
    onSubmit(data);
  };

  return (
    <View style={styles.container}>
      {type === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {type === 'signin' ? 'Se connecter' : 'Créer un compte'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});