export type StatutObjectif = 'en_cours' | 'atteint' | 'abandonne';

export interface ObjectifEpargne {
  id?: number;
  famille_id: number;
  nom: string;
  montant_cible: number;
  montant_actuel: number;
  date_objectif: string; // Format: YYYY-MM-DD
  description?: string;
  statut: StatutObjectif;
}
