export interface Utilisateur {
    id?: number;
    nom: string;
    email: string;
    mot_de_passe: string;
    photo?: string;
    date_creation: string;
  }
  
  export interface AuthState {
    user: Utilisateur | null;
    token: string | null;
    refreshToken: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    mot_de_passe: string;
  }
  
  export interface RegisterData extends Omit<Utilisateur, 'id' | 'date_inscription'> {
    mot_de_passe: string;
  }
  // In your types.ts file
export type SafeUtilisateur = Omit<Utilisateur, 'mot_de_passe'>;