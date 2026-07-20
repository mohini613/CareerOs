import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      // Basic JWT decoding to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp < Date.now() / 1000;
      
      if (isExpired) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      return true;
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  },
};
