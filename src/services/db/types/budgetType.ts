import { MembreFamille } from "./familleType";

export interface Budget {
  id: number;
  categorie_id: number | null;
  montant: number;
  mois: number;
  annee: number;
  categorie_nom?: string;
  categorie_type?: string;
  famille_nom?: string;
  depense_actuelle?: number;
  depenseur_nom?: string;
  depenseur_id?: number;
  famille_id?: number;
  membre_famille_id?: number;
  type?: string;
  membres?: MembreFamille[];
  utilisateur_id?: number;
  utilisateur_nom?: string;
}

export interface CreateBudgetDTO {
  famille_id: number;
  categorie_id?: number | null;
  montant: number;
  mois: number;
  annee: number;
  type?: string;
  utilisateur_id?: number;
}

export interface UpdateBudgetDTO {
  categorie_id?: number | null;
  montant?: number;
  mois?: number;
  annee?: number;
}
