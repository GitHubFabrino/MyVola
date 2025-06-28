import { initDatabase } from "./database";
import { 
  Categorie, 
  CreateCategorieDTO, 
  UpdateCategorieDTO 
} from "./db/types/categorieType";

// Service de gestion des catégories
export const categorieService = {
  /**
   * Récupère toutes les catégories
   */
  getAllCategories: async (): Promise<Categorie[]> => {
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Categorie>('SELECT * FROM categories ORDER BY nom ASC');
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories', error);
      throw new Error('Impossible de récupérer les catégories');
    }
  },

  /**
   * Récupère une catégorie par son ID
   */
  getCategorieById: async (id: number): Promise<Categorie | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Categorie>(
        'SELECT * FROM categories WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie ${id}`, error);
      throw new Error('Impossible de récupérer cette catégorie');
    }
  },

  /**
   * Récupère les catégories par famille et type
   */
  getCategoriesByFamilleAndType: async (familleId: number, type: 'revenu' | 'depense' | 'transfert'): Promise<Categorie[]> => {
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Categorie>(
        'SELECT * FROM categories WHERE famille_id = ? AND type = ? ORDER BY nom ASC',
        [familleId, type]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des catégories pour la famille ${familleId} et type ${type}`, error);
      throw new Error('Impossible de récupérer les catégories');
    }
  },

  /**
   * Crée une nouvelle catégorie
   */
  createCategorie: async (data: CreateCategorieDTO): Promise<Categorie> => {
    const db = await initDatabase();
    
    try {
      const result = await db.runAsync(
        `INSERT INTO categories 
        (famille_id, nom, type, icone, couleur) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.nom,
          data.type,
          data.icone || null,
          data.couleur || null
        ]
      );
      
      return {
        id: result.lastInsertRowId as number,
        ...data
      };
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie', error);
      throw new Error('Impossible de créer cette catégorie');
    }
  },

  /**
   * Met à jour une catégorie existante
   */
  updateCategorie: async (id: number, data: UpdateCategorieDTO): Promise<Categorie | null> => {
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
      
      if (data.icone !== undefined) {
        updates.push('icone = ?');
        params.push(data.icone);
      }
      
      if (data.couleur !== undefined) {
        updates.push('couleur = ?');
        params.push(data.couleur);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await categorieService.getCategorieById(id);
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE categories 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner la catégorie mise à jour
      return await categorieService.getCategorieById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la catégorie ${id}`, error);
      throw new Error('Impossible de mettre à jour cette catégorie');
    }
  },

  /**
   * Supprime une catégorie
   */
  deleteCategorie: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la catégorie ${id}`, error);
      throw new Error('Impossible de supprimer cette catégorie');
    }
  },

  /**
   * Vérifie si un nom de catégorie existe déjà dans une famille
   */
  isCategorieNameTaken: async (familleId: number, nom: string, excludeId?: number): Promise<boolean> => {
    if (!nom || !familleId) return false;
    
    const db = await initDatabase();
    try {
      let query = 'SELECT COUNT(*) as count FROM categories WHERE famille_id = ? AND LOWER(nom) = LOWER(?)';
      const params: any[] = [familleId, nom];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const result = await db.getFirstAsync<{ count: number }>(query, params);
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom de catégorie', error);
      throw new Error('Impossible de vérifier ce nom de catégorie');
    }
  }
};

// Alias pour la rétrocompatibilité
export const addCategorie = categorieService.createCategorie;
export const getCategorie = categorieService.getCategorieById;
export const updateCategorie = categorieService.updateCategorie;
export const deleteCategorie = categorieService.deleteCategorie;
