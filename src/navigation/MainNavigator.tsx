// MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useTheme } from '~/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '~/theme/colors';
import { useAuth } from '~/store/auth/hooks';
import type { DrawerNavigationProp, DrawerContentComponentProps } from '@react-navigation/drawer';

// Composant pour l'avatar utilisateur
const UserAvatar = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const themeColors = isDark ? colors.dark : colors.light;
  
  const initials = user?.nom 
    ? user.nom
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <View style={[styles.avatarContainer, { backgroundColor: themeColors.primary }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

// Screens
import HomeScreen from '~/features/home/screens/HomeScreen';
import BudgetsScreen from '~/features/budgets/screens/BudgetsScreen';
import DepensesScreen from '~/features/depenses/screens/DepensesScreen';
import RevenusScreen from '~/features/revenus/screens/RevenusScreen';
import ObjectifsScreen from '~/features/objectifs/screens/ObjectifsScreen';
import FacturesScreen from '~/features/factures/screens/FacturesScreen';
import AlertesScreen from '~/features/alertes/screens/AlertesScreen';
import InvestissementsScreen from '~/features/investissements/screens/InvestissementsScreen';
import DettesScreen from '~/features/dettes/screens/DettesScreen';
import ParametresScreen from '~/features/parametres/screens/ParametresScreen';
import AideScreen from '~/features/aide/screens/AideScreen';

// Components
import { DrawerContent } from '~/components/DrawerContent';

// Types
import type { MainTabParamList, DrawerParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const MainTabs = () => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof MainTabParamList } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'TableauDeBord') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Budgets') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Depenses') {
            iconName = focused ? 'trending-down' : 'trending-down-outline';
          } else if (route.name === 'Revenus') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Objectifs') {
            iconName = focused ? 'ribbon' : 'ribbon-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.text,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          borderColor: themeColors.border,
          height: 60 + (Platform.OS === 'android' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingVertical: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="TableauDeBord" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetsScreen}
      />
      <Tab.Screen 
        name="Depenses" 
        component={DepensesScreen}
        options={{ title: 'Dépenses' }}
      />
      <Tab.Screen 
        name="Revenus" 
        component={RevenusScreen}
      />
      <Tab.Screen 
        name="Objectifs" 
        component={ObjectifsScreen}
      />
    </Tab.Navigator>
  );
};

const DrawerNavigator = () => {
  const { isDark } = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => <DrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: themeColors.primary,
        drawerInactiveTintColor: themeColors.text,
        drawerType: 'front',
        headerStyle: {
          backgroundColor: themeColors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: themeColors.text,
        headerTitle: '',
        headerTitleStyle: {
          display: 'none',
        },
        headerLeft: () => (
          <Ionicons 
            name="menu" 
            size={28} 
            color={themeColors.text} 
            style={{ marginLeft: 15 }}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          />
        ),
        headerRight: () => <UserAvatar />,
        headerRightContainerStyle: {
          paddingRight: 15,
        },
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabs} 
        
        options={{
          title: 'Tableau de bord',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Factures" 
        component={FacturesScreen}
        options={{
          title: 'Factures',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Alertes" 
        component={AlertesScreen}
        options={{
          title: 'Alertes',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Investissements" 
        component={InvestissementsScreen}
        options={{
          title: 'Investissements',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Dettes" 
        component={DettesScreen}
        options={{
          title: 'Dettes',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Parametres" 
        component={ParametresScreen}
        options={{
          title: 'Paramètres',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Aide" 
        component={AideScreen}
        options={{
          title: 'Aide et Support',
          drawerIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export const MainNavigator = () => {
  return <DrawerNavigator />;
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MainNavigator;