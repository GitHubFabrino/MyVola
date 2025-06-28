import { initDatabase } from "./database";
import { 
  Dette, 
  CreateDetteDTO, 
  UpdateDetteDTO, 
  DetteStatut,
  DetteFiltres
} from "./db/types/detteType";

// Service de gestion des dettes
export const detteService = {
  /**
   * Crée une nouvelle dette
   */
  createDette: async (data: CreateDetteDTO): Promise<Dette> => {
    const db = await initDatabase();
    
    try {
      const now = new Date().toISOString();
      const montantActuel = data.montant_actuel ?? data.montant_initial;
      
      const result = await db.runAsync(
        `INSERT INTO dettes 
        (famille_id, creancier, montant_initial, montant_actuel, taux_interet, date_debut, date_echeance, statut, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.creancier,
          data.montant_initial,
          montantActuel,
          data.taux_interet ?? 0,
          data.date_debut,
          data.date_echeance ?? null,
          data.statut ?? 'actif',
          data.description || null
        ]
      );
      
      return {
        id: result.lastInsertRowId as number,
        famille_id: data.famille_id,
        creancier: data.creancier,
        montant_initial: data.montant_initial,
        montant_actuel: montantActuel,
        taux_interet: data.taux_interet ?? 0,
        date_debut: data.date_debut,
        date_echeance: data.date_echeance ?? null,
        statut: data.statut ?? 'actif',
        description: data.description || null,
        date_creation: now
      };
    } catch (error) {
      console.error('Erreur lors de la création de la dette', error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de créer cette dette');
    }
  },

  /**
   * Récupère une dette par son ID
   */
  getDetteById: async (id: number): Promise<Dette | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Dette>(
        'SELECT * FROM dettes WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de la dette ${id}`, error);
      throw new Error('Impossible de récupérer cette dette');
    }
  },

  /**
   * Récupère toutes les dettes d'une famille avec des filtres optionnels
   */
  getDettesByFamille: async (
    familleId: number, 
    filtres: DetteFiltres = {}
  ): Promise<Dette[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      let query = 'SELECT * FROM dettes WHERE famille_id = ?';
      const params: any[] = [familleId];
      
      // Ajouter les filtres
      if (filtres.statut) {
        query += ' AND statut = ?';
        params.push(filtres.statut);
      }
      
      if (filtres.creancier) {
        query += ' AND LOWER(creancier) LIKE ?';
        params.push(`%${filtres.creancier.toLowerCase()}%`);
      }
      
      if (filtres.dateDebut) {
        query += ' AND date_debut >= ?';
        params.push(filtres.dateDebut);
      }
      
      if (filtres.dateFin) {
        query += ' AND (date_echeance <= ? OR date_echeance IS NULL)';
        params.push(filtres.dateFin);
      }
      
      if (filtres.montantMin !== undefined) {
        query += ' AND montant_actuel >= ?';
        params.push(filtres.montantMin);
      }
      
      if (filtres.montantMax !== undefined) {
        query += ' AND montant_actuel <= ?';
        params.push(filtres.montantMax);
      }
      
      query += ' ORDER BY date_echeance IS NULL, date_echeance ASC, creancier ASC';
      
      return await db.getAllAsync<Dette>(query, params);
    } catch (error) {
      console.error(`Erreur lors de la récupération des dettes de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les dettes de cette famille');
    }
  },

  /**
   * Met à jour une dette existante
   */
  updateDette: async (
    id: number, 
    data: UpdateDetteDTO
  ): Promise<Dette | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Construire dynamiquement la requête en fonction des champs fournis
      if (data.creancier !== undefined) {
        updates.push('creancier = ?');
        params.push(data.creancier);
      }
      
      if (data.montant_actuel !== undefined) {
        updates.push('montant_actuel = ?');
        params.push(data.montant_actuel);
      }
      
      if (data.taux_interet !== undefined) {
        updates.push('taux_interet = ?');
        params.push(data.taux_interet);
      }
      
      if (data.date_echeance !== undefined) {
        updates.push('date_echeance = ?');
        params.push(data.date_echeance);
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
        return await detteService.getDetteById(id);
      }
      
      // Ajouter la date de mise à jour
      updates.push('date_mise_a_jour = ?');
      params.push(new Date().toISOString());
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE dettes 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner la dette mise à jour
      return await detteService.getDetteById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la dette ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour cette dette');
    }
  },

  /**
   * Supprime une dette
   */
  deleteDette: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM dettes WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la dette ${id}`, error);
      throw new Error('Impossible de supprimer cette dette');
    }
  },

  /**
   * Effectue un remboursement partiel ou total d'une dette
   */
  effectuerRemboursement: async (
    id: number, 
    montant: number
  ): Promise<Dette | null> => {
    if (!id || montant <= 0) return null;
    
    const db = await initDatabase();
    try {
      const dette = await detteService.getDetteById(id);
      if (!dette) {
        throw new Error('Dette non trouvée');
      }
      
      if (dette.statut === 'rembourse') {
        throw new Error('Cette dette est déjà remboursée');
      }
      
      const nouveauMontant = Math.max(0, dette.montant_actuel - montant);
      const nouveauStatut: DetteStatut = nouveauMontant <= 0 ? 'rembourse' : dette.statut;
      
      await db.runAsync(
        'UPDATE dettes SET montant_actuel = ?, statut = ?, date_mise_a_jour = ? WHERE id = ?',
        [nouveauMontant, nouveauStatut, new Date().toISOString(), id]
      );
      
      return await detteService.getDetteById(id);
    } catch (error) {
      console.error(`Erreur lors du remboursement de la dette ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible d\'effectuer ce remboursement');
    }
  },

  /**
   * Calcule les intérêts d'une dette
   */
  calculerInterets: (dette: Dette): number => {
    if (!dette) return 0;
    
    // Calcul simple des intérêts (à adapter selon vos besoins)
    // Ici, on calcule les intérêts sur la base du montant initial
    // et du taux d'intérêt annuel
    const maintenant = new Date();
    const dateDebut = new Date(dette.date_debut);
    
    // Calculer la différence en années
    const differenceAnnees = (maintenant.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Calculer les intérêts (intérêts simples)
    return dette.montant_initial * (dette.taux_interet / 100) * differenceAnnees;
  },

  /**
   * Vérifie les dettes en retard et met à jour leur statut
   */
  verifierDettesEnRetard: async (): Promise<number> => {
    const db = await initDatabase();
    try {
      const maintenant = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Mettre à jour les dettes en retard
      const result = await db.runAsync(
        `UPDATE dettes 
         SET statut = 'en_retard' 
         WHERE date_echeance < ? 
         AND statut = 'actif'`,
        [maintenant]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des dettes en retard', error);
      throw new Error('Impossible de vérifier les dettes en retard');
    }
  },

  /**
   * Calcule le total des dettes selon des critères donnés
   */
  calculerTotalDettes: async (
    familleId: number, 
    filtres: Omit<DetteFiltres, 'montantMin' | 'montantMax' | 'creancier'> = {}
  ): Promise<{ total_actuel: number; total_initial: number }> => {
    if (!familleId) return { total_actuel: 0, total_initial: 0 };
    
    const db = await initDatabase();
    try {
      let query = 'SELECT SUM(montant_actuel) as total_actuel, SUM(montant_initial) as total_initial FROM dettes WHERE famille_id = ?';
      const params: any[] = [familleId];
      
      // Ajouter les filtres
      if (filtres.statut) {
        query += ' AND statut = ?';
        params.push(filtres.statut);
      }
      
      if (filtres.dateDebut) {
        query += ' AND date_debut >= ?';
        params.push(filtres.dateDebut);
      }
      
      if (filtres.dateFin) {
        query += ' AND (date_echeance <= ? OR date_echeance IS NULL)';
        params.push(filtres.dateFin);
      }
      
      const result = await db.getFirstAsync<{ total_actuel: number | null; total_initial: number | null }>(query, params);
      
      return {
        total_actuel: result?.total_actuel ?? 0,
        total_initial: result?.total_initial ?? 0
      };
    } catch (error) {
      console.error('Erreur lors du calcul du total des dettes', error);
      throw new Error('Impossible de calculer le total des dettes');
    }
  }
};

// Alias pour la rétrocompatibilité
export const createDette = detteService.createDette;
export const getDette = detteService.getDetteById;
export const updateDette = detteService.updateDette;
export const deleteDette = detteService.deleteDette;
