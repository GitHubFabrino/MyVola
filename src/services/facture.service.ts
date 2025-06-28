import { initDatabase } from "./database";
import { 
  Facture, 
  CreateFactureDTO, 
  UpdateFactureDTO, 
  FactureStatut,
  FactureFrequence,
  FactureFiltres
} from "./db/types/factureType";

// Service de gestion des factures
export const factureService = {
  /**
   * Crée une nouvelle facture
   */
  createFacture: async (data: CreateFactureDTO): Promise<Facture> => {
    const db = await initDatabase();
    
    try {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO factures 
        (famille_id, categorie_id, montant, date_echeance, frequence, statut, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.categorie_id || null,
          data.montant,
          data.date_echeance,
          data.frequence || 'mensuel',
          data.statut || 'en_attente',
          data.description || null
        ]
      );
      
      return {
        id: result.lastInsertRowId as number,
        famille_id: data.famille_id,
        categorie_id: data.categorie_id || null,
        montant: data.montant,
        date_echeance: data.date_echeance,
        frequence: data.frequence || 'mensuel',
        statut: data.statut || 'en_attente',
        description: data.description || null,
        date_creation: now
      };
    } catch (error) {
      console.error('Erreur lors de la création de la facture', error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de créer cette facture');
    }
  },

  /**
   * Récupère une facture par son ID
   */
  getFactureById: async (id: number): Promise<Facture | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Facture>(
        'SELECT * FROM factures WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture ${id}`, error);
      throw new Error('Impossible de récupérer cette facture');
    }
  },

  /**
   * Récupère toutes les factures d'une famille avec des filtres optionnels
   */
  getFacturesByFamille: async (
    familleId: number, 
    filtres: FactureFiltres = {}
  ): Promise<Facture[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      let query = 'SELECT * FROM factures WHERE famille_id = ?';
      const params: any[] = [familleId];
      
      // Ajouter les filtres
      if (filtres.statut) {
        query += ' AND statut = ?';
        params.push(filtres.statut);
      }
      
      if (filtres.dateDebut) {
        query += ' AND date_echeance >= ?';
        params.push(filtres.dateDebut);
      }
      
      if (filtres.dateFin) {
        query += ' AND date_echeance <= ?';
        params.push(filtres.dateFin);
      }
      
      if (filtres.categorieId) {
        query += ' AND categorie_id = ?';
        params.push(filtres.categorieId);
      }
      
      if (filtres.montantMin !== undefined) {
        query += ' AND montant >= ?';
        params.push(filtres.montantMin);
      }
      
      if (filtres.montantMax !== undefined) {
        query += ' AND montant <= ?';
        params.push(filtres.montantMax);
      }
      
      query += ' ORDER BY date_echeance ASC';
      
      return await db.getAllAsync<Facture>(query, params);
    } catch (error) {
      console.error(`Erreur lors de la récupération des factures de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les factures de cette famille');
    }
  },

  /**
   * Met à jour une facture existante
   */
  updateFacture: async (
    id: number, 
    data: UpdateFactureDTO
  ): Promise<Facture | null> => {
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
      
      if (data.date_echeance !== undefined) {
        updates.push('date_echeance = ?');
        params.push(data.date_echeance);
      }
      
      if (data.frequence !== undefined) {
        updates.push('frequence = ?');
        params.push(data.frequence);
      }
      
      if (data.statut !== undefined) {
        updates.push('statut = ?');
        params.push(data.statut);
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await factureService.getFactureById(id);
      }
      
      // Ajouter la date de mise à jour
      updates.push('date_mise_a_jour = ?');
      params.push(new Date().toISOString());
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE factures 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner la facture mise à jour
      return await factureService.getFactureById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la facture ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour cette facture');
    }
  },

  /**
   * Supprime une facture
   */
  deleteFacture: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM factures WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la facture ${id}`, error);
      throw new Error('Impossible de supprimer cette facture');
    }
  },

  /**
   * Marque une facture comme payée
   */
  marquerCommePayee: async (id: number): Promise<Facture | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const now = new Date().toISOString();
      await db.runAsync(
        'UPDATE factures SET statut = ?, date_mise_a_jour = ? WHERE id = ?',
        ['paye', now, id]
      );
      
      return await factureService.getFactureById(id);
    } catch (error) {
      console.error(`Erreur lors du marquage de la facture ${id} comme payée`, error);
      throw new Error('Impossible de marquer cette facture comme payée');
    }
  },

  /**
   * Vérifie les factures en retard et met à jour leur statut
   */
  verifierFacturesEnRetard: async (): Promise<number> => {
    const db = await initDatabase();
    try {
      const now = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Mettre à jour les factures en retard
      const result = await db.runAsync(
        `UPDATE factures 
         SET statut = 'en_retard' 
         WHERE date_echeance < ? 
         AND statut = 'en_attente'`,
        [now]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des factures en retard', error);
      throw new Error('Impossible de vérifier les factures en retard');
    }
  },

  /**
   * Calcule le total des factures selon des critères donnés
   */
  calculerTotalFactures: async (
    familleId: number, 
    filtres: Omit<FactureFiltres, 'montantMin' | 'montantMax'> = {}
  ): Promise<number> => {
    if (!familleId) return 0;
    
    const db = await initDatabase();
    try {
      let query = 'SELECT SUM(montant) as total FROM factures WHERE famille_id = ?';
      const params: any[] = [familleId];
      
      // Ajouter les filtres
      if (filtres.statut) {
        query += ' AND statut = ?';
        params.push(filtres.statut);
      }
      
      if (filtres.dateDebut) {
        query += ' AND date_echeance >= ?';
        params.push(filtres.dateDebut);
      }
      
      if (filtres.dateFin) {
        query += ' AND date_echeance <= ?';
        params.push(filtres.dateFin);
      }
      
      if (filtres.categorieId) {
        query += ' AND categorie_id = ?';
        params.push(filtres.categorieId);
      }
      
      const result = await db.getFirstAsync<{ total: number | null }>(query, params);
      return result?.total || 0;
    } catch (error) {
      console.error('Erreur lors du calcul du total des factures', error);
      throw new Error('Impossible de calculer le total des factures');
    }
  }
};

// Alias pour la rétrocompatibilité
export const createFacture = factureService.createFacture;
export const getFacture = factureService.getFactureById;
export const updateFacture = factureService.updateFacture;
export const deleteFacture = factureService.deleteFacture;
