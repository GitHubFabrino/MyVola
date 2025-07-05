// Types de base pour une famille
export interface Famille {
  id?: number;
  nom: string;
  utilisateur_id: number;
  role: RoleMembre;
  date_creation?: string;
  date_ajout?: string;
}




export interface CreateFamilleDTO {
  nom: string;
  utilisateur_id: number;
  role: RoleMembre;
}

// Types pour la création d'une famille
// export interface CreateFamilleDTO extends Omit<Famille, 'id' | 'date_creation' | 'membres' | 'description' | 'photo'> {}

// Types pour la mise à jour d'une famille
export interface UpdateFamilleDTO extends Partial<Omit<Famille, 'id' | 'date_creation'>> {}

// Types pour les membres d'une famille
export type RoleMembre = 'admin' | 'membre' | 'invite';

export interface MembreFamille {
  id?: number;
  famille_id: number;
  nom: string;
  utilisateur_id: number;
  role: RoleMembre;
  date_ajout: string;
}

// export interface CreateMembreFamilleDTO extends Omit<MembreFamille, 'id' | 'date_ajout'> {}
export interface CreateMembreFamilleDTO {
  famille_id: number;
  nom: string;
  utilisateur_id: number;
  role: RoleMembre;
}
export interface UpdateMembreFamilleDTO extends Partial<Omit<MembreFamille, 'id' | 'date_ajout' | 'famille_id' | 'utilisateur_id'>> {}

// Type pour la réponse détaillée d'une famille
export interface FamilleWithDetails extends Famille {
  membres: Array<MembreFamille & {
    utilisateur_nom: string;
    utilisateur_email: string;
    utilisateur_photo?: string;
  }>;
}

// Type pour l'invitation à une famille
export interface InvitationFamille {
  id?: number;
  famille_id: number;
  email: string;
  token: string;
  role: RoleMembre;
  date_invitation: string;
  date_expiration: string;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'expiree';
}

export interface CreateInvitationDTO extends Omit<InvitationFamille, 'id' | 'date_invitation' | 'statut'> {}

export interface RepondreInvitationDTO {
  token: string;
  accepter: boolean;
  utilisateur_id: number;
}

// Type pour les statistiques de la famille
export interface FamilleStats {
  nombre_membres: number;
  nombre_invitations_en_attente: number;
  depenses_mensuelles: number;
  revenus_mensuels: number;
  solde: number;
}
