export interface Budget {
  id: number;
  famille_id: number;
  categorie_id: number | null;
  montant: number;
  mois: number;
  annee: number;
}

export interface CreateBudgetDTO {
  famille_id: number;
  categorie_id?: number | null;
  montant: number;
  mois: number;
  annee: number;
}

export interface UpdateBudgetDTO {
  categorie_id?: number | null;
  montant?: number;
  mois?: number;
  annee?: number;
}
