import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  csrfToken: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; csrfToken?: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.csrfToken = action.payload.csrfToken ?? null;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.csrfToken = null;
      state.isAuthenticated = false;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
