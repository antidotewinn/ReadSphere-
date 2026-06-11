import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data;
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true, user };
        } catch (err) {
          const error = err.response?.data?.message || 'Login failed';
          set({ error, isLoading: false });
          return { success: false, error, data: err.response?.data };
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', { name, email, password, role });
          set({ isLoading: false });
          return { success: true, userId: res.data.userId };
        } catch (err) {
          const error = err.response?.data?.message || 'Registration failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      verifyOtp: async (userId, otp) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/verify-otp', { userId, otp });
          const { user, accessToken, refreshToken } = res.data;
          set({ user, accessToken, refreshToken, isLoading: false });
          return { success: true, user };
        } catch (err) {
          const error = err.response?.data?.message || 'OTP verification failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch (_) {}
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const res = await api.post('/auth/refresh-token', { refreshToken });
          set({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken });
          return true;
        } catch (_) {
          set({ user: null, accessToken: null, refreshToken: null });
          return false;
        }
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user });
        } catch (_) {}
      },
    }),
    {
      name: 'readsphere-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
