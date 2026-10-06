import { apiClient } from './apiClient';

export const authService = {
  register: (userData) => {
    return apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: (credentials) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: () => {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },

  forgotPassword: (email) => {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      credentials: 'omit' // Prevent sending expired JWTs that cause 403s
    });
  },

  resetPassword: (token, newPassword) => {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      credentials: 'omit'
    });
  }
};
