import { create } from 'zustand'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(userData);
      toast.success('Account created successfully! Please log in.');
      set({ isLoading: false });
      return true;
    } catch (error) {
      toast.error(error.message);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(credentials);
      toast.success(`Welcome back, ${data?.displayName || credentials.username}!`);
      set({ user: data, isLoading: false });
      return true;
    } catch (error) {
      toast.error(error.message);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    toast.success('You have been securely logged out.');
    set({ user: null });
  },
  
  clearError: () => set({ error: null })
}));
