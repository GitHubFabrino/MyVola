import { initDatabase } from "./database";
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from "./db/types/transactionType";

// Service de gestion des transactions
export const transactionService = {
  /**
   * Crée une nouvelle transaction
   */
  createTransaction: async (data: CreateTransactionDTO): Promise<Transaction> => {
    const db = await initDatabase();
    
    try {
      const result = await db.runAsync(
        `INSERT INTO transactions 
        (compte_id, categorie_id, utilisateur_id, montant, date, description, type, statut) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.compte_id,
          data.categorie_id || null,
          data.utilisateur_id,
          data.montant,
          data.date,
          data.description || null,
          data.type,
          data.statut || 'valide'
        ]
      );
      
      return {
        id: result.lastInsertRowId as number,
        ...data,
        categorie_id: data.categorie_id || null,
        description: data.description || null,
        statut: data.statut || 'valide'
      };
    } catch (error) {
      console.error('Erreur lors de la création de la transaction', error);
      throw new Error('Impossible de créer cette transaction');
    }
  },

  /**
   * Récupère une transaction par son ID
   */
  getTransactionById: async (id: number): Promise<Transaction | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Transaction>(
        'SELECT * FROM transactions WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de la transaction ${id}`, error);
      throw new Error('Impossible de récupérer cette transaction');
    }
  },

  /**
   * Récupère toutes les transactions d'un compte
   */
  getTransactionsByCompte: async (compteId: number): Promise<Transaction[]> => {
    if (!compteId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Transaction>(
        'SELECT * FROM transactions WHERE compte_id = ? ORDER BY date DESC',
        [compteId]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des transactions du compte ${compteId}`, error);
      throw new Error('Impossible de récupérer les transactions de ce compte');
    }
  },

  /**
   * Récupère toutes les transactions d'une catégorie
   */
  getTransactionsByCategorie: async (categorieId: number): Promise<Transaction[]> => {
    if (!categorieId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Transaction>(
        'SELECT * FROM transactions WHERE categorie_id = ? ORDER BY date DESC',
        [categorieId]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération des transactions de la catégorie ${categorieId}`, error);
      throw new Error('Impossible de récupérer les transactions de cette catégorie');
    }
  },

  /**
   * Met à jour une transaction existante
   */
  updateTransaction: async (id: number, data: UpdateTransactionDTO): Promise<Transaction | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Construire dynamiquement la requête en fonction des champs fournis
      if (data.compte_id !== undefined) {
        updates.push('compte_id = ?');
        params.push(data.compte_id);
      }
      
      if (data.categorie_id !== undefined) {
        updates.push('categorie_id = ?');
        params.push(data.categorie_id);
      }
      
      if (data.montant !== undefined) {
        updates.push('montant = ?');
        params.push(data.montant);
      }
      
      if (data.date !== undefined) {
        updates.push('date = ?');
        params.push(data.date);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      if (data.type !== undefined) {
        updates.push('type = ?');
        params.push(data.type);
      }
      
      if (data.statut !== undefined) {
        updates.push('statut = ?');
        params.push(data.statut);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await transactionService.getTransactionById(id);
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE transactions 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner la transaction mise à jour
      return await transactionService.getTransactionById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la transaction ${id}`, error);
      throw new Error('Impossible de mettre à jour cette transaction');
    }
  },

  /**
   * Supprime une transaction
   */
  deleteTransaction: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM transactions WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la transaction ${id}`, error);
      throw new Error('Impossible de supprimer cette transaction');
    }
  },

  /**
   * Récupère les transactions d'un compte dans une plage de dates
   */
  getTransactionsByDateRange: async (
    compteId: number,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> => {
    if (!compteId) return [];
    
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Transaction>(
        'SELECT * FROM transactions WHERE compte_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
        [compteId, startDate, endDate]
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions par plage de dates', error);
      throw new Error('Impossible de récupérer les transactions pour cette période');
    }
  }
};

// Alias pour la rétrocompatibilité
export const createTransaction = transactionService.createTransaction;
export const getTransaction = transactionService.getTransactionById;
export const updateTransaction = transactionService.updateTransaction;
export const deleteTransaction = transactionService.deleteTransaction;
