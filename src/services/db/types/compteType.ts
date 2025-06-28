export interface Compte {
  id: number;
  famille_id: number;
  nom: string;
  solde: number;
  type: CompteType;
  devise: string;
  date_creation: string;
}

export interface CreateCompteDTO {
  famille_id: number;
  nom: string;
  solde?: number;
  type: CompteType;
  devise?: string;
}

export interface UpdateCompteDTO {
  nom?: string;
  solde?: number;
  type?: CompteType;
  devise?: string;
}

export enum CompteType {
  COMPTE_COURANT = 'compte_courant',
  EPARGNE = 'epargne',
  ESPECES = 'especes',
  CARTE_CREDIT = 'carte_credit',
  AUTRE = 'autre'
}
