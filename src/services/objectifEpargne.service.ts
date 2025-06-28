import { initDatabase } from "./database";
import { 
  ObjectifEpargne, 
  CreateObjectifEpargneDTO, 
  UpdateObjectifEpargneDTO,
  ObjectifStatut 
} from "./db/types/objectifEpargneType";

// Service de gestion des objectifs d'épargne
export const objectifEpargneService = {
  /**
   * Crée un nouvel objectif d'épargne
   */
  createObjectifEpargne: async (data: CreateObjectifEpargneDTO): Promise<ObjectifEpargne> => {
    const db = await initDatabase();
    
    try {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO objectifs_epargne 
        (famille_id, nom, montant_cible, montant_actuel, date_objectif, description, statut) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.nom,
          data.montant_cible,
          data.montant_actuel || 0,
          data.date_objectif,
          data.description || null,
          data.statut || 'en_cours'
        ]
      );
      
      return {
        id: result.lastInsertRowId as number,
        famille_id: data.famille_id,
        nom: data.nom,
        montant_cible: data.montant_cible,
        montant_actuel: data.montant_actuel || 0,
        date_objectif: data.date_objectif,
        description: data.description || null,
        statut: data.statut || 'en_cours'
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'objectif d\'épargne', error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de créer cet objectif d\'épargne');
    }
  },

  /**
   * Récupère un objectif d'épargne par son ID
   */
  getObjectifEpargneById: async (id: number): Promise<ObjectifEpargne | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<ObjectifEpargne>(
        'SELECT * FROM objectifs_epargne WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'objectif d'épargne ${id}`, error);
      throw new Error('Impossible de récupérer cet objectif d\'épargne');
    }
  },

  /**
   * Récupère tous les objectifs d'épargne d'une famille
   */
  getObjectifsEpargneByFamille: async (familleId: number): Promise<ObjectifEpargne[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<ObjectifEpargne>(
        'SELECT * FROM objectifs_epargne WHERE famille_id = ? ORDER BY date_objectif ASC',
        [familleId]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des objectifs d'épargne de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les objectifs d\'épargne de cette famille');
    }
  },

  /**
   * Met à jour un objectif d'épargne existant
   */
  updateObjectifEpargne: async (
    id: number, 
    data: UpdateObjectifEpargneDTO
  ): Promise<ObjectifEpargne | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Construire dynamiquement la requête en fonction des champs fournis
      if (data.nom !== undefined) {
        updates.push('nom = ?');
        params.push(data.nom);
      }
      
      if (data.montant_cible !== undefined) {
        updates.push('montant_cible = ?');
        params.push(data.montant_cible);
      }
      
      if (data.montant_actuel !== undefined) {
        updates.push('montant_actuel = ?');
        params.push(data.montant_actuel);
      }
      
      if (data.date_objectif !== undefined) {
        updates.push('date_objectif = ?');
        params.push(data.date_objectif);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      if (data.statut !== undefined) {
        updates.push('statut = ?');
        params.push(data.statut);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await objectifEpargneService.getObjectifEpargneById(id);
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE objectifs_epargne 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Vérifier et mettre à jour le statut en fonction du montant actuel
      if (data.montant_actuel !== undefined) {
        const objectif = await objectifEpargneService.getObjectifEpargneById(id);
        if (objectif) {
          let newStatut: ObjectifStatut = objectif.statut;
          
          if (objectif.montant_actuel >= objectif.montant_cible && objectif.statut !== 'abandonne') {
            newStatut = 'atteint';
          } else if (objectif.montant_actuel < objectif.montant_cible && objectif.statut !== 'abandonne') {
            newStatut = 'en_cours';
          }
          
          if (newStatut !== objectif.statut) {
            await db.runAsync(
              'UPDATE objectifs_epargne SET statut = ? WHERE id = ?',
              [newStatut, id]
            );
          }
        }
      }
      
      // Retourner l'objectif mis à jour
      return await objectifEpargneService.getObjectifEpargneById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'objectif d'épargne ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour cet objectif d\'épargne');
    }
  },

  /**
   * Supprime un objectif d'épargne
   */
  deleteObjectifEpargne: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM objectifs_epargne WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'objectif d'épargne ${id}`, error);
      throw new Error('Impossible de supprimer cet objectif d\'épargne');
    }
  },

  /**
   * Ajoute un montant à l'épargne actuelle d'un objectif
   */
  ajouterMontant: async (id: number, montant: number): Promise<ObjectifEpargne | null> => {
    if (!id || montant <= 0) return null;
    
    const db = await initDatabase();
    try {
      await db.runAsync(
        'UPDATE objectifs_epargne SET montant_actuel = montant_actuel + ? WHERE id = ?',
        [montant, id]
      );
      
      // Mettre à jour le statut si nécessaire
      const objectif = await objectifEpargneService.getObjectifEpargneById(id);
      if (objectif && objectif.montant_actuel >= objectif.montant_cible && objectif.statut !== 'abandonne') {
        await db.runAsync(
          'UPDATE objectifs_epargne SET statut = ? WHERE id = ?',
          ['atteint', id]
        );
      }
      
      return await objectifEpargneService.getObjectifEpargneById(id);
    } catch (error) {
      console.error(`Erreur lors de l'ajout du montant à l'objectif d'épargne ${id}`, error);
      throw new Error('Impossible de mettre à jour le montant de cet objectif d\'épargne');
    }
  },

  /**
   * Récupère les objectifs d'épargne par statut
   */
  getObjectifsEpargneByStatut: async (
    familleId: number,
    statut: ObjectifStatut
  ): Promise<ObjectifEpargne[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<ObjectifEpargne>(
        'SELECT * FROM objectifs_epargne WHERE famille_id = ? AND statut = ? ORDER BY date_objectif ASC',
        [familleId, statut]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des objectifs d'épargne avec le statut ${statut}`, error);
      throw new Error(`Impossible de récupérer les objectifs d'épargne avec le statut ${statut}`);
    }
  },

  /**
   * Calcule le pourcentage de réalisation d'un objectif d'épargne
   */
  calculerPourcentageRealisation: (objectif: ObjectifEpargne): number => {
    if (!objectif || objectif.montant_cible <= 0) return 0;
    const pourcentage = (objectif.montant_actuel / objectif.montant_cible) * 100;
    return Math.min(100, Math.max(0, Math.round(pourcentage * 100) / 100)); // Arrondi à 2 décimales
  }
};

// Alias pour la rétrocompatibilité
export const createObjectifEpargne = objectifEpargneService.createObjectifEpargne;
export const getObjectifEpargne = objectifEpargneService.getObjectifEpargneById;
export const updateObjectifEpargne = objectifEpargneService.updateObjectifEpargne;
export const deleteObjectifEpargne = objectifEpargneService.deleteObjectifEpargne;
