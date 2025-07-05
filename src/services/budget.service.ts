import { initDatabase } from "./database";
import { Budget, CreateBudgetDTO, UpdateBudgetDTO } from "./db/types/budgetType";

type SQLiteBindValue = string | number | null | Uint8Array;

// Service de gestion des budgets
export const budgetService = {
  /**
   * Crée un nouveau budget
   */
  createBudget: async (data: CreateBudgetDTO): Promise<Budget> => {
    const db = await initDatabase();
    
    try {
      // Vérifier si un budget existe déjà pour cette catégorie, mois et année
      const existingBudget = await db.getFirstAsync<Budget>(
        'SELECT * FROM budgets WHERE famille_id = ? AND categorie_id = ? AND mois = ? AND annee = ?',
        [data.famille_id, data.categorie_id || null, data.mois, data.annee]
      );

      if (existingBudget) {
        throw new Error('Un budget existe déjà pour cette catégorie, mois et année');
      }
      
      const result = await db.runAsync(
        `INSERT INTO budgets 
        (famille_id, categorie_id, montant, mois, annee) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.categorie_id || null,
          data.montant,
          data.mois,
          data.annee
        ]
      );

      console.log('Nouveau budget service:', result);
      
      return {
        id: result.lastInsertRowId as number,
        ...data,
        categorie_id: data.categorie_id || null
      };
    } catch (error) {
      console.error('Erreur lors de la création du budget', error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de créer ce budget');
    }
  },

  /**
   * Récupère un budget par son ID
   */
  getBudgetById: async (id: number): Promise<Budget | null> => {
    const db = await initDatabase();
    try {
      const result = await db.getFirstAsync<Budget>(
        'SELECT * FROM budgets WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du budget par ID:', error);
      throw new Error('Impossible de récupérer le budget');
    }
  },

  /**
   * Récupère tous les budgets d'une famille
   */
  getBudgetsByFamille: async (familleId: number): Promise<Budget[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Budget>(
        'SELECT * FROM budgets WHERE famille_id = ? ORDER BY annee DESC, mois DESC',
        [familleId]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des budgets de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les budgets de cette famille');
    }
  },

  /**
   * Récupère le budget d'une catégorie pour un mois et une année donnés
   */
  getBudgetByCategorieAndDate: async (
    familleId: number, 
    categorieId: number | null, 
    mois: number, 
    annee: number
  ): Promise<Budget | null> => {
    if (!familleId) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Budget>(
        'SELECT * FROM budgets WHERE famille_id = ? AND categorie_id = ? AND mois = ? AND annee = ?',
        [familleId, categorieId, mois, annee]
      );
    } catch (error) {
      console.error('Erreur lors de la récupération du budget par catégorie et date', error);
      throw new Error('Impossible de récupérer ce budget');
    }
  },

  /**
   * Met à jour un budget existant
   */
  updateBudget: async (id: number, data: UpdateBudgetDTO): Promise<Budget | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Construire dynamiquement la requête en fonction des champs fournis
      if (data.categorie_id !== undefined) {
        updates.push('categorie_id = ?');
        params.push(data.categorie_id);
      }
      
      if (data.montant !== undefined) {
        updates.push('montant = ?');
        params.push(data.montant);
      }
      
      if (data.mois !== undefined) {
        updates.push('mois = ?');
        params.push(data.mois);
      }
      
      if (data.annee !== undefined) {
        updates.push('annee = ?');
        params.push(data.annee);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await budgetService.getBudgetById(id);
      }
      
      // Vérifier les contraintes d'unicité si nécessaire
      if (data.mois !== undefined || data.annee !== undefined || data.categorie_id !== undefined) {
        const existingBudget = await budgetService.getBudgetById(id);
        if (existingBudget) {
          // S'assurer que les valeurs ne sont pas undefined
          const newCategorieId = data.categorie_id !== undefined ? data.categorie_id : existingBudget.categorie_id;
          const newMois = data.mois !== undefined ? data.mois : existingBudget.mois;
          const newAnnee = data.annee !== undefined ? data.annee : existingBudget.annee;
          
          // Préparer les paramètres avec des valeurs par défaut pour éviter les undefined
          const params: SQLiteBindValue[] = [
            id,
            existingBudget.famille_id ?? 0, // Utiliser une valeur par défaut si null
            newCategorieId === undefined ? null : newCategorieId, // Gérer le cas où newCategorieId est undefined
            newMois,
            newAnnee
          ].map(val => {
            if (val === undefined) return null;
            if (val === null) return null;
            return val as number; // On sait que les valeurs sont des nombres ici
          });
          
          const checkBudget = await db.getFirstAsync<Budget>(
            'SELECT * FROM budgets WHERE id != ? AND famille_id = ? AND categorie_id = ? AND mois = ? AND annee = ?',
            params
          );
          
          if (checkBudget) {
            throw new Error('Un budget existe déjà pour cette catégorie, mois et année');
          }
        }
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE budgets 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner le budget mis à jour
      return await budgetService.getBudgetById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du budget ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour ce budget');
    }
  },

  /**
   * Supprime un budget
   */
  deleteBudget: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM budgets WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression du budget ${id}`, error);
      throw new Error('Impossible de supprimer ce budget');
    }
  },

  /**
   * Récupère tous les budgets d'une famille pour un mois et une année donnés
   */
  getBudgetsByMonthAndYear: async (
    familleId: number,
    mois: number,
    annee: number
  ): Promise<Budget[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Budget>(
        'SELECT * FROM budgets WHERE famille_id = ? AND mois = ? AND annee = ?',
        [familleId, mois, annee]
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des budgets par mois et année', error);
      throw new Error('Impossible de récupérer les budgets pour cette période');
    }
  },

  getAllBudgets: async (): Promise<Budget[]> => {
    const db = await initDatabase();
    try {
    const data =  await db.getAllAsync<Budget>(`
        SELECT * FROM budgets
        
      `);

      console.log('Budgets chargés avec succès avec user:', data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des budgets:', error);
      throw new Error('Impossible de récupérer les budgets');
    }
  },


};

// Alias pour la rétrocompatibilité
export const createBudget = budgetService.createBudget;
export const getBudget = budgetService.getBudgetById;
export const updateBudget = budgetService.updateBudget;
export const deleteBudget = budgetService.deleteBudget;
export const getAllBudgets = budgetService.getAllBudgets;
