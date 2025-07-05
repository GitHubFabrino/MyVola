import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Budget, CreateBudgetDTO } from '../../services/db/types/budgetType';
import { budgetService, getAllBudgets } from '~/services/budget.service';
import { familleService } from '~/services/famille.service';
import { categorieService } from '~/services/categorie.service';
import { utilisateurService } from '~/services/utilisateur.service';


// Types
interface BudgetState {
  budgets: Budget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// État initial
const initialState: BudgetState = {
  budgets: [],
  status: 'idle',
  error: null,
};

// Budget {
//   id: number;
//   categorie_id: number | null;
//   montant: number;
//   mois: number;
//   annee: number;
//   categorie_nom?: string;
//   categorie_type?: string;
//   famille_nom?: string;
//   depense_actuelle?: number;
//   depenseur_nom?: string;
//   depenseur_id?: number;
//   famille_id?: number;
// }
export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async () => {
    try {
      const budgets = await budgetService.getAllBudgets();
      
      // Utiliser Promise.all pour attendre que toutes les requêtes asynchrones soient terminées
      const budgetsWithDetails = await Promise.all(
        budgets.map(async (budget) => {
          const budgetWithDetails = { ...budget };
          
          try {
            // Récupérer les détails de la famille
            if (budget.famille_id) {
              const famille = await familleService.getFamilleById(budget.famille_id);
              budgetWithDetails.famille_nom = famille?.nom ?? 'Famille inconnue';
            }

            // Récupérer les détails de la catégorie
            if (budget.categorie_id) {
              const categorie = await categorieService.getCategorieById(budget.categorie_id);
              budgetWithDetails.categorie_nom = categorie?.nom ?? 'Catégorie inconnue';
              budgetWithDetails.categorie_type = categorie?.type ?? 'depense'; // Valeur par défaut
            }

            if (budget.utilisateur_id) {
              const utilisateur = await utilisateurService.getUtilisateurById(budget.utilisateur_id);
              budgetWithDetails.utilisateur_nom = utilisateur?.nom ?? 'Utilisateur inconnu';
            }

            return budgetWithDetails;
          } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            return budgetWithDetails;
          }
        })
      );

      console.log('Budgets chargés avec succès======>:', budgetsWithDetails);
      return budgetsWithDetails;
    } catch (error) {
      console.error('Erreur lors du chargement des budgets:', error);
      throw error; // Propage l'erreur pour qu'elle soit gérée par le reducer
    }
  }
);

export const addBudgetNew = createAsyncThunk(
  'budget/addBudget',
  async (budget: CreateBudgetDTO, { rejectWithValue }) => {
    try {
      const newBudget = await budgetService.createBudget(budget);
      console.log('Nouveau budget slice:', newBudget);
      return newBudget;
    } catch (error) {
      console.log('Erreur lors de la création de la catégorie:', error);
      return rejectWithValue('Erreur lors de la création de la catégorie');
    }
  }
);

// Slice
const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    // Vos reducers synchrones ici
  },
  extraReducers: (builder) => {
    builder
      // Gestion de fetchBudgets
      .addCase(fetchBudgets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur inconnue';
      })
      // Gestion de addBudgetNew
      .addCase(addBudgetNew.fulfilled, (state, action) => {
        // Ajouter le nouveau budget à la liste
        state.budgets.push(action.payload);
      });
  },
});

// Export des sélecteurs
export const selectBudgetState = (state: { budget: BudgetState }) => state.budget;

export const selectAllBudgets = (state: { budget: BudgetState }) =>
  selectBudgetState(state).budgets;

export default budgetSlice.reducer;
