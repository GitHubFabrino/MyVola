import { initDatabase } from "./database";
import {
  Depense,
  CreateDepensesDTO,
  UpdateDepensesDTO,
} from "./db/types/depenseType";

export const depenseService = {
  /**
   * Crée une nouvelle dépense
   */
  createDepense: async (data: CreateDepensesDTO): Promise<Depense> => {
    const db = await initDatabase();
    try {
      const now = new Date().toISOString();

      const result = await db.runAsync(
        `INSERT INTO depenses (
            categorie_id,
            utilisateur_id,
            famille_id,
            montant,
            date,
            description,
            statut,
            date_creation,
            date_modification
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.categorie_id,
          data.utilisateur_id,
          data.famille_id,
          data.montant,
          data.date,
          data.description || null,
          data.statut,
          now,
          now,
        ]
      );

      return {
        id: result.lastInsertRowId as number,
        categorie_id: data.categorie_id,
        utilisateur_id: data.utilisateur_id,
        famille_id: data.famille_id,
        montant: data.montant,
        date: data.date,
        description: data.description ?? null,
        statut: data.statut ?? "valide",
        date_creation: now,
        date_modification: now,
      };
      
    } catch (error) {
      console.error("Erreur lors de la création de la dépense", error);
      throw new Error("Impossible de créer cette dépense");
    }
  },

  /**
   * Récupère une dépense par son ID
   */
  getDepenseById: async (id: number): Promise<Depense | null> => {
    if (!id) return null;
    const db = await initDatabase();
    return await db.getFirstAsync<Depense>(
      "SELECT * FROM depenses WHERE id = ?",
      [id]
    );
  },

  /**
   * Récupère toutes les dépenses d'une famille
   */
  getDepensesByFamille: async (
    familleId: number,
    filtreStatut?: string
  ): Promise<Depense[]> => {
    if (!familleId) return [];
    const db = await initDatabase();

    let query = `SELECT * FROM depenses WHERE famille_id = ?`;
    const params: any[] = [familleId];

    if (filtreStatut) {
      query += " AND statut = ?";
      params.push(filtreStatut);
    }

    query += " ORDER BY date DESC";

    return await db.getAllAsync<Depense>(query, params);
  },

    /**
   * Récupère toutes les dépenses d'une famille
   */
    getDepensesAll: async (): Promise<Depense[]> => {
     
      const db = await initDatabase();
  
      let query = `SELECT * FROM depenses `;
    
  
      query += " ORDER BY date DESC";
  
      return await db.getAllAsync<Depense>(query);
    },
  

  /**
   * Met à jour une dépense
   */
  updateDepense: async (
    id: number,
    data: UpdateDepensesDTO
  ): Promise<Depense | null> => {
    if (!id) return null;

    const db = await initDatabase();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.categorie_id !== undefined) {
      updates.push("categorie_id = ?");
      params.push(data.categorie_id);
    }
    if (data.utilisateur_id !== undefined) {
      updates.push("utilisateur_id = ?");
      params.push(data.utilisateur_id);
    }
    if (data.montant !== undefined) {
      updates.push("montant = ?");
      params.push(data.montant);
    }
    if (data.date !== undefined) {
      updates.push("date = ?");
      params.push(data.date);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.statut !== undefined) {
      updates.push("statut = ?");
      params.push(data.statut);
    }

    updates.push("date_modification = ?");
    params.push(new Date().toISOString());
    params.push(id);

    const query = `
      UPDATE depenses
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    await db.runAsync(query, params);
    return await depenseService.getDepenseById(id);
  },

  /**
   * Supprime une dépense
   */
  deleteDepense: async (id: number): Promise<boolean> => {
    const db = await initDatabase();
    const result = await db.runAsync("DELETE FROM depenses WHERE id = ?", [id]);
    return result.changes > 0;
  },
};

export const createDepense = depenseService.createDepense;
export const getDepense = depenseService.getDepenseById;
export const updateDepense = depenseService.updateDepense;
export const deleteDepense = depenseService.deleteDepense;
export const getDepensesAll = depenseService.getDepensesAll;
