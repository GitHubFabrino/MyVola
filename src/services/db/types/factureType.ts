export type FactureFrequence = 'unique' | 'quotidien' | 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel';
export type FactureStatut = 'paye' | 'en_attente' | 'en_retard';

export interface Facture {
  id: number;
  famille_id: number;
  categorie_id: number | null;
  montant: number;
  date_echeance: string; // Format: YYYY-MM-DD
  frequence: FactureFrequence;
  statut: FactureStatut;
  description: string | null;
  date_creation?: string; // Optionnel, si vous voulez suivre la date de création
  date_mise_a_jour?: string; // Optionnel, si vous voulez suivre la date de mise à jour
}

export interface CreateFactureDTO {
  famille_id: number;
  categorie_id?: number | null;
  montant: number;
  date_echeance: string; // Format: YYYY-MM-DD
  frequence?: FactureFrequence;
  statut?: FactureStatut;
  description?: string;
}

export interface UpdateFactureDTO {
  categorie_id?: number | null;
  montant?: number;
  date_echeance?: string; // Format: YYYY-MM-DD
  frequence?: FactureFrequence;
  statut?: FactureStatut;
  description?: string | null;
}

export interface FactureFiltres {
  statut?: FactureStatut;
  dateDebut?: string; // Format: YYYY-MM-DD
  dateFin?: string; // Format: YYYY-MM-DD
  categorieId?: number;
  montantMin?: number;
  montantMax?: number;
}
