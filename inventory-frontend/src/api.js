// src/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const MEDIA_BASE_URL = process.env.REACT_APP_MEDIA_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login and Token Refresh Functions
export const login = async (data) => {
  const response = await api.post('token/', data);
  const userId = response.data.user_id;
  localStorage.setItem('userId', userId);
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  api.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
  return response;
};

export const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  const response = await api.post('token/refresh/', { refresh: refresh_token });
  localStorage.setItem('access_token', response.data.access);
  api.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
  return response;
};

// Registration Function
export const register = async (data) => {
  const response = await api.post('register/', data);
  return response;
};

// Logout Function
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete api.defaults.headers['Authorization'];
};

// Helper to attach authorization header to requests
api.interceptors.request.use(
  async (config) => {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      config.headers['Authorization'] = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically refresh token on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401 && localStorage.getItem('refresh_token')) {
      try {
        await refreshToken();
        return api(error.config);
      } catch (refreshError) {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export const addTransaction = async (data) => {
    try {
        const response = await api.post('transactions/', data);
        return response;
    } catch (error) {
        // Log and rethrow the error to ensure the frontend catches it
        if (error.response && error.response.data) {
            console.error("API error response:", error.response.data); // Log error for debugging
            throw error;  // Re-throwing the error so it propagates to the frontend
        }
        throw new Error("An unknown error occurred");
    }
};

export const updateProfile = (userId, formData) => {
  // Create a fresh Axios instance for this request to avoid inherited settings
  return axios.put(`/api/profile/${userId}/update/`, formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Optional: Add token if needed
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const changePassword = (currentPassword, newPassword) => {
  return api.post('/profile/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  });
};

export const fetchTransactions = () => {
    return api.get('transactions/');
};

export const deleteTransaction = (transactionId) => {
    return api.delete(`transactions/${transactionId}/`);
};

export const fetchFilteredTransactions = (productId) => {
    return api.get('transactions/', {
        params: { product_id: productId },
    });
};

export const fetchDashboardData = () => api.get('dashboard/');
export const fetchProfile = () => api.get('profile/');
export const fetchStockItems = () => api.get('stock/');
export const addStockItem = (data) => api.post('stock/', data);
export const updateStockItem = (itemId, data) => api.put(`stock/${itemId}/`, data);
export const deleteStockItem = (itemId) => api.delete(`stock/${itemId}/`);
export const fetchProducts = () => api.get('products/');
export const addProduct = (data) => api.post('products/', data);
export const updateProduct = (productId, data) => api.put(`products/${productId}/`, data);
export const deleteProduct = (productId) => api.delete(`products/${productId}/`);
export const addIngredient = (data) => api.post('ingredients/', data);
export const deleteIngredient = (ingredientId) => api.delete(`ingredients/${ingredientId}/`);
