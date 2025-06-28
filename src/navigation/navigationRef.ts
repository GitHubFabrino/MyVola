import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Add this helper function for type-safe navigation
export const navigate = (name: keyof RootStackParamList, params?: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};