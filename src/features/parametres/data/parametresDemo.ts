export interface Parametre {
  id: number;
  utilisateur_id: number;
  cle: string;
  valeur: string;
  date_modification: string;
  description?: string;
  categorie?: string;
}

export const parametresDemo: Parametre[] = [
  {
    id: 1,
    utilisateur_id: 1,
    cle: 'theme',
    valeur: 'sombre',
    date_modification: '2025-06-30T10:00:00Z',
    description: 'Thème de l\'application',
    categorie: 'Apparence'
  },
  {
    id: 2,
    utilisateur_id: 1,
    cle: 'notifications',
    valeur: 'true',
    date_modification: '2025-06-29T15:30:00Z',
    description: 'Activer les notifications',
    categorie: 'Notifications'
  },
  {
    id: 3,
    utilisateur_id: 1,
    cle: 'devise',
    valeur: 'MGA',
    date_modification: '2025-06-28T09:15:00Z',
    description: 'Devise par défaut',
    categorie: 'Préférences'
  },
  {
    id: 4,
    utilisateur_id: 1,
    cle: 'sauvegarde_auto',
    valeur: 'true',
    date_modification: '2025-06-27T14:20:00Z',
    description: 'Sauvegarde automatique',
    categorie: 'Sécurité'
  },
  {
    id: 5,
    utilisateur_id: 1,
    cle: 'langue',
    valeur: 'fr',
    date_modification: '2025-06-26T11:45:00Z',
    description: 'Langue de l\'application',
    categorie: 'Préférences'
  }
];
