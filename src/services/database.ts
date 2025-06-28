// services/database.ts
import * as SQLite from 'expo-sqlite';

// Type pour une transaction
export interface Transaction {
  id?: number;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: string;
  notes?: string;
}

let db: SQLite.SQLiteDatabase;

// Initialisation de la base de données
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('myAppDB');
    
    // Liste des tables à créer
    const tables = [
      'utilisateurs',
      'familles',
      'membres_famille',
      'comptes',
      'categories',
      'transactions',
      'budgets',
      'objectifs_epargne',
      'factures',
      'dettes',
      'investissements',
      'notifications'
    ];

    try {
      // Activer le mode WAL pour de meilleures performances
      await db.execAsync('PRAGMA journal_mode = WAL;');
      console.log('✅ Mode journal WAL activé');

      // Vérifier l'état actuel des tables
      console.log('\n🔍 Vérification des tables existantes...');
      const existingTables = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      
      const existingTableNames = existingTables.map(t => t.name);
      console.log('📋 Tables existantes:', existingTableNames.join(', ') || 'Aucune');

      // Exécuter le script de création des tables
      console.log('\n🛠️  Début de la création des tables...');
      await db.execAsync(`
        /* Table utilisateurs */
        CREATE TABLE IF NOT EXISTS utilisateurs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mot_de_passe TEXT NOT NULL,
            photo TEXT,
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        /* Table familles */
        CREATE TABLE IF NOT EXISTS familles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP
        );

        /* Table membres_famille */
        CREATE TABLE IF NOT EXISTS membres_famille (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur_id INTEGER NOT NULL,
            famille_id INTEGER NOT NULL,
            role TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('admin', 'membre')),
            date_ajout TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE,
            UNIQUE(utilisateur_id, famille_id)
        );

        /* Table parametres */
        CREATE TABLE IF NOT EXISTS parametres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur_id INTEGER NOT NULL,
            cle TEXT NOT NULL,
            valeur TEXT NOT NULL,
            date_modification TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE,
            UNIQUE(utilisateur_id, cle)
        );

        /* Table comptes */
        CREATE TABLE IF NOT EXISTS comptes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            nom TEXT NOT NULL,
            solde REAL DEFAULT 0,
            type TEXT NOT NULL CHECK (type IN ('compte_courant', 'epargne', 'especes', 'carte_credit', 'autre')),
            devise TEXT DEFAULT 'MGA',
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Table categories */
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            nom TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('revenu', 'depense', 'transfert')),
            icone TEXT,
            couleur TEXT,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Table transactions */
        DROP TABLE IF EXISTS transactions;
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            compte_id INTEGER NOT NULL,
            categorie_id INTEGER,
            utilisateur_id INTEGER NOT NULL,
            montant REAL NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL CHECK (type IN ('revenu', 'depense', 'transfert')),
            statut TEXT DEFAULT 'valide' CHECK (statut IN ('valide', 'en_attente', 'annule')),
            FOREIGN KEY (compte_id) REFERENCES comptes (id) ON DELETE CASCADE,
            FOREIGN KEY (categorie_id) REFERENCES categories (id) ON DELETE SET NULL,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE
        );

        /* Table budgets */
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            categorie_id INTEGER,
            montant REAL NOT NULL,
            mois INTEGER NOT NULL,
            annee INTEGER NOT NULL,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE,
            FOREIGN KEY (categorie_id) REFERENCES categories (id) ON DELETE CASCADE,
            UNIQUE(famille_id, categorie_id, mois, annee)
        );

        /* Table objectifs_epargne */
        CREATE TABLE IF NOT EXISTS objectifs_epargne (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            nom TEXT NOT NULL,
            montant_cible REAL NOT NULL,
            montant_actuel REAL DEFAULT 0,
            date_objectif TEXT NOT NULL,
            description TEXT,
            statut TEXT DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'atteint', 'abandonne')),
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Table factures */
        CREATE TABLE IF NOT EXISTS factures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            categorie_id INTEGER,
            montant REAL NOT NULL,
            date_echeance TEXT NOT NULL,
            frequence TEXT DEFAULT 'mensuel' CHECK (frequence IN ('unique', 'quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel')),
            statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('paye', 'en_attente', 'en_retard')),
            description TEXT,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE,
            FOREIGN KEY (categorie_id) REFERENCES categories (id) ON DELETE SET NULL
        );

        /* Table dettes */
        CREATE TABLE IF NOT EXISTS dettes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            creancier TEXT NOT NULL,
            montant_initial REAL NOT NULL,
            montant_actuel REAL NOT NULL,
            taux_interet REAL DEFAULT 0,
            date_debut TEXT NOT NULL,
            date_echeance TEXT,
            statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'rembourse', 'en_retard')),
            description TEXT,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Table investissements */
        CREATE TABLE IF NOT EXISTS investissements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            famille_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('actions', 'obligations', 'crypto', 'immobilier', 'autre')),
            nom TEXT NOT NULL,
            montant_investi REAL NOT NULL,
            valeur_actuelle REAL NOT NULL,
            date_achat TEXT NOT NULL,
            date_vente TEXT,
            rendement REAL DEFAULT 0,
            description TEXT,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Table notifications */
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('alerte_budget', 'rappel_facture', 'depense_inhabituelle', 'objectif_atteint', 'autre')),
            titre TEXT NOT NULL,
            message TEXT NOT NULL,
            lue BOOLEAN DEFAULT 0,
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE
        );
      `);

      // Vérification finale des tables créées
      const finalTables = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      
      console.log('\n✅ Base de données initialisée avec succès');
      console.log('📊 Tables disponibles dans la base de données:');
      finalTables
        .filter(t => !t.name.startsWith('sqlite_'))
        .forEach(t => console.log(`   • ${t.name}`));
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }
  return db;
};

// Service de gestion des transactions
export const transactionService = {
  // Récupérer toutes les transactions
  getAllTransactions: async (): Promise<Transaction[]> => {
    const db = await initDatabase();
    try {
      return await db.getAllAsync('SELECT * FROM transactions ORDER BY date DESC');
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions', error);
      return [];
    }
  },

  // Récupérer une transaction par son ID
  getTransaction: async (id: number): Promise<Transaction | null> => {
    const db = await initDatabase();
    try {
      return await db.getFirstAsync('SELECT * FROM transactions WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction', error);
      return null;
    }
  },

  // Ajouter une nouvelle transaction
  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO transactions (title, amount, date, type, category, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [
          transaction.title,
          transaction.amount,
          transaction.date,
          transaction.type,
          transaction.category || null,
          transaction.notes || null,
        ]
      );
      return { ...transaction, id: result.lastInsertRowId as number };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction', error);
      throw error;
    }
  },

  // Mettre à jour une transaction existante
  updateTransaction: async (transaction: Transaction): Promise<boolean> => {
    if (!transaction.id) return false;
    
    const db = await initDatabase();
    try {
      const result = await db.runAsync(
        `UPDATE transactions 
         SET title = ?, amount = ?, date = ?, type = ?, category = ?, notes = ?
         WHERE id = ?`,
        [
          transaction.title,
          transaction.amount,
          transaction.date,
          transaction.type,
          transaction.category || null,
          transaction.notes || null,
          transaction.id
        ]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction', error);
      return false;
    }
  },

  // Supprimer une transaction
  deleteTransaction: async (id: number): Promise<boolean> => {
    const db = await initDatabase();
    try {
      const result = await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction', error);
      return false;
    }
  },

  // Supprimer toutes les transactions (pour les tests)
  deleteAllTransactions: async (): Promise<boolean> => {
    const db = await initDatabase();
    try {
      await db.runAsync('DELETE FROM transactions');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les transactions', error);
      return false;
    }
  }
};

// Alias pour la rétrocompatibilité (à supprimer après mise à jour du code existant)
export const addItem = transactionService.addTransaction;
export const getAllItems = transactionService.getAllTransactions;
export const getItem = transactionService.getTransaction;
export const updateItem = transactionService.updateTransaction;
export const deleteItem = transactionService.deleteTransaction;