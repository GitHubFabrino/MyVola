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
      'notifications',
      'revenus'
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
        
        /* Table familles unifiée (fusion avec membres_famille) */
        DROP TABLE IF EXISTS familles;
        CREATE TABLE IF NOT EXISTS familles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            utilisateur_id INTEGER NOT NULL,
            role TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('admin', 'membre')),
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
            date_ajout TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE,
            UNIQUE(nom, utilisateur_id)
        );

        /* Suppression de l'ancienne table membres_famille */
        DROP TABLE IF EXISTS membres_famille;

       

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

        /* Table depenses */
        DROP TABLE IF EXISTS depenses;
        CREATE TABLE IF NOT EXISTS depenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categorie_id INTEGER NOT NULL,
            utilisateur_id INTEGER NOT NULL,
            famille_id INTEGER NOT NULL,
            montant REAL NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            statut TEXT DEFAULT 'valide' CHECK (statut IN ('valide', 'en_attente', 'annule', 'rembourse')),
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
            date_modification TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categorie_id) REFERENCES categories (id) ON DELETE RESTRICT,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE RESTRICT,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Trigger pour mettre à jour la date de modification */
        CREATE TRIGGER IF NOT EXISTS update_depense_date
        AFTER UPDATE ON depenses
        BEGIN
            UPDATE depenses SET date_modification = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

       /* Table budgets */
        
       CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          famille_id INTEGER NOT NULL,
          categorie_id INTEGER,
          montant REAL NOT NULL,
          mois INTEGER NOT NULL,
          type TEXT NULL,
          annee INTEGER NOT NULL,
          utilisateur_id INTEGER,
          -- Champ calculé pour la contrainte UNIQUE

            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE,
            FOREIGN KEY (categorie_id) REFERENCES categories (id) ON DELETE CASCADE,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE SET NULL,
            UNIQUE(famille_id, categorie_id, mois, annee, COALESCE(utilisateur_id, 0))
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
            type TEXT NOT NULL CHECK (type IN ('alerte_budget', 'rappel_facture', 'depense_inhabituelle', 'objectif_atteint', 'revenu', 'autre')),
            titre TEXT NOT NULL,
            message TEXT NOT NULL,
            lue BOOLEAN DEFAULT 0,
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE CASCADE
        );

        /* Table revenus */
        CREATE TABLE IF NOT EXISTS revenus (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER NOT NULL,
            categorie_id INTEGER NOT NULL,
            utilisateur_id INTEGER NOT NULL,
            compte_id INTEGER NOT NULL,
            famille_id INTEGER NOT NULL,
            montant REAL NOT NULL,
            date TEXT NOT NULL,
            source TEXT NOT NULL,
            description TEXT,
            statut TEXT DEFAULT 'valide' CHECK (statut IN ('valide', 'en_attente', 'annule')),
            date_creation TEXT DEFAULT CURRENT_TIMESTAMP,
            date_modification TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
            FOREIGN KEY (categorie_id) REFERENCES categories (id) ON DELETE RESTRICT,
            FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs (id) ON DELETE RESTRICT,
            FOREIGN KEY (compte_id) REFERENCES comptes (id) ON DELETE RESTRICT,
            FOREIGN KEY (famille_id) REFERENCES familles (id) ON DELETE CASCADE
        );

        /* Trigger pour mettre à jour la date de modification des revenus */
        CREATE TRIGGER IF NOT EXISTS update_revenu_date
        AFTER UPDATE ON revenus
        BEGIN
            UPDATE revenus SET date_modification = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
      `);

      // Vérification finale des tables créées
      const finalTables = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );

      console.log('\n✅ Base de données initialisée avec succès');
      console.log('📊 Tables disponibles dans la base de données:');

      for (const table of finalTables.filter(t => !t.name.startsWith('sqlite_'))) {
        console.log(`\n   • ${table.name}:`);
        try {
          const columns = await db.getAllAsync<{ name: string, type: string, notnull: number, dflt_value: any, pk: number }>(
            `PRAGMA table_info(${table.name})`
          );
          columns.forEach(col => {
            const pk = col.pk ? ' (PK)' : '';
            const notNull = col.notnull ? ' NOT NULL' : '';
            const defaultValue = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
            console.log(`     - ${col.name} (${col.type}${notNull}${defaultValue})${pk}`);
          });
        } catch (error) {
          console.error(`     Erreur lors de la récupération des colonnes pour ${table.name}:`, error);
        }
      }
      console.log('✅ Base de données initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }
  return db;
};
