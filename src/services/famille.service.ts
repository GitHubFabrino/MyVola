import { initDatabase } from "./database";
import { 
  Famille, 
  CreateFamilleDTO, 
  UpdateFamilleDTO, 
} from "./db/types/familleType";

// Service de gestion des utilisateurs
export const familleService = {
  /**
   * Récupère tous les utilisateurs
   */
  getAllFamilles: async (): Promise<Famille[]> => {
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Famille>('SELECT * FROM familles ORDER BY nom ASC');
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
      throw new Error('Impossible de récupérer les utilisateurs');
    }
  },

  /**
   * Récupère un utilisateur par son ID
   */
  getFamilleById: async (id: number): Promise<Famille | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Famille>(
        'SELECT * FROM familles WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}`, error);
      throw new Error('Impossible de récupérer cet utilisateur');
    }
  },

  /**
   * Récupère un utilisateur par son email
   */
  getFamilleByName: async (nom: string): Promise<Famille | null> => {
    if (!nom) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Famille>(
        'SELECT * FROM familles WHERE nom = ?', 
        [nom]
      );
    } catch (error) {
      console.error(`Erreur lors de la recherche de la famille par nom ${nom}`, error);
      throw new Error('Une erreur est survenue lors de la recherche');
    }
  },

  /**
   * Crée un nouvel utilisateur
   */
  createFamille: async (data: CreateFamilleDTO): Promise<Famille> => {
    const db = await initDatabase();
    
    const existingFamille = await familleService.getFamilleByName(data.nom);
    if (existingFamille) {
      throw new Error('Une famille avec ce nom existe déjà');
    }
    
    try {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO familles 
        (nom, date_creation) 
        VALUES (?, ?)`,
        [
          data.nom,
          now
        ]
      );

      console.log('Famille créée db:', result);
      
      return {
        id: result.lastInsertRowId as number,
        ...data,
        date_creation: now
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur', error);
      throw new Error('Impossible de créer cet utilisateur');
    }
  },

  /**
   * Met à jour un utilisateur existant
   */
  updateFamille: async (id: number, data: UpdateFamilleDTO): Promise<Famille | null> => {
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
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await familleService.getFamilleById(id);
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE familles 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner l'utilisateur mis à jour
      return await familleService.getFamilleById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la famille ${id}`, error);
      throw new Error('Impossible de mettre à jour cette famille');
    }
  },

  /**
   * Supprime un utilisateur
   */
  deleteFamille: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM familles WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la famille ${id}`, error);
      throw new Error('Impossible de supprimer cette famille');
    }
  },

  /**
   * Vérifie si un nom de famille est déjà utilisé
   */
  isNomTaken: async (nom: string, excludeId?: number): Promise<boolean> => {
    if (!nom) return false;
    
    const db = await initDatabase();
    try {
      let query = 'SELECT COUNT(*) as count FROM familles WHERE nom = ?';
      const params: any[] = [nom];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const result = await db.getFirstAsync<{ count: number }>(query, params);
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom de famille', error);
      throw new Error('Impossible de vérifier ce nom de famille');
    }
  },

};
// Alias pour la rétrocompatibilité
export const createFamille = familleService.createFamille;
export const getFamilleById = familleService.getFamilleById;
export const updateFamille = familleService.updateFamille;
export const deleteFamille = familleService.deleteFamille;
export const isNomTaken = familleService.isNomTaken;
export const getFamilleByName = familleService.getFamilleByName;
export const getAllFamilles = familleService.getAllFamilles;
