import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Categorie, CreateCategorieDTO } from '../../services/db/types/categorieType';
import { categorieService } from '../../services/categorie.service';

// Action pour charger les catégories
export const fetchCategories = createAsyncThunk(
  'categorie/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categorieService.getAllCategories();
      return categories;
    } catch (error) {
      return rejectWithValue('Erreur lors du chargement des catégories');
    }
  }
);

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
      // Gestion du chargement initial des catégories
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Categorie[]>) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Gestion de l'ajout d'une nouvelle catégorie
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
