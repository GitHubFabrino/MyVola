import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Factures: undefined;
  Alertes: undefined;
  Investissements: undefined;
  Dettes: undefined;
  Parametres: undefined;
  Aide: undefined;
};

// Types de paramètres pour chaque stack
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  TableauDeBord: undefined;
  Budgets: undefined;
  Depenses: undefined;
  Revenus: undefined;
  Objectifs: undefined;
};

export type MainStackParamList = {
  DrawerNavigator: undefined;
  // Ajoutez d'autres écrans du stack principal ici
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// Types de navigation pour chaque stack
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type DrawerNavigationProp = NativeStackNavigationProp<DrawerParamList>;

// Types pour les props des écrans
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;

export type DrawerScreenProps<T extends keyof DrawerParamList> = 
  NativeStackScreenProps<DrawerParamList, T>;

// Alias pour la rétrocompatibilité
export type AuthScreenProps<T extends keyof AuthStackParamList> = AuthStackScreenProps<T>;

// Types globaux pour la navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}