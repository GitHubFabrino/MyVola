import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from './auth/authSlice';
import transactionsReducer from '../features/transactions/slice';
import categorieReducer from './categorie/categorieSlice';
import budgetReducer from './budget/budgetSlice';
import familleReducer from './famille/familleSlice';

// Configuration de la persistance pour l'authentification
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'user'],
};

// Configuration de la persistance pour les transactions
const transactionsPersistConfig = {
  key: 'transactions',
  storage: AsyncStorage,
  whitelist: ['transactions'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  transactions: persistReducer(transactionsPersistConfig, transactionsReducer),
  categorie: categorieReducer,
  budget: budgetReducer,
  famille: familleReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;