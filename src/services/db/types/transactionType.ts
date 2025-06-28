export interface Transaction {
  id: number;
  compte_id: number;
  categorie_id: number | null;
  utilisateur_id: number;
  montant: number;
  date: string;
  description: string | null;
  type: 'revenu' | 'depense' | 'transfert';
  statut: 'valide' | 'en_attente' | 'annule';
}

export interface CreateTransactionDTO {
  compte_id: number;
  categorie_id?: number | null;
  utilisateur_id: number;
  montant: number;
  date: string;
  description?: string | null;
  type: 'revenu' | 'depense' | 'transfert';
  statut?: 'valide' | 'en_attente' | 'annule';
}

export interface UpdateTransactionDTO {
  compte_id?: number;
  categorie_id?: number | null;
  montant?: number;
  date?: string;
  description?: string | null;
  type?: 'revenu' | 'depense' | 'transfert';
  statut?: 'valide' | 'en_attente' | 'annule';
}
