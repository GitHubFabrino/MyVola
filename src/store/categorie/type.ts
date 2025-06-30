export interface CreateCategorieDTO {
    famille_id: number;    // ID de la famille
    nom: string;           // Nom de la catégorie
    type: 'revenu' | 'depense' | 'transfert';  // Type de catégorie
    icone?: string | null;  // Icône optionnelle
    couleur?: string | null; // Couleur optionnelle
}