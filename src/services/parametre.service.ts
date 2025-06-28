import { initDatabase } from "./database";

// Types
export interface Parametre {
  id?: number;
  utilisateur_id: number;
  cle: string;
  valeur: string;
  date_modification?: string;
}

// Service de gestion des paramètres
export const parametreService = {
  /**
   * Récupère tous les paramètres d'un utilisateur
   */
  getParametresUtilisateur: async (utilisateurId: number): Promise<Parametre[]> => {
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Parametre>(
        'SELECT * FROM parametres WHERE utilisateur_id = ? ORDER BY cle ASC',
        [utilisateurId]
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres', error);
      throw new Error('Impossible de récupérer les paramètres');
    }
  },

  /**
   * Récupère un paramètre spécifique d'un utilisateur
   */
  getParametre: async (utilisateurId: number, cle: string): Promise<Parametre | null> => {
    if (!utilisateurId || !cle) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Parametre>(
        'SELECT * FROM parametres WHERE utilisateur_id = ? AND cle = ?',
        [utilisateurId, cle]
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération du paramètre ${cle}`, error);
      throw new Error(`Impossible de récupérer le paramètre ${cle}`);
    }
  },
  
  /**
   * Récupère la valeur d'un paramètre spécifique
   */
  getValeurParametre: async (utilisateurId: number, cle: string, valeurParDefaut: string = ''): Promise<string> => {
    try {
      const parametre = await parametreService.getParametre(utilisateurId, cle);
      return parametre?.valeur || valeurParDefaut;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la valeur du paramètre ${cle}`, error);
      return valeurParDefaut;
    }
  },

  /**
   * Crée ou met à jour un paramètre
   */
  setParametre: async (utilisateurId: number, cle: string, valeur: string): Promise<Parametre> => {
    if (!utilisateurId || !cle) {
      throw new Error('ID utilisateur et clé sont requis');
    }

    const db = await initDatabase();
    try {
      const now = new Date().toISOString();
      
      // Vérifier si le paramètre existe déjà
      const existingParam = await parametreService.getParametre(utilisateurId, cle);
      
      if (existingParam?.id) {
        // Mise à jour du paramètre existant
        const id = existingParam.id; // TypeScript sait maintenant que id est défini
        await db.runAsync(
          'UPDATE parametres SET valeur = ?, date_modification = ? WHERE id = ?',
          [valeur, now, id]
        );
        
        return {
          ...existingParam,
          valeur,
          date_modification: now
        };
      } else {
        // Création d'un nouveau paramètre
        const result = await db.runAsync(
          'INSERT INTO parametres (utilisateur_id, cle, valeur, date_modification) VALUES (?, ?, ?, ?)',
          [utilisateurId, cle, valeur, now]
        );
        
        return {
          id: result.lastInsertRowId as number,
          utilisateur_id: utilisateurId,
          cle,
          valeur,
          date_modification: now
        };
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paramètre', error);
      throw new Error('Impossible de mettre à jour le paramètre');
    }
  },
  
  /**
   * Supprime un paramètre
   */
  deleteParametre: async (utilisateurId: number, cle: string): Promise<boolean> => {
    if (!utilisateurId || !cle) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM parametres WHERE utilisateur_id = ? AND cle = ?',
        [utilisateurId, cle]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression du paramètre ${cle}`, error);
      throw new Error(`Impossible de supprimer le paramètre ${cle}`);
    }
  },
  
  /**
   * Supprime tous les paramètres d'un utilisateur
   */
  deleteAllParametres: async (utilisateurId: number): Promise<boolean> => {
    if (!utilisateurId) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM parametres WHERE utilisateur_id = ?',
        [utilisateurId]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression des paramètres', error);
      throw new Error('Impossible de supprimer les paramètres');
    }
  }
};


// Alias pour la rétrocompatibilité
export const getParametre = parametreService.getParametre;
export const setParametre = parametreService.setParametre;
export const deleteParametre = parametreService.deleteParametre;
