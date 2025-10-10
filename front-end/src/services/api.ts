// API Service for backend communication
// Import the dynamic API configuration
function getApiBaseUrl() {
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const url = isProduction 
    ? 'https://jm-event-manger.onrender.com/api' 
    : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
  
  console.log('🔧 API Service initialized with URL:', url);
  console.log('🌐 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
  console.log('🏠 Hostname:', window.location.hostname);
  
  return url;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    // Get token from localStorage if available
    this.token = localStorage.getItem('authToken');
  }

  // Set authorization token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authorization token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Generic API call method with retry logic
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = 2
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        
        console.log(`📡 API Response: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ API Success:', data);
        return data;
      } catch (error: any) {
        console.error(`🚨 API request failed (attempt ${attempt + 1}):`, error);
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        token: string;
        user: any;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      token: response.data?.token,
      user: response.data?.user
    };
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        token: string;
        user: any;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    if (response.success && response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      token: response.data?.token,
      user: response.data?.user
    };
  }

  async getMe() {
    const response = await this.request<{
      success: boolean;
      data: {
        user: any;
      };
    }>('/auth/me');
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      user: response.data?.user
    };
  }

  async updateProfile(updates: any) {
    return this.request<{
      success: boolean;
      user: any;
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.request<{
      success: boolean;
      avatarUrl: string;
      user?: any;
      data?: any;
    }>('/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    // Return in the format the frontend expects
    return {
      success: response.success,
      avatarUrl: response.avatarUrl,
      user: response.user,
      data: response.data
    };
  }

  async getUserProfile(userId: string) {
    return this.request<{
      success: boolean;
      user: any;
    }>(`/users/${userId}`);
  }

  async getUserStats(userId: string) {
    return this.request<{
      success: boolean;
      stats: any;
    }>(`/users/${userId}/stats`);
  }

  // Events APIs
  async getAllEvents() {
    const response = await this.request<{
      success: boolean;
      data: {
        events: any[];
        pagination?: any;
      };
    }>('/events');
    
    // Map MongoDB _id to id for frontend compatibility
    const mappedEvents = response.data?.events?.map(event => ({
      ...event,
      id: event._id || event.id,
      creator: {
        ...event.creator,
        id: event.creator?._id || event.creator?.id
      },
      // Add IDs to ticket types if they don't exist
      ticketTypes: event.ticketTypes?.map((ticket: any, index: number) => ({
        ...ticket,
        id: ticket.id || `ticket-${index}`
      })) || []
    })) || [];
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      events: mappedEvents,
      total: response.data?.pagination?.total || 0
    };
  }

  async getEventById(id: string) {
    const response = await this.request<{
      success: boolean;
      data: {
        event: any;
      };
    }>(`/events/${id}`);
    
    // Map MongoDB _id to id for frontend compatibility
    const mappedEvent = response.data?.event ? {
      ...response.data.event,
      id: response.data.event._id || response.data.event.id,
      creator: {
        ...response.data.event.creator,
        id: response.data.event.creator?._id || response.data.event.creator?.id
      },
      // Add IDs to ticket types if they don't exist
      ticketTypes: response.data.event.ticketTypes?.map((ticket: any, index: number) => ({
        ...ticket,
        id: ticket.id || `ticket-${index}`
      })) || []
    } : null;
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      event: mappedEvent
    };
  }

  async createEvent(eventData: any) {
    const response = await this.request<{
      success: boolean;
      data: {
        event: any;
      };
    }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      event: response.data?.event
    };
  }

  async updateEvent(id: string, eventData: any) {
    const response = await this.request<{
      success: boolean;
      data: {
        event: any;
      };
    }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    
    // Return in the format the frontend expects
    return {
      success: response.success,
      event: response.data?.event
    };
  }

  async deleteEvent(id: string) {
    return this.request<{
      success: boolean;
      message?: string;
    }>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserEvents() {
    return this.request<{
      success: boolean;
      events: any[];
    }>('/events/user/my-events');
  }

  async getFeaturedEvents() {
    return this.request<{
      success: boolean;
      events: any[];
    }>('/events/featured');
  }

  async addEventRating(eventId: string, rating: number, comment?: string) {
    return this.request<{
      success: boolean;
      rating: any;
    }>(`/events/${eventId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async getEventAnalytics(eventId: string) {
    return this.request<{
      success: boolean;
      analytics: any;
    }>(`/events/${eventId}/analytics`);
  }

  // Health check
  async healthCheck() {
    return this.request<{
      message: string;
      mongodb: string;
      environment: string;
    }>('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
