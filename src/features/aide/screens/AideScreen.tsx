import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { colors } from '~/theme/colors';

const AideScreen = () => {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  const handleContactSupport = () => {
    // Ici, vous pouvez ajouter la logique pour contacter le support
    // Par exemple, ouvrir un email ou un formulaire de contact
    Linking.openURL('mailto:support@myvola.com');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Aide et Support</Text>
      <Text style={[styles.text, { color: themeColors.text }]}>
        Besoin d'aide ? Notre équipe est là pour vous aider.
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
          Questions fréquentes
        </Text>
        <Text style={{ color: themeColors.text, marginBottom: 15 }}>
          Consultez notre FAQ pour des réponses aux questions courantes.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
          Contacter le support
        </Text>
        <Text style={{ color: themeColors.text, marginBottom: 10 }}>
          Vous ne trouvez pas ce que vous cherchez ? Contactez-nous directement.
        </Text>
        <TouchableOpacity 
          onPress={handleContactSupport}
          style={[styles.button, { backgroundColor: themeColors.primary }]}
        >
          <Text style={[styles.buttonLabel, { color: 'white' }]}>
            Contacter le support
          </Text>
        </TouchableOpacity>
      </View>
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
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AideScreen;
