import { createSlice } from '@reduxjs/toolkit';

// Helper to get initial state from localStorage
const getInitialState = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return {
            user: user || null,
            isAuthenticated: !!user
        };
    } catch {
        return { user: null, isAuthenticated: false };
    }
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
          localStorage.removeItem('user');
      }
    }
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;