import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CreateFamilleDTO, Famille } from '~/services/db/types/familleType';
import { familleService } from '~/services/famille.service';
import { membreService } from '~/services/membre.service';



// Types
interface FamilleState {
  familles: Famille[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// État initial
const initialState: FamilleState = {
  familles: [],
  status: 'idle',
  error: null,
};


export const fetchFamilies = createAsyncThunk(
  'famille/fetchFamilies',
  async () => {
    try {
      const familles = await familleService.getAllFamilles();
      
      // Utiliser Promise.all pour attendre que toutes les requêtes asynchrones soient terminées
      const famillesWithDetails = await Promise.all(
        familles.map(async (famille) => {
          const familleWithDetails = { ...famille };
          
          try {
            // Récupérer les détails de la famille
            // if (famille.id) {
            //   const membre = await membreService.getAllMembres(famille.id);
            //   familleWithDetails.membres = membre || [];
            // }

            // console.log('Famille avec détails======>123:', familleWithDetails.membres);
            return familleWithDetails;
          } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            return familleWithDetails;
          }
        })
      );

      console.log('Familles chargées avec succès======>:', famillesWithDetails);
      return famillesWithDetails;
    } catch (error) {
      console.error('Erreur lors du chargement des familles:', error);
      throw error; // Propage l'erreur pour qu'elle soit gérée par le reducer
    }
  }
);

export const addFamilleNew = createAsyncThunk(
  'famille/addFamille',
  async (famille: CreateFamilleDTO, { rejectWithValue }) => {
    try {
      const newFamille = await familleService.createFamille(famille);
      console.log('Nouvelle famille slice :', newFamille);
      return newFamille;
    } catch (error) {
      console.log('Erreur lors de la création de la famille:', error);
      return rejectWithValue('Erreur lors de la création de la famille');
    }
  }
);

// Slice
const familleSlice = createSlice({
  name: 'famille',
  initialState,
  reducers: {
    // Vos reducers synchrones ici
  },
  extraReducers: (builder) => {
    builder
      // Gestion de fetchFamilies
      .addCase(fetchFamilies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFamilies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.familles = action.payload;
      })
      .addCase(fetchFamilies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Erreur inconnue';
      })
      // Gestion de addFamilleNew
      .addCase(addFamilleNew.fulfilled, (state, action) => {
        // Ajouter le nouveau budget à la liste
        state.familles.push(action.payload);
      });
  },
});

// Export des sélecteurs
export const selectFamilleState = (state: { famille: FamilleState }) => state.famille;

export const selectAllFamilles = (state: { famille: FamilleState }) =>
  selectFamilleState(state).familles;

export default familleSlice.reducer;
