import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Categorie, CreateCategorieDTO } from '../../services/db/types/categorieType';
import { categorieService } from '../../services/categorie.service';

// Types
interface CategorieState {
  categories: Categorie[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// État initial
const initialState: CategorieState = {
  categories: [],
  status: 'idle',
  error: null,
};

export const addCategorieNew = createAsyncThunk(
  'categorie/addCategorie',
  async (categorie: CreateCategorieDTO, { rejectWithValue }) => {
    try {
      const newCategorie = await categorieService.createCategorie(categorie);
      return newCategorie;
    } catch (error) {
      return rejectWithValue('Erreur lors de la création de la catégorie');
    }
  }
);

// Slice
const categorieSlice = createSlice({
  name: 'categorie',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addCategorieNew.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCategorieNew.fulfilled, (state, action: PayloadAction<Categorie>) => {
        state.status = 'succeeded';
        state.categories.push(action.payload);
      })
      .addCase(addCategorieNew.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export des sélecteurs
export const selectCategorieState = (state: { categorie: CategorieState }) => state.categorie;

export const selectAllCategories = (state: { categorie: CategorieState }) =>
  selectCategorieState(state).categories;

export default categorieSlice.reducer;
