const BASE_URL = '/api/v1';

/**
 * Standardized error parser
 */
const parseError = async (res) => {
  try {
    const data = await res.json();
    
    // Check for specific field validation errors (400 Bad Request)
    if (data.errors && data.errors.length > 0) {
      const { field, message } = data.errors[0];
      const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
      return new Error(`${formattedField}: ${message}`);
    }
    
    // Standard backend message
    if (data.message) {
      // Clean up common technical backend messages for users
      if (data.message.includes('Bad credentials')) {
        return new Error('Incorrect username or password. Please try again.');
      }
      return new Error(data.message);
    }
    
    return new Error(`Server error (${res.status})`);
  } catch (e) {
    return new Error('An unexpected error occurred. Please try again later.');
  }
};

/**
 * Core API Client
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Always include credentials to ensure cookies (leo_chat_jwt) are sent/received
    credentials: 'include', 
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw await parseError(response);
    }
    
    // Some endpoints (like logout) might return 204 No Content
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};
