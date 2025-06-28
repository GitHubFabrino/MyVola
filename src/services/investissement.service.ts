import { initDatabase } from "./database";
import { 
  Investissement, 
  CreateInvestissementDTO, 
  UpdateInvestissementDTO, 
  InvestissementType,
  InvestissementFiltres,
  PerformanceInvestissement,
  RepartitionParType
} from "./db/types/investissementType";

// Service de gestion des investissements
export const investissementService = {
  /**
   * Crée un nouvel investissement
   */
  createInvestissement: async (data: CreateInvestissementDTO): Promise<Investissement> => {
    const db = await initDatabase();
    
    try {
      const now = new Date().toISOString();
      const rendement = data.rendement ?? 0;
      
      // Calculer le rendement si non fourni et que les montants sont valides
      let rendementCalcule = rendement;
      if (rendement === 0 && data.montant_investi > 0 && data.valeur_actuelle > 0) {
        rendementCalcule = ((data.valeur_actuelle - data.montant_investi) / data.montant_investi) * 100;
      }
      
      const result = await db.runAsync(
        `INSERT INTO investissements 
        (famille_id, type, nom, montant_investi, valeur_actuelle, date_achat, date_vente, rendement, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.famille_id,
          data.type,
          data.nom,
          data.montant_investi,
          data.valeur_actuelle,
          data.date_achat,
          data.date_vente ?? null,
          rendementCalcule,
          data.description || null
        ]
      );
      
      return {
        id: result.lastInsertRowId as number,
        famille_id: data.famille_id,
        type: data.type,
        nom: data.nom,
        montant_investi: data.montant_investi,
        valeur_actuelle: data.valeur_actuelle,
        date_achat: data.date_achat,
        date_vente: data.date_vente ?? null,
        rendement: rendementCalcule,
        description: data.description || null,
        date_creation: now
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'investissement', error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de créer cet investissement');
    }
  },

  /**
   * Récupère un investissement par son ID
   */
  getInvestissementById: async (id: number): Promise<Investissement | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Investissement>(
        'SELECT * FROM investissements WHERE id = ?', 
        [id]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'investissement ${id}`, error);
      throw new Error('Impossible de récupérer cet investissement');
    }
  },

  /**
   * Récupère tous les investissements d'une famille avec des filtres optionnels
   */
  getInvestissementsByFamille: async (
    familleId: number, 
    filtres: InvestissementFiltres = {}
  ): Promise<Investissement[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      let query = 'SELECT * FROM investissements WHERE famille_id = ?';
      const params: any[] = [familleId];
      
      // Ajouter les filtres
      if (filtres.type) {
        query += ' AND type = ?';
        params.push(filtres.type);
      }
      
      if (filtres.dateDebut) {
        query += ' AND date_achat >= ?';
        params.push(filtres.dateDebut);
      }
      
      if (filtres.dateFin) {
        query += ' AND (date_vente <= ? OR date_vente IS NULL)';
        params.push(filtres.dateFin);
      }
      
      if (filtres.rendementMin !== undefined) {
        query += ' AND rendement >= ?';
        params.push(filtres.rendementMin);
      }
      
      if (filtres.rendementMax !== undefined) {
        query += ' AND rendement <= ?';
        params.push(filtres.rendementMax);
      }
      
      if (filtres.recherche) {
        query += ' AND (LOWER(nom) LIKE ? OR LOWER(description) LIKE ?)';
        const recherche = `%${filtres.recherche.toLowerCase()}%`;
        params.push(recherche, recherche);
      }
      
      query += ' ORDER BY date_achat DESC, nom ASC';
      
      return await db.getAllAsync<Investissement>(query, params);
    } catch (error) {
      console.error(`Erreur lors de la récupération des investissements de la famille ${familleId}`, error);
      throw new Error('Impossible de récupérer les investissements de cette famille');
    }
  },

  /**
   * Met à jour un investissement existant
   */
  updateInvestissement: async (
    id: number, 
    data: UpdateInvestissementDTO
  ): Promise<Investissement | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
      // Construire dynamiquement la requête en fonction des champs fournis
      if (data.type !== undefined) {
        updates.push('type = ?');
        params.push(data.type);
      }
      
      if (data.nom !== undefined) {
        updates.push('nom = ?');
        params.push(data.nom);
      }
      
      if (data.montant_investi !== undefined) {
        updates.push('montant_investi = ?');
        params.push(data.montant_investi);
      }
      
      if (data.valeur_actuelle !== undefined) {
        updates.push('valeur_actuelle = ?');
        params.push(data.valeur_actuelle);
      }
      
      if (data.date_achat !== undefined) {
        updates.push('date_achat = ?');
        params.push(data.date_achat);
      }
      
      if (data.date_vente !== undefined) {
        updates.push('date_vente = ?');
        params.push(data.date_vente);
      }
      
      // Mettre à jour le rendement si la valeur actuelle ou le montant investi change
      const shouldUpdateRendement = data.valeur_actuelle !== undefined || data.montant_investi !== undefined;
      
      if (data.rendement !== undefined) {
        updates.push('rendement = ?');
        params.push(data.rendement);
      } else if (shouldUpdateRendement) {
        // Récupérer les valeurs actuelles si nécessaire
        const investissement = await investissementService.getInvestissementById(id);
        if (investissement) {
          const valeurActuelle = data.valeur_actuelle ?? investissement.valeur_actuelle;
          const montantInvesti = data.montant_investi ?? investissement.montant_investi;
          
          if (montantInvesti > 0) {
            const nouveauRendement = ((valeurActuelle - montantInvesti) / montantInvesti) * 100;
            updates.push('rendement = ?');
            params.push(nouveauRendement);
          }
        }
      }
      
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await investissementService.getInvestissementById(id);
      }
      
      // Ajouter la date de mise à jour
      updates.push('date_mise_a_jour = ?');
      params.push(new Date().toISOString());
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE investissements 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner l'investissement mis à jour
      return await investissementService.getInvestissementById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'investissement ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour cet investissement');
    }
  },

  /**
   * Supprime un investissement
   */
  deleteInvestissement: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM investissements WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'investissement ${id}`, error);
      throw new Error('Impossible de supprimer cet investissement');
    }
  },

  /**
   * Calcule la performance globale des investissements d'une famille
   */
  calculerPerformanceGlobale: async (familleId: number): Promise<PerformanceInvestissement> => {
    if (!familleId) {
      return {
        montant_investi_total: 0,
        valeur_actuelle_totale: 0,
        plus_value: 0,
        rendement_moyen: 0,
        investissements: []
      };
    }
    
    const db = await initDatabase();
    try {
      // Récupérer tous les investissements de la famille
      const investissements = await investissementService.getInvestissementsByFamille(familleId);
      
      if (investissements.length === 0) {
        return {
          montant_investi_total: 0,
          valeur_actuelle_totale: 0,
          plus_value: 0,
          rendement_moyen: 0,
          investissements: []
        };
      }
      
      // Calculer les totaux
      const montantInvestiTotal = investissements.reduce((sum, inv) => sum + inv.montant_investi, 0);
      const valeurActuelleTotale = investissements.reduce((sum, inv) => sum + inv.valeur_actuelle, 0);
      const plusValue = valeurActuelleTotale - montantInvestiTotal;
      
      // Calculer le rendement moyen pondéré
      let rendementMoyen = 0;
      if (montantInvestiTotal > 0) {
        rendementMoyen = (plusValue / montantInvestiTotal) * 100;
      }
      
      return {
        montant_investi_total: montantInvestiTotal,
        valeur_actuelle_totale: valeurActuelleTotale,
        plus_value: plusValue,
        rendement_moyen: parseFloat(rendementMoyen.toFixed(2)), // Arrondir à 2 décimales
        investissements
      };
    } catch (error) {
      console.error('Erreur lors du calcul de la performance globale', error);
      throw new Error('Impossible de calculer la performance globale des investissements');
    }
  },

  /**
   * Calcule la répartition des investissements par type
   */
  getRepartitionParType: async (familleId: number): Promise<RepartitionParType[]> => {
    if (!familleId) return [];
    
    const db = await initDatabase();
    try {
      const result = await db.getAllAsync<{type: InvestissementType, total: number}>(
        `SELECT type, SUM(valeur_actuelle) as total 
         FROM investissements 
         WHERE famille_id = ? 
         GROUP BY type 
         ORDER BY total DESC`,
        [familleId]
      );
      
      // Calculer le total pour les pourcentages
      const total = result.reduce((sum, item) => sum + item.total, 0);
      
      // Calculer les pourcentages
      return result.map(item => ({
        type: item.type,
        montant: item.total,
        pourcentage: total > 0 ? parseFloat(((item.total / total) * 100).toFixed(2)) : 0
      }));
    } catch (error) {
      console.error('Erreur lors du calcul de la répartition par type', error);
      throw new Error('Impossible de calculer la répartition des investissements par type');
    }
  },

  /**
   * Met à jour la valeur actuelle d'un investissement
   */
  mettreAJourValeur: async (
    id: number, 
    nouvelleValeur: number
  ): Promise<Investissement | null> => {
    if (!id || nouvelleValeur < 0) return null;
    
    const db = await initDatabase();
    try {
      // Récupérer l'investissement actuel
      const investissement = await investissementService.getInvestissementById(id);
      if (!investissement) {
        throw new Error('Investissement non trouvé');
      }
      
      // Calculer le nouveau rendement
      const nouveauRendement = ((nouvelleValeur - investissement.montant_investi) / investissement.montant_investi) * 100;
      
      // Mettre à jour l'investissement
      return await investissementService.updateInvestissement(id, {
        valeur_actuelle: nouvelleValeur,
        rendement: parseFloat(nouveauRendement.toFixed(2))
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la valeur de l'investissement ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de mettre à jour la valeur de cet investissement');
    }
  },

  /**
   * Vendre un investissement (marque la date de vente et met à jour la valeur actuelle)
   */
  vendreInvestissement: async (
    id: number, 
    valeurVente: number,
    dateVente: string = new Date().toISOString().split('T')[0]
  ): Promise<Investissement | null> => {
    if (!id || valeurVente < 0) return null;
    
    const db = await initDatabase();
    try {
      // Récupérer l'investissement actuel
      const investissement = await investissementService.getInvestissementById(id);
      if (!investissement) {
        throw new Error('Investissement non trouvé');
      }
      
      // Calculer le rendement final
      const rendementFinal = ((valeurVente - investissement.montant_investi) / investissement.montant_investi) * 100;
      
      // Mettre à jour l'investissement
      return await investissementService.updateInvestissement(id, {
        valeur_actuelle: valeurVente,
        date_vente: dateVente,
        rendement: parseFloat(rendementFinal.toFixed(2))
      });
    } catch (error) {
      console.error(`Erreur lors de la vente de l'investissement ${id}`, error);
      throw error instanceof Error 
        ? error 
        : new Error('Impossible de vendre cet investissement');
    }
  }
};

// Alias pour la rétrocompatibilité
export const createInvestissement = investissementService.createInvestissement;
export const getInvestissement = investissementService.getInvestissementById;
export const updateInvestissement = investissementService.updateInvestissement;
export const deleteInvestissement = investissementService.deleteInvestissement;
