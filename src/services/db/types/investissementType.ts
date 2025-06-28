export type InvestissementType = 'actions' | 'obligations' | 'crypto' | 'immobilier' | 'autre';

export interface Investissement {
  id: number;
  famille_id: number;
  type: InvestissementType;
  nom: string;
  montant_investi: number;
  valeur_actuelle: number;
  date_achat: string; // Format: YYYY-MM-DD
  date_vente: string | null; // Format: YYYY-MM-DD
  rendement: number; // En pourcentage
  description: string | null;
  date_creation?: string; // Optionnel, date de création
  date_mise_a_jour?: string; // Optionnel, date de mise à jour
}

export interface CreateInvestissementDTO {
  famille_id: number;
  type: InvestissementType;
  nom: string;
  montant_investi: number;
  valeur_actuelle: number;
  date_achat: string; // Format: YYYY-MM-DD
  date_vente?: string | null; // Format: YYYY-MM-DD
  rendement?: number; // En pourcentage
  description?: string;
}

export interface UpdateInvestissementDTO {
  type?: InvestissementType;
  nom?: string;
  montant_investi?: number;
  valeur_actuelle?: number;
  date_achat?: string; // Format: YYYY-MM-DD
  date_vente?: string | null; // Format: YYYY-MM-DD
  rendement?: number; // En pourcentage
  description?: string | null;
}

export interface InvestissementFiltres {
  type?: InvestissementType;
  dateDebut?: string; // Format: YYYY-MM-DD
  dateFin?: string; // Format: YYYY-MM-DD
  rendementMin?: number;
  rendementMax?: number;
  recherche?: string; // Pour la recherche par nom ou description
}

export interface PerformanceInvestissement {
  montant_investi_total: number;
  valeur_actuelle_totale: number;
  plus_value: number;
  rendement_moyen: number;
  investissements: Investissement[];
}

export interface RepartitionParType {
  type: InvestissementType;
  montant: number;
  pourcentage: number;
}
