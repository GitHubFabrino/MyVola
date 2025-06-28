import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '~/theme/colors';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    Alert.alert(
      'Réinitialisation du mot de passe',
      'Si votre email est enregistré, vous recevrez un lien pour réinitialiser votre mot de passe.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.subtitle}>
        Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Button 
        title="Envoyer le lien de réinitialisation" 
        onPress={handleResetPassword} 
        color={colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
});
