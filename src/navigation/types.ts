import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

// Types de paramètres pour chaque stack
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
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

// Types pour les props des écrans
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;

// Alias pour la rétrocompatibilité
export type AuthScreenProps<T extends keyof AuthStackParamList> = AuthStackScreenProps<T>;

// Types globaux pour la navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}