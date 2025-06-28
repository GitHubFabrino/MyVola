export type ObjectifStatut = 'en_cours' | 'atteint' | 'abandonne';

export interface ObjectifEpargne {
  id: number;
  famille_id: number;
  nom: string;
  montant_cible: number;
  montant_actuel: number;
  date_objectif: string; // Format: YYYY-MM-DD
  description: string | null;
  statut: ObjectifStatut;
}

export interface CreateObjectifEpargneDTO {
  famille_id: number;
  nom: string;
  montant_cible: number;
  montant_actuel?: number;
  date_objectif: string; // Format: YYYY-MM-DD
  description?: string;
  statut?: ObjectifStatut;
}

export interface UpdateObjectifEpargneDTO {
  nom?: string;
  montant_cible?: number;
  montant_actuel?: number;
  date_objectif?: string; // Format: YYYY-MM-DD
  description?: string | null;
  statut?: ObjectifStatut;
}
