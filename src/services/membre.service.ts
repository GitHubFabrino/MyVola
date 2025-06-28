import { initDatabase } from "./database";
import { 
  MembreFamille,
  CreateMembreFamilleDTO,
  UpdateMembreFamilleDTO
} from "./db/types/familleType";

// Service de gestion des membres de famille
export const membreService = {
  /**
   * Récupère tous les membres d'une famille
   */
  getAllMembres: async (familleId: number): Promise<MembreFamille[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<MembreFamille>(
        'SELECT * FROM membres_famille WHERE famille_id = ? ORDER BY date_ajout DESC',
        [familleId]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des membres de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les membres');
    }
  },

  /**
   * Récupère un membre spécifique
   */
  getMembre: async (id: number): Promise<MembreFamille | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<MembreFamille>(
        'SELECT * FROM membres_famille WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération du membre ${id}`, error);
      throw new Error('Impossible de récupérer ce membre');
    }
  },

  /**
   * Ajoute un nouveau membre à une famille
   */
  ajouterMembre: async (data: CreateMembreFamilleDTO): Promise<MembreFamille> => {
    if (!data.famille_id || !data.utilisateur_id) {
      throw new Error('ID de famille et d\'utilisateur requis');
    }

    const db = await initDatabase();
    
    try {
      // Vérifier si l'utilisateur est déjà membre de cette famille
      const existingMember = await db.getFirstAsync<MembreFamille>(
        'SELECT * FROM membres_famille WHERE famille_id = ? AND utilisateur_id = ?',
        [data.famille_id, data.utilisateur_id]
      );
      
      if (existingMember) {
        throw new Error('Cet utilisateur est déjà membre de cette famille');
      }

      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO membres_famille 
        (famille_id, utilisateur_id, role, date_ajout) 
        VALUES (?, ?, ?, ?)`,
        [
          data.famille_id,
          data.utilisateur_id,
          data.role || 'membre',
          now
        ]
      );

      return {
        id: result.lastInsertRowId as number,
        ...data,
        date_ajout: now
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre', error);
      throw new Error('Impossible d\'ajouter ce membre');
    }
  },

  /**
   * Met à jour le rôle d'un membre
   */
  updateMembre: async (id: number, data: UpdateMembreFamilleDTO): Promise<MembreFamille | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.role !== undefined) {
        updates.push('role = ?');
        params.push(data.role);
      }

      if (updates.length === 0) {
        return await membreService.getMembre(id);
      }

      params.push(id);

      const query = `
        UPDATE membres_famille 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      await db.runAsync(query, params);

      return await membreService.getMembre(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du membre ${id}`, error);
      throw new Error('Impossible de mettre à jour ce membre');
    }
  },

  /**
   * Supprime un membre d'une famille
   */
  supprimerMembre: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM membres_famille WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression du membre ${id}`, error);
      throw new Error('Impossible de supprimer ce membre');
    }
  },

  /**
   * Vérifie si un utilisateur est déjà membre d'une famille
   */
  isMembre: async (familleId: number, utilisateurId: number): Promise<boolean> => {
    if (!familleId || !utilisateurId) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM membres_famille WHERE famille_id = ? AND utilisateur_id = ?',
        [familleId, utilisateurId]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du membre', error);
      throw new Error('Impossible de vérifier le membre');
    }
  },

  /**
   * Récupère les administrateurs d'une famille
   */
  getAdministrateurs: async (familleId: number): Promise<MembreFamille[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<MembreFamille>(
        'SELECT * FROM membres_famille WHERE famille_id = ? AND role = ? ORDER BY date_ajout DESC',
        [familleId, 'admin']
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des administrateurs de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les administrateurs');
    }
  }
};

// Alias pour la rétrocompatibilité
export const addMembre = membreService.ajouterMembre;
export const getMembreById = membreService.getMembre;
export const updateMembre = membreService.updateMembre;
export const deleteMembre = membreService.supprimerMembre;
export const getAdministrateurs = membreService.getAdministrateurs;
