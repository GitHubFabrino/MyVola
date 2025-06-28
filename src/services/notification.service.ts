import { initDatabase } from "./database";
import { 
  Notification, 
  CreateNotificationDTO, 
  UpdateNotificationDTO, 
  NotificationType,
  NotificationFiltres,
  NotificationStats
} from "./db/types/notificationType";

// Service de gestion des notifications
export const notificationService = {
  /**
   * Crée une nouvelle notification
   */
  createNotification: async (data: CreateNotificationDTO): Promise<Notification> => {
    const db = await initDatabase();
    
    try {
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `INSERT INTO notifications 
        (utilisateur_id, type, titre, message, date_creation) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          data.utilisateur_id,
          data.type,
          data.titre,
          data.message,
          now
        ]
      );
      
      // Récupérer la notification créée
      const notification = await db.getFirstAsync<Notification>(
        'SELECT * FROM notifications WHERE id = ?',
        [result.lastInsertRowId]
      );
      
      if (!notification) {
        throw new Error('La notification n\'a pas pu être récupérée après sa création');
      }
      
      // Ajouter les métadonnées si elles existent
      if (data.metadata) {
        notification.metadata = data.metadata;
      }
      
      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification', error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de créer cette notification');
    }
  },

  /**
   * Récupère une notification par son ID
   */
  getNotificationById: async (id: number): Promise<Notification | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Notification>(
        'SELECT * FROM notifications WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de la notification ${id}`, error);
      throw new Error('Impossible de récupérer cette notification');
    }
  },

  /**
   * Récupère les notifications d'un utilisateur avec des filtres optionnels
   */
  getNotificationsByUtilisateur: async (
    utilisateurId: number, 
    filtres: Omit<NotificationFiltres, 'utilisateurId'> = {}
  ): Promise<Notification[]> => {
    if (!utilisateurId) return [];
    
    const db = await initDatabase();
    try {
      let query = 'SELECT * FROM notifications WHERE utilisateur_id = ?';
      const params: any[] = [utilisateurId];
      
      // Ajouter les filtres
      if (filtres.type) {
        query += ' AND type = ?';
        params.push(filtres.type);
      }
      
      if (filtres.lue !== undefined) {
        query += ' AND lue = ?';
        params.push(filtres.lue ? 1 : 0);
      }
      
      if (filtres.dateDebut) {
        query += ' AND date_creation >= ?';
        params.push(`${filtres.dateDebut} 00:00:00`);
      }
      
      if (filtres.dateFin) {
        query += ' AND date_creation <= ?';
        params.push(`${filtres.dateFin} 23:59:59`);
      }
      
      query += ' ORDER BY date_creation DESC';
      
      return await db.getAllAsync<Notification>(query, params);
    } catch (error) {
      console.error(`Erreur lors de la récupération des notifications de l'utilisateur ${utilisateurId}`, error);
      throw new Error('Impossible de récupérer les notifications de cet utilisateur');
    }
  },

  /**
   * Met à jour une notification existante
   */
  updateNotification: async (
    id: number, 
    data: UpdateNotificationDTO
  ): Promise<Notification | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Construire dynamiquement la requête en fonction des champs fournis
      if (data.lue !== undefined) {
        updates.push('lue = ?');
        params.push(data.lue ? 1 : 0);
        
        // Si la notification est marquée comme lue, mettre à jour la date de lecture
        if (data.lue) {
          updates.push('date_lue = ?');
          params.push(new Date().toISOString());
        } else {
          updates.push('date_lue = NULL');
        }
      }
      
      if (data.date_lue !== undefined) {
        updates.push('date_lue = ?');
        params.push(data.date_lue);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await notificationService.getNotificationById(id);
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE notifications 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner la notification mise à jour
      return await notificationService.getNotificationById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la notification ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour cette notification');
    }
  },

  /**
   * Marque une notification comme lue
   */
  marquerCommeLue: async (id: number): Promise<Notification | null> => {
    return notificationService.updateNotification(id, { lue: true });
  },

  /**
   * Marque plusieurs notifications comme lues
   */
  marquerPlusieursCommeLues: async (ids: number[]): Promise<number> => {
    if (!ids.length) return 0;
    
    const db = await initDatabase();
    try {
      const placeholders = ids.map(() => '?').join(',');
      const now = new Date().toISOString();
      
      const result = await db.runAsync(
        `UPDATE notifications 
         SET lue = 1, date_lue = ? 
         WHERE id IN (${placeholders})`,
        [now, ...ids]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Erreur lors du marquage des notifications comme lues', error);
      throw new Error('Impossible de marquer ces notifications comme lues');
    }
  },

  /**
   * Supprime une notification
   */
  deleteNotification: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM notifications WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la notification ${id}`, error);
      throw new Error('Impossible de supprimer cette notification');
    }
  },

  /**
   * Supprime plusieurs notifications
   */
  deleteMultipleNotifications: async (ids: number[]): Promise<number> => {
    if (!ids.length) return 0;
    
    const db = await initDatabase();
    try {
      const placeholders = ids.map(() => '?').join(',');
      
      const result = await db.runAsync(
        `DELETE FROM notifications WHERE id IN (${placeholders})`,
        ids
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications', error);
      throw new Error('Impossible de supprimer ces notifications');
    }
  },

  /**
   * Supprime toutes les notifications d'un utilisateur
   */
  deleteAllNotifications: async (utilisateurId: number): Promise<number> => {
    if (!utilisateurId) return 0;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM notifications WHERE utilisateur_id = ?',
        [utilisateurId]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression des notifications de l'utilisateur ${utilisateurId}`, error);
      throw new Error('Impossible de supprimer les notifications de cet utilisateur');
    }
  },

  /**
   * Récupère les statistiques des notifications d'un utilisateur
   */
  getNotificationStats: async (utilisateurId: number): Promise<NotificationStats> => {
    if (!utilisateurId) {
      return {
        total: 0,
        lues: 0,
        non_lues: 0,
        par_type: []
      };
    }
    
    const db = await initDatabase();
    try {
      // Récupérer le nombre total de notifications
      const totalResult = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM notifications WHERE utilisateur_id = ?',
        [utilisateurId]
      );
      
      // Récupérer le nombre de notifications lues
      const luesResult = await db.getFirstAsync<{ lues: number }>(
        'SELECT COUNT(*) as lues FROM notifications WHERE utilisateur_id = ? AND lue = 1',
        [utilisateurId]
      );
      
      // Récupérer la répartition par type
      const parTypeResult = await db.getAllAsync<{ type: NotificationType, count: number }>(
        `SELECT type, COUNT(*) as count 
         FROM notifications 
         WHERE utilisateur_id = ? 
         GROUP BY type 
         ORDER BY count DESC`,
        [utilisateurId]
      );
      
      return {
        total: totalResult?.total || 0,
        lues: luesResult?.lues || 0,
        non_lues: (totalResult?.total || 0) - (luesResult?.lues || 0),
        par_type: parTypeResult || []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des notifications', error);
      throw new Error('Impossible de récupérer les statistiques des notifications');
    }
  },

  /**
   * Crée une notification de rappel de facture
   */
  creerRappelFacture: async (
    utilisateurId: number, 
    factureId: number, 
    joursAvantEcheance: number = 3
  ): Promise<Notification | null> => {
    if (!utilisateurId || !factureId) return null;
    
    try {
      // Ici, vous pourriez ajouter une logique pour récupérer les détails de la facture
      // et personnaliser le message en conséquence
      
      return await notificationService.createNotification({
        utilisateur_id: utilisateurId,
        type: 'rappel_facture',
        titre: 'Rappel de facture',
        message: `Une facture arrive à échéance dans ${joursAvantEcheance} jour(s).`,
        metadata: {
          facture_id: factureId,
          jours_avant_echeance: joursAvantEcheance
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création du rappel de facture', error);
      throw new Error('Impossible de créer le rappel de facture');
    }
  },

  /**
   * Crée une notification d'alerte de budget
   */
  creerAlerteBudget: async (
    utilisateurId: number, 
    categorieId: number, 
    montantDepasse: number
  ): Promise<Notification | null> => {
    if (!utilisateurId || !categorieId) return null;
    
    try {
      // Ici, vous pourriez ajouter une logique pour récupérer les détails de la catégorie
      // et personnaliser le message en conséquence
      
      return await notificationService.createNotification({
        utilisateur_id: utilisateurId,
        type: 'alerte_budget',
        titre: 'Alerte budget dépassé',
        message: `Le budget de cette catégorie a été dépassé de ${montantDepasse.toFixed(2)} €.`,
        metadata: {
          categorie_id: categorieId,
          montant_depasse: montantDepasse
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte budget', error);
      throw new Error('Impossible de créer l\'alerte budget');
    }
  },

  /**
   * Crée une notification d'objectif atteint
   */
  creerNotificationObjectifAtteint: async (
    utilisateurId: number, 
    objectifId: number, 
    objectifNom: string
  ): Promise<Notification | null> => {
    if (!utilisateurId || !objectifId) return null;
    
    try {
      return await notificationService.createNotification({
        utilisateur_id: utilisateurId,
        type: 'objectif_atteint',
        titre: 'Objectif atteint !',
        message: `Félicitations ! Vous avez atteint votre objectif "${objectifNom}".`,
        metadata: {
          objectif_id: objectifId,
          objectif_nom: objectifNom
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification d\'objectif atteint', error);
      throw new Error('Impossible de créer la notification d\'objectif atteint');
    }
  }
};

// Alias pour la rétrocompatibilité
export const createNotification = notificationService.createNotification;
export const getNotification = notificationService.getNotificationById;
export const updateNotification = notificationService.updateNotification;
export const deleteNotification = notificationService.deleteNotification;
