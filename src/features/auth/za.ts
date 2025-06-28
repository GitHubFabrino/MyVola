// import { createSlice } from '@reduxjs/toolkit';
// import { AuthState } from './types';
// import { login, register, fetchCurrentUser } from './authThunks';

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   refreshToken: null,
//   status: 'idle',
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.refreshToken = null;
//       state.status = 'idle';
//       state.error = null;
//       // Ici, vous pouvez aussi nettoyer le stockage local si nécessaire
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//   },

// });

// export const { logout, clearError } = authSlice.actions;
// export default authSlice.reducer;