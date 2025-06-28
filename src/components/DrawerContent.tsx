import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/theme/ThemeContext';
import { colors } from '~/theme/colors';

type DrawerItemProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const DrawerItem = ({ label, icon, onPress }: DrawerItemProps) => {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
      <Ionicons 
        name={icon} 
        size={24} 
        color={themeColors.primary} 
        style={styles.drawerItemIcon} 
      />
      <Text style={[styles.drawerItemText, { color: themeColors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const DrawerContent = (props: any) => {
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerHeaderTitle, { color: themeColors.primary }]}>
            MyVola
          </Text>
          <Text style={{ color: themeColors.text }}>
            Gestion financière personnelle
          </Text>
        </View>
        
        <DrawerItemList {...props} />
        
        <View style={styles.divider} />
        
        <DrawerItem
          label="Déconnexion"
          icon="log-out-outline"
          onPress={() => {
            // Gérer la déconnexion ici
          }}
        />
      </DrawerContentScrollView>
      
      <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
        <Text style={{ color: themeColors.text }}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  drawerHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  drawerItemIcon: {
    marginRight: 15,
  },
  drawerItemText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 10,
    opacity: 0.1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});
