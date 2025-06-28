import { initDatabase } from "./database";
import { 
  Compte,
  CreateCompteDTO,
  UpdateCompteDTO
} from "./db/types/compteType";

// Service de gestion des comptes
export const compteService = {
  /**
   * Récupère tous les comptes d'une famille
   */
  getAllComptes: async (familleId: number): Promise<Compte[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Compte>(
        'SELECT * FROM comptes WHERE famille_id = ? ORDER BY date_creation DESC',
        [familleId]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des comptes de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les comptes');
    }
  },

  /**
   * Récupère un compte spécifique
   */
  getCompte: async (id: number): Promise<Compte | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Compte>(
        'SELECT * FROM comptes WHERE id = ?',
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération du compte ${id}`, error);
      throw new Error('Impossible de récupérer ce compte');
    }
  },

  /**
   * Crée un nouveau compte
   */
  createCompte: async (data: CreateCompteDTO): Promise<Compte> => {
    if (!data.famille_id || !data.nom) {
      throw new Error('ID de famille et nom requis');
    }

    const db = await initDatabase();
    
    try {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO comptes 
        (famille_id, nom, solde, type, devise, date_creation) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.nom,
          data.solde || 0,
          data.type,
          data.devise || 'MGA',
          now
        ]
      );

      return {
        id: result.lastInsertRowId as number,
        ...data,
        solde: data.solde || 0,
        devise: data.devise || 'MGA',
        date_creation: now
      };
    } catch (error) {
      console.error('Erreur lors de la création du compte', error);
      throw new Error('Impossible de créer ce compte');
    }
  },

  /**
   * Met à jour un compte existant
   */
  updateCompte: async (id: number, data: UpdateCompteDTO): Promise<Compte | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.nom !== undefined) {
        updates.push('nom = ?');
        params.push(data.nom);
      }

      if (data.solde !== undefined) {
        updates.push('solde = ?');
        params.push(data.solde);
      }

      if (data.type !== undefined) {
        updates.push('type = ?');
        params.push(data.type);
      }

      if (data.devise !== undefined) {
        updates.push('devise = ?');
        params.push(data.devise);
      }

      if (updates.length === 0) {
        return await compteService.getCompte(id);
      }

      params.push(id);

      const query = `
        UPDATE comptes 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      await db.runAsync(query, params);

      return await compteService.getCompte(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte ${id}`, error);
      throw new Error('Impossible de mettre à jour ce compte');
    }
  },

  /**
   * Supprime un compte
   */
  deleteCompte: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM comptes WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression du compte ${id}`, error);
      throw new Error('Impossible de supprimer ce compte');
    }
  },

  /**
   * Vérifie si un compte existe déjà pour une famille
   */
  isCompteExistant: async (familleId: number, nom: string, excludeId?: number): Promise<boolean> => {
    if (!familleId || !nom) return false;
    
    const db = await initDatabase();
    try {
      let query = 'SELECT COUNT(*) as count FROM comptes WHERE famille_id = ? AND nom = ?';
      const params: any[] = [familleId, nom];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const result = await db.getFirstAsync<{ count: number }>(query, params);
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du compte', error);
      throw new Error('Impossible de vérifier ce compte');
    }
  },

  /**
   * Récupère les comptes par type
   */
  getComptesByType: async (familleId: number, type: string): Promise<Compte[]> => {
    if (!familleId || !type) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Compte>(
        'SELECT * FROM comptes WHERE famille_id = ? AND type = ? ORDER BY date_creation DESC',
        [familleId, type]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des comptes de type ${type}`, error);
      throw new Error('Impossible de récupérer ces comptes');
    }
  },

  /**
   * Calcule le total des soldes pour une famille
   */
  getTotalSolde: async (familleId: number): Promise<number> => {
    if (!familleId) return 0;
    
    const db = await initDatabase();
    try {
      const result = await db.getFirstAsync<{ total: number }>(
        'SELECT SUM(solde) as total FROM comptes WHERE famille_id = ?',
        [familleId]
      );
      return result?.total || 0;
    } catch (error) {
      console.error(`Erreur lors du calcul du total des soldes`, error);
      throw new Error('Impossible de calculer le total des soldes');
    }
  }
};

// Alias pour la rétrocompatibilité
export const addCompte = compteService.createCompte;
export const getCompteById = compteService.getCompte;
export const updateCompte = compteService.updateCompte;
export const deleteCompte = compteService.deleteCompte;
export const getTotalSolde = compteService.getTotalSolde;
