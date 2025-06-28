import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../services/database';

// Définition des types
interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense' | 'all';
  category?: string;
}

interface TransactionsState {
  items: Transaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: TransactionFilters;
}

// État initial
const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
  filters: {
    startDate: '',
    endDate: '',
    type: 'all',
    category: '',
  }
};

// Actions asynchrones (simplifiées pour l'exemple)
// Dans une application réelle, vous pourriez utiliser createAsyncThunk
// mais pour simplifier, nous allons utiliser des actions synchrones pour l'instant

// Slice
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Ajouter une transaction
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.unshift(action.payload);
    },
    
    // Mettre à jour une transaction
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    
    // Supprimer une transaction
    deleteTransaction: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(transaction => transaction.id !== action.payload);
    },
    
    // Mettre à jour les filtres
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Réinitialiser les filtres
    resetFilters: (state) => {
      state.filters = {
        startDate: '',
        endDate: '',
        type: 'all',
        category: '',
      };
    },
    
    // Réinitialiser l'état d'erreur
    clearError: (state) => {
      state.error = null;
    }
  },
});

// Export des actions
export const { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  setFilters, 
  resetFilters, 
  clearError 
} = transactionsSlice.actions;

// Export des sélecteurs
const selectTransactionsState = (state: { transactions: TransactionsState }) => state.transactions;

export const selectAllTransactions = (state: { transactions: TransactionsState }) => 
  selectTransactionsState(state).items;

export const selectTransactionsFilters = (state: { transactions: TransactionsState }) => 
  selectTransactionsState(state).filters;

// Sélecteur pour les transactions filtrées
export const selectFilteredTransactions = (state: { transactions: TransactionsState }) => {
  const { items, filters } = selectTransactionsState(state);
  
  return items.filter(transaction => {
    // Filtre par date de début
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }
    
    // Filtre par date de fin
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }
    
    // Filtre par catégorie
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }
    
    return true;
  });
};

export default transactionsSlice.reducer;