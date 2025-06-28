export interface Categorie {
  id: number;
  famille_id: number;
  nom: string;
  type: 'revenu' | 'depense' | 'transfert';
  icone?: string | null;
  couleur?: string | null;
}

export interface CreateCategorieDTO {
    famille_id: number;
    nom: string;
    type: 'revenu' | 'depense' | 'transfert';
    icone?: string | null;
    couleur?: string | null;
}

export interface UpdateCategorieDTO extends Partial<Omit<CreateCategorieDTO, 'famille_id' | 'type'>> {
    nom?: string;
    icone?: string | null;
    couleur?: string | null;
}
