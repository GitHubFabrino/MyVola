import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CreateDepensesDTO, Depense } from '~/services/db/types/depenseType';
import { depenseService } from '~/services/depense.service';
import { categorieService } from '~/services/categorie.service';
import { utilisateurService } from '~/services/utilisateur.service';
import { familleService } from '~/services/famille.service';

// Type enrichi avec les noms associés
export type DepenseWithDetails = Depense & {
  categorie_nom?: string | null;
  utilisateur_nom?: string | null;
  famille_nom?: string | null;
};

// État Redux pour les dépenses
interface DepenseState {
  depenses: DepenseWithDetails[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// État initial
const initialState: DepenseState = {
  depenses: [],
  status: 'idle',
  error: null,
};

// ✅ Action asynchrone pour charger les dépenses enrichies
export const fetchDepenses = createAsyncThunk<DepenseWithDetails[]>(
  'depense/fetchDepenses',
  async () => {
    try {
      const depenses = await depenseService.getDepensesAll();

      const depensesWithDetails = await Promise.all(
        depenses.map(async (depense) => {
          const detailedDepense: DepenseWithDetails = { ...depense };

          try {
            if (depense.categorie_id) {
              const categorie = await categorieService.getCategorieById(depense.categorie_id);
              detailedDepense.categorie_nom = categorie?.nom ?? null;
            }

            if (depense.utilisateur_id) {
              const utilisateur = await utilisateurService.getUtilisateurById(depense.utilisateur_id);
              detailedDepense.utilisateur_nom = utilisateur?.nom ?? null;
            }

            if (depense.famille_id) {
              const famille = await familleService.getFamilleById(depense.famille_id);
              detailedDepense.famille_nom = famille?.nom ?? null;
            }

            return detailedDepense;
          } catch (detailError) {
            console.error('Erreur lors de la récupération des détails de la dépense:', detailError);
            return detailedDepense;
          }
        })
      );

      return depensesWithDetails;
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
      throw error;
    }
  }
);

// ✅ Action pour ajouter une dépense
export const addDepenseNew = createAsyncThunk<DepenseWithDetails, CreateDepensesDTO>(
    'depense/addDepense',
    async (depense, { rejectWithValue }) => {
      try {
        const newDepense = await depenseService.createDepense(depense);
  
        // Construction du résultat enrichi
        const enrichedDepense: DepenseWithDetails = { ...newDepense };
  
        if (newDepense.categorie_id) {
          const categorie = await categorieService.getCategorieById(newDepense.categorie_id);
          enrichedDepense.categorie_nom = categorie?.nom ?? null;
        }
  
        if (newDepense.utilisateur_id) {
          const utilisateur = await utilisateurService.getUtilisateurById(newDepense.utilisateur_id);
          enrichedDepense.utilisateur_nom = utilisateur?.nom ?? null;
        }
  
        if (newDepense.famille_id) {
          const famille = await familleService.getFamilleById(newDepense.famille_id);
          enrichedDepense.famille_nom = famille?.nom ?? null;
        }
  
        return enrichedDepense;
      } catch (error) {
        console.error('Erreur lors de la création de la dépense:', error);
        return rejectWithValue('Erreur lors de la création de la dépense');
      }
    }
  );
  

// ✅ Slice
const depenseSlice = createSlice({
  name: 'depense',
  initialState,
  reducers: {
    // Place pour des reducers synchrones si besoin
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDepenses.fulfilled, (state, action: PayloadAction<DepenseWithDetails[]>) => {
        state.status = 'succeeded';
        state.depenses = action.payload;
      })
      .addCase(fetchDepenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur inconnue';
      })
      .addCase(addDepenseNew.fulfilled, (state, action: PayloadAction<DepenseWithDetails>) => {
        state.depenses.push(action.payload);
      });
  },
});

// ✅ Selecteurs

// Export des sélecteurs
export const selectDepensesState = (state: { depense: DepenseState }) => state.depense;

export const selectAllDepense = (state: { depense: DepenseState }) =>
    selectDepensesState(state).depenses;

export default depenseSlice.reducer;
