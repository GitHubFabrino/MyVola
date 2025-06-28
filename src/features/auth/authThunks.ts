import { createAsyncThunk } from '@reduxjs/toolkit';
import * as utilisateurService from '../../services/utilisateur.service';
import { LoginCredentials, RegisterData, SafeUtilisateur } from './types';

export interface AuthResponse {
  utilisateur: SafeUtilisateur;
  token: string;
  refreshToken: string;
}

export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async ({ email, mot_de_passe }, { rejectWithValue }) => {
    try {
      const response = await utilisateurService.login(email, mot_de_passe);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de connexion'
      );
    }
  }
);

export const register = createAsyncThunk<AuthResponse, Omit<RegisterData, 'id' | 'date_creation'>>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // Créer l'utilisateur
      const newUser = await utilisateurService.createUtilisateur(userData);
      
      // Connecter automatiquement l'utilisateur après l'inscription
      const response = await utilisateurService.login(userData.email, userData.mot_de_passe);
      
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<SafeUtilisateur>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await utilisateurService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur de chargement du profil'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await utilisateurService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return rejectWithValue('Erreur lors de la déconnexion');
    }
  }
);

export const resetPassword = createAsyncThunk<void, string>(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      // Implémentez la logique de réinitialisation du mot de passe ici
      console.log('Demande de réinitialisation pour:', email);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Erreur lors de la demande de réinitialisation'
      );
    }
  }
);