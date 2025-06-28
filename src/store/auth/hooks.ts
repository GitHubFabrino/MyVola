import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks';
import { login, register, logout, resetPassword, AuthResponse } from '../../features/auth/authThunks';
import { SafeUtilisateur } from '../../features/auth/types';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '..';

type AuthHook = {
  isAuthenticated: boolean;
  user: SafeUtilisateur | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, mot_de_passe: string) => Promise<boolean>;
  signUp: (userData: { nom: string; email: string; mot_de_passe: string }) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
};

export const useAuth = (): AuthHook => {
  const dispatch = useAppDispatch();
  // Créer un sélecteur mémoïsé
  const selectAuthState = createSelector(
    (state: RootState) => state.auth,
    (auth) => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      error: auth.error,
    })
  );

  const { user, isAuthenticated, isLoading, error } = useAppSelector(selectAuthState);

  const signIn = useCallback(
    async (email: string, mot_de_passe: string) => {
      try {
        await dispatch(login({ email, mot_de_passe })).unwrap();
        return true;
      } catch (err) {
        console.error('Login error:', err);
        return false;
      }
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (userData: { nom: string; email: string; mot_de_passe: string }) => {
      try {
        await dispatch(register(userData)).unwrap();
        return true;
      } catch (err) {
        console.error('Sign up error:', err);
        return false;
      }
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      return true;
    } catch (err) {
      console.error('Sign out error:', err);
      return false;
    }
  }, [dispatch]);

  const handleResetPassword = useCallback(
    async (email: string) => {
      try {
        await dispatch(resetPassword(email)).unwrap();
        return true;
      } catch (err) {
        console.error('Reset password error:', err);
        return false;
      }
    },
    [dispatch]
  );

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword: handleResetPassword,
  };
};

type AuthNavigation = {
  navigateToSignIn: () => void;
  navigateToSignUp: () => void;
  navigateToForgotPassword: () => void;
};

export const useAuthNavigation = (): AuthNavigation => {
  const navigation = useNavigation<any>();
  
  const navigateToSignIn = useCallback(() => {
    navigation.navigate('Auth', { screen: 'SignIn' });
  }, [navigation]);
  
  const navigateToSignUp = useCallback(() => {
    navigation.navigate('Auth', { screen: 'SignUp' });
  }, [navigation]);
  
  const navigateToForgotPassword = useCallback(() => {
    navigation.navigate('Auth', { screen: 'ForgotPassword' });
  }, [navigation]);
  
  return {
    navigateToSignIn,
    navigateToSignUp,
    navigateToForgotPassword,
  };
};
