import { initDatabase } from "./database";
import { 
  Utilisateur, 
  CreateUtilisateurDTO, 
  UpdateUtilisateurDTO, 
  AuthResponse 
} from "./db/types/utilisateurType";

// Service de gestion des utilisateurs
export const utilisateurService = {
  /**
   * Récupère tous les utilisateurs
   */
  getAllUtilisateurs: async (): Promise<Utilisateur[]> => {
    const db = await initDatabase();
    try {
      return await db.getAllAsync<Utilisateur>('SELECT * FROM utilisateurs ORDER BY nom ASC');
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
      throw new Error('Impossible de récupérer les utilisateurs');
    }
  },

  /**
   * Récupère un utilisateur par son ID
   */
  getUtilisateurById: async (id: number): Promise<Utilisateur | null> => {
    if (!id) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Utilisateur>(
        'SELECT * FROM utilisateurs WHERE id = ?', 
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
  getUtilisateurByEmail: async (email: string): Promise<Utilisateur | null> => {
    if (!email) return null;
    
    const db = await initDatabase();
    try {
      return await db.getFirstAsync<Utilisateur>(
        'SELECT * FROM utilisateurs WHERE email = ?', 
        [email]
      );
    } catch (error) {
      console.error(`Erreur lors de la recherche de l'utilisateur par email ${email}`, error);
      throw new Error('Une erreur est survenue lors de la recherche');
    }
  },

  /**
   * Crée un nouvel utilisateur
   */
  createUtilisateur: async (data: CreateUtilisateurDTO): Promise<Utilisateur> => {
    const db = await initDatabase();
    
    // Vérifier si l'email est déjà utilisé
    const existingUser = await utilisateurService.getUtilisateurByEmail(data.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }
    
    try {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO utilisateurs 
        (nom, email, mot_de_passe, photo, date_creation) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          data.nom,
          data.email,
          data.mot_de_passe, // Devrait être hashé avant d'arriver ici
          data.photo || null,
          now
        ]
      );
      
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
  updateUtilisateur: async (id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur | null> => {
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
      
      if (data.mot_de_passe !== undefined) {
        updates.push('mot_de_passe = ?');
        params.push(data.mot_de_passe); // Devrait être hashé avant
      }
      
      if (data.photo !== undefined) {
        updates.push('photo = ?');
        params.push(data.photo);
      }
      
      if (updates.length === 0) {
        // Aucune mise à jour nécessaire
        return await utilisateurService.getUtilisateurById(id);
      }
      
      // Ajouter l'ID pour le WHERE
      params.push(id);
      
      const query = `
        UPDATE utilisateurs 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;
      
      await db.runAsync(query, params);
      
      // Retourner l'utilisateur mis à jour
      return await utilisateurService.getUtilisateurById(id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}`, error);
      throw new Error('Impossible de mettre à jour cet utilisateur');
    }
  },

  /**
   * Supprime un utilisateur
   */
  deleteUtilisateur: async (id: number): Promise<boolean> => {
    if (!id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'DELETE FROM utilisateurs WHERE id = ?',
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}`, error);
      throw new Error('Impossible de supprimer cet utilisateur');
    }
  },

  /**
   * Vérifie si un email est déjà utilisé
   */
  isEmailTaken: async (email: string, excludeId?: number): Promise<boolean> => {
    if (!email) return false;
    
    const db = await initDatabase();
    try {
      let query = 'SELECT COUNT(*) as count FROM utilisateurs WHERE email = ?';
      const params: any[] = [email];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const result = await db.getFirstAsync<{ count: number }>(query, params);
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email', error);
      throw new Error('Impossible de vérifier cet email');
    }
  },

  /**
   * Authentifie un utilisateur
   */
  login: async (email: string, motDePasse: string): Promise<AuthResponse> => {
    try {
      const utilisateur = await utilisateurService.getUtilisateurByEmail(email);
      
      if (!utilisateur) {
        throw new Error('Identifiants invalides');
      }
      
      // ICI: Vérifier le mot de passe (devrait utiliser bcrypt ou équivalent)
      const isPasswordValid = utilisateur.mot_de_passe === motDePasse; // À remplacer par une vraie vérification
      
      if (!isPasswordValid) {
        throw new Error('Identifiants invalides');
      }
      
      // ICI: Générer des tokens JWT
      const token = 'generer-un-jwt-ici';
      const refreshToken = 'generer-un-refresh-token-ici';
      
      // Ne pas renvoyer le mot de passe
      const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur;
      
      return {
        utilisateur: utilisateurSansMotDePasse,
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Erreur lors de l\'authentification', error);
      throw error instanceof Error 
        ? error 
        : new Error('Une erreur est survenue lors de l\'authentification');
    }
  },

  getCurrentUser: async (): Promise<Utilisateur> => {
    const db = await initDatabase();
    try {
      // Dans une vraie application, vous récupéreriez l'ID de l'utilisateur connecté depuis un token JWT
      // Pour l'instant, on suppose que vous avez un moyen de récupérer l'ID de l'utilisateur connecté
      const userId = 1; // À remplacer par la récupération du vrai ID
      
      const user = await db.getFirstAsync<Utilisateur>(
        'SELECT id, nom, email, photo, date_creation FROM utilisateurs WHERE id = ?',
        [userId]
      );
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur', error);
      throw error;
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    // Ici, vous pourriez invalider le token côté serveur si nécessaire
    // Pour SQLite, il suffit de supprimer le token du stockage local
    try {
      // Supprimer le token du stockage sécurisé
      // await SecureStore.deleteItemAsync('userToken');
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
      throw error;
    }
  }
};


// Alias pour la rétrocompatibilité
export const createUtilisateur = utilisateurService.createUtilisateur;
export const getUtilisateur = utilisateurService.getUtilisateurById;
export const updateUtilisateur = utilisateurService.updateUtilisateur;
export const deleteUtilisateur = utilisateurService.deleteUtilisateur;
export const login = utilisateurService.login;
export const register = utilisateurService.createUtilisateur;
export const getCurrentUser = utilisateurService.getCurrentUser;
export const logout = utilisateurService.logout;
