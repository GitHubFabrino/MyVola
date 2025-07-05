import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {  CreateMembreFamilleDTO, MembreFamille } from '~/services/db/types/familleType';
import { membreService } from '~/services/membre.service';


// Types
interface MembreState {
  membres: MembreFamille[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// État initial
const initialState: MembreState = {
  membres: [],
  status: 'idle',
  error: null,
};



export const addMembreNew = createAsyncThunk(
  'membre/addMembre',
  async (membre: CreateMembreFamilleDTO, { rejectWithValue }) => {
    try {
      const newMembre = await membreService.ajouterMembre(membre);
      console.log('Nouveau membre slice ==>>>>>>>>>>>:', newMembre.nom);
      return newMembre;
    } catch (error) {
      console.log('Erreur lors de la création du membre:', error);
      return rejectWithValue('Erreur lors de la création du membre');
    }
  }
);

// Slice
const membreSlice = createSlice({
  name: 'membre',
  initialState,
  reducers: {
    // Vos reducers synchrones ici
  },
  extraReducers: (builder) => {
    builder
     
      // Gestion de addMembreNew
      .addCase(addMembreNew.fulfilled, (state, action) => {
        // Ajouter le nouveau budget à la liste
        state.membres.push(action.payload);
      });
  },
});

// Export des sélecteurs
export const selectMembreState = (state: { membre: MembreState }) => state.membre;

export const selectAllMembres = (state: { membre: MembreState }) =>
  selectMembreState(state).membres;

export default membreSlice.reducer;
