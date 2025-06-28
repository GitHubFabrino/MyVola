// Types
export interface Utilisateur {
  id?: number;
  nom: string;
  email: string;
  mot_de_passe: string;
  photo?: string;
  date_creation: string;
}

export interface CreateUtilisateurDTO extends Omit<Utilisateur, 'id' | 'date_creation'> {}
export interface UpdateUtilisateurDTO extends Partial<Omit<Utilisateur, 'id' | 'date_creation' | 'email'>> {}

export interface AuthResponse {
  utilisateur: Omit<Utilisateur, 'mot_de_passe'>;
  token: string;
  refreshToken: string;
}