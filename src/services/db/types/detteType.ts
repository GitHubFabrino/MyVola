export type DetteStatut = 'actif' | 'rembourse' | 'en_retard';

export interface Dette {
  id: number;
  famille_id: number;
  creancier: string;
  montant_initial: number;
  montant_actuel: number;
  taux_interet: number;
  date_debut: string; // Format: YYYY-MM-DD
  date_echeance: string | null; // Format: YYYY-MM-DD
  statut: DetteStatut;
  description: string | null;
  date_creation?: string; // Optionnel, si vous voulez suivre la date de création
  date_mise_a_jour?: string; // Optionnel, si vous voulez suivre la date de mise à jour
}

export interface CreateDetteDTO {
  famille_id: number;
  creancier: string;
  montant_initial: number;
  montant_actuel?: number; // Si non fourni, égal à montant_initial
  taux_interet?: number;
  date_debut: string; // Format: YYYY-MM-DD
  date_echeance?: string | null; // Format: YYYY-MM-DD
  statut?: DetteStatut;
  description?: string;
}

export interface UpdateDetteDTO {
  creancier?: string;
  montant_actuel?: number;
  taux_interet?: number;
  date_echeance?: string | null; // Format: YYYY-MM-DD
  statut?: DetteStatut;
  description?: string | null;
}

export interface DetteFiltres {
  statut?: DetteStatut;
  dateDebut?: string; // Format: YYYY-MM-DD
  dateFin?: string; // Format: YYYY-MM-DD
  montantMin?: number;
  montantMax?: number;
  creancier?: string;
}
