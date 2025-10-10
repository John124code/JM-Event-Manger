// API configuration for connecting to backend
// Use production URL if deployed, otherwise use localhost for development
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction 
  ? 'https://jm-event-manger.onrender.com/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Debug logging
console.log('🌐 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🏠 Hostname:', window.location.hostname);
console.log('🛠️  API Configuration Loaded Successfully!');

// API endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
  TEST_DB: `${API_BASE_URL}/test-db`,
  
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },

  // User endpoints
  USERS: {
    FAVORITES: `${API_BASE_URL}/users/favorites`,
    ADD_FAVORITE: `${API_BASE_URL}/users/favorites`,
    REMOVE_FAVORITE: (eventId: string) => `${API_BASE_URL}/users/favorites/${eventId}`,
    UPLOAD_AVATAR: `${API_BASE_URL}/users/avatar`,
    FOLLOWERS: `${API_BASE_URL}/users/followers`,
    FOLLOWING: `${API_BASE_URL}/users/following`,
    STATS: `${API_BASE_URL}/users/stats`,
  },
  
  // Event endpoints
  EVENTS: {
    ALL: `${API_BASE_URL}/events`,
    LIST: `${API_BASE_URL}/events`,
    CREATE: `${API_BASE_URL}/events`,
    BY_ID: (id: string) => `${API_BASE_URL}/events/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/events/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/events/${id}`,
    FEATURED: `${API_BASE_URL}/events/featured`,
    MY_EVENTS: `${API_BASE_URL}/events/user/my-events`,
    ANALYTICS: (id: string) => `${API_BASE_URL}/events/${id}/analytics`,
    RATING: (id: string) => `${API_BASE_URL}/events/${id}/rating`,
  },
  
  // Registration endpoints
  REGISTRATIONS: {
    REGISTER: `${API_BASE_URL}/registrations`,
    MY_REGISTRATIONS: `${API_BASE_URL}/registrations/my-registrations`,
    EVENT_REGISTRATIONS: (eventId: string) => `${API_BASE_URL}/registrations/event/${eventId}`,
    UPDATE_PAYMENT: (id: string) => `${API_BASE_URL}/registrations/${id}/payment-status`,
    CANCEL: (id: string) => `${API_BASE_URL}/registrations/${id}`,
    CHECK: (eventId: string) => `${API_BASE_URL}/registrations/check/${eventId}`,
  },
  
  // Upload endpoints
  UPLOAD: {
    SINGLE: `${API_BASE_URL}/upload`,
    MULTIPLE: `${API_BASE_URL}/upload/multiple`,
    DELETE: (publicId: string) => `${API_BASE_URL}/upload/${publicId}`,
  }
};

// API helper functions
export const api = {
  // GET request
  get: async (url: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    
    return response.json();
  },
  
  // POST request
  post: async (url: string, data?: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  },
  
  // PUT request
  put: async (url: string, data?: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  },
  
  // DELETE request
  delete: async (url: string, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
    
    return response.json();
  },

  // Upload file
  upload: async (url: string, formData: FormData, token?: string) => {
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    
    return response.json();
  },
  
  // Test backend connection
  testConnection: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
      return await response.json();
    } catch (error) {
      console.error('Backend connection failed:', error);
      return { status: 'error', message: 'Cannot connect to backend' };
    }
  },
  
  // Test database connection
  testDatabase: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.TEST_DB);
      return await response.json();
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { status: 'error', message: 'Cannot test database connection' };
    }
  }
};

export default api;
