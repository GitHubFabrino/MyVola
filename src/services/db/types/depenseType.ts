export interface Depense {
  id :number ;
  categorie_id : number;
  utilisateur_id :number;
  famille_id:number;
  montant :number;
  date : string;
  description ?:string | null ;
  statut : StatType ; 
  date_creation :string ;
  date_modification :string ;
}

export interface CreateDepensesDTO {
  categorie_id : number;
  utilisateur_id :number;
  famille_id:number;
  montant :number;
  date : string;
  description ?:string;
  statut : StatType ; 
}

export interface UpdateDepensesDTO {
  categorie_id? : number;
  utilisateur_id? :number;
  famille_id?:number;
  montant ?:number;
  date ?: string;
  description ?:string;
  statut ?: StatType ; 
}
export type StatType = 'valide' | 'en_attente' | 'annule' | 'rembourse';