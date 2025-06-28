export type NotificationType = 
  | 'alerte_budget' 
  | 'rappel_facture' 
  | 'depense_inhabituelle' 
  | 'objectif_atteint' 
  | 'autre';

export interface Notification {
  id: number;
  utilisateur_id: number;
  type: NotificationType;
  titre: string;
  message: string;
  lue: boolean;
  date_creation: string; // Format: ISO 8601 (YYYY-MM-DD HH:MM:SS)
  date_lue?: string | null; // Format: ISO 8601 (YYYY-MM-DD HH:MM:SS)
  metadata?: Record<string, any>; // Pour stocker des données supplémentaires
}

export interface CreateNotificationDTO {
  utilisateur_id: number;
  type: NotificationType;
  titre: string;
  message: string;
  metadata?: Record<string, any>; // Données supplémentaires optionnelles
}

export interface UpdateNotificationDTO {
  lue?: boolean;
  date_lue?: string | null; // Format: ISO 8601 (YYYY-MM-DD HH:MM:SS)
  metadata?: Record<string, any>; // Mise à jour des métadonnées
}

export interface NotificationFiltres {
  type?: NotificationType;
  lue?: boolean;
  dateDebut?: string; // Format: YYYY-MM-DD
  dateFin?: string;   // Format: YYYY-MM-DD
  utilisateurId?: number;
}

export interface NotificationStats {
  total: number;
  lues: number;
  non_lues: number;
  par_type: Array<{
    type: NotificationType;
    count: number;
  }>;
}
