import { create } from 'zustand'
import toast from 'react-hot-toast'

const API_URL = '/api/v1/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // If the backend returns a list of specific field validation errors, use the first one
        let msg = errorData.message || 'Failed to register. Please check your inputs.';
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          msg = `${firstError.field}: ${firstError.message}`;
        }
        
        toast.error(msg);
        throw new Error(msg);
      }

      toast.success('Account created successfully!');
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || 'Invalid credentials';
        toast.error(msg);
        throw new Error(msg);
      }

      const data = await res.json();
      toast.success('Logged in successfully!');
      set({ user: data, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // Ignored
    }
    toast.success('Logged out');
    set({ user: null });
  },
  
  clearError: () => set({ error: null })
}));
