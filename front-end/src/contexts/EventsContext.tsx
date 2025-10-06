import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  date: string;
  time: string;
  location: string;
  capacity: number;
  booked: number;
  image?: string;
  category: string;
  createdAt: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    fileName: string;
  } | null;
  ticketTypes?: TicketType[];
  paymentMethods?: PaymentMethod[];
  status?: 'active' | 'cancelled' | 'completed';
  views?: number;
  ratings?: EventRating[];
}

export interface TicketType {
  sold: number;
  id: string;
  name: string;
  price: number;
  description?: string;
  available: number;
}

export interface PaymentMethod {
  type: 'bank_transfer' | 'cash_app' | 'paypal';
  details: {
    bankName?: string;
    accountNumber?: string;
    username?: string;
    email?: string;
  };
}

export interface EventRating {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  ticketType: string;
  paymentStatus: "paid" | "pending" | "refunded";
  paymentMethod?: string;
}

interface EventsContextType {
  allEvents: Event[];
  featuredEvents: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<Event>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  cancelEvent: (eventId: string) => Promise<void>;
  registerForEvent: (eventId: string, userData: Partial<RegisteredUser>) => void;
  isRegistered: (eventId: string) => boolean;
  getEventById: (eventId: string) => Event | undefined;
  getRegisteredUsers: (eventId: string) => RegisteredUser[];
  addEventRating: (eventId: string, rating: Omit<EventRating, 'id' | 'createdAt'>) => Promise<void>;
  sendEventUpdate: (eventId: string, message: string) => void;
  incrementEventViews: (eventId: string) => void;
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    description: 'A comprehensive technology conference featuring the latest in AI, blockchain, and web development.',
    creator: {
      id: 'user1',
      name: 'John Smith',
      avatar: '/placeholder-avatar.jpg'
    },
    date: '2024-03-15',
    time: '09:00',
    location: 'Convention Center, San Francisco',
    capacity: 500,
    booked: 320,
    image: '/placeholder-tech-event.jpg',
    category: 'Technology',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
    views: 1250,
    ticketTypes: [
      {
        id: 't1', name: 'Early Bird', price: 199, description: 'Limited time offer', available: 50,
        sold: 0
      },
      {
        id: 't2', name: 'Standard', price: 299, description: 'Regular admission', available: 200,
        sold: 0
      },
      {
        id: 't3', name: 'VIP', price: 499, description: 'Premium experience with networking', available: 30,
        sold: 0
      }
    ],
    paymentMethods: [
      { type: 'bank_transfer', details: { bankName: 'Chase Bank', accountNumber: '****1234' } },
      { type: 'cash_app', details: { username: '$techconf2024' } },
      { type: 'paypal', details: { email: 'payment@techconf.com' } }
    ],
    ratings: [
      { id: 'r1', userId: 'user2', userName: 'Alice Johnson', rating: 5, comment: 'Amazing speakers!', createdAt: '2024-01-20T14:30:00Z' },
      { id: 'r2', userId: 'user3', userName: 'Bob Wilson', rating: 4, comment: 'Great networking opportunities', createdAt: '2024-01-22T09:15:00Z' }
    ]
  },
  {
    id: '2',
    title: 'Local Food Festival',
    description: 'Celebrate local cuisine with food trucks, cooking demonstrations, and live music.',
    creator: {
      id: 'user2',
      name: 'Maria Garcia',
      avatar: '/placeholder-avatar.jpg'
    },
    date: '2024-04-20',
    time: '11:00',
    location: 'Central Park, New York',
    capacity: 1000,
    booked: 750,
    image: '/placeholder-food.jpg',
    category: 'Food & Drink',
    createdAt: '2024-02-01T12:00:00Z',
    status: 'active',
    views: 890,
    ticketTypes: [
      {
        id: 't4', name: 'General Admission', price: 25, description: 'Access to all food stalls', available: 500,
        sold: 0
      },
      {
        id: 't5', name: 'Foodie Pass', price: 60, description: 'Includes 5 food tokens', available: 150,
        sold: 0
      }
    ],
    paymentMethods: [
      { type: 'cash_app', details: { username: '$foodfest2024' } },
      { type: 'paypal', details: { email: 'tickets@foodfest.com' } }
    ]
  },
  {
    id: '3',
    title: 'Jazz Night at Blue Moon',
    description: 'An intimate evening of smooth jazz featuring local and touring musicians.',
    creator: {
      id: 'user3',
      name: 'David Chen',
      avatar: '/placeholder-avatar.jpg'
    },
    date: '2024-03-08',
    time: '20:00',
    location: 'Blue Moon Jazz Club, Chicago',
    capacity: 150,
    booked: 95,
    image: '/placeholder-music.jpg',
    category: 'Music',
    createdAt: '2024-01-25T16:00:00Z',
    status: 'active',
    views: 420,
    ticketTypes: [
      {
        id: 't6', name: 'Standard Seating', price: 35, description: 'General seating', available: 100,
        sold: 0
      },
      {
        id: 't7', name: 'Premium Table', price: 75, description: 'Reserved table for 2', available: 25,
        sold: 0
      }
    ],
    paymentMethods: [
      { type: 'bank_transfer', details: { bankName: 'Wells Fargo', accountNumber: '****5678' } },
      { type: 'cash_app', details: { username: '$bluemoonjazz' } }
    ]
  },
  {
    id: '4',
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest strategies in social media marketing, SEO, and content creation.',
    creator: {
      id: 'user4',
      name: 'Sarah Thompson',
      avatar: '/placeholder-avatar.jpg'
    },
    date: '2024-03-25',
    time: '14:00',
    location: 'Learning Hub, Austin',
    capacity: 75,
    booked: 45,
    image: '/placeholder-workshop.jpg',
    category: 'Business',
    createdAt: '2024-02-05T11:00:00Z',
    status: 'active',
    views: 680,
    ticketTypes: [
      {
        id: 't8', name: 'Workshop Access', price: 149, description: 'Full workshop + materials', available: 50,
        sold: 0
      }
    ],
    paymentMethods: [
      { type: 'paypal', details: { email: 'workshop@learnhub.com' } },
      { type: 'cash_app', details: { username: '$digitalworkshop' } }
    ]
  }
];

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, RegisteredUser[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load events from backend on mount
  useEffect(() => {
    loadEvents();
    loadFeaturedEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Loading events from backend...');
      const response = await apiService.getAllEvents();
      console.log('📥 Events response:', response);
      
      if (response.success && response.events) {
        console.log('✅ Setting events:', response.events.length, 'events');
        setAllEvents(response.events);
      } else {
        console.warn('⚠️ Invalid response format:', response);
        setAllEvents([]);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('❌ Failed to load events from backend:', err);
      // Don't use mock data, just set empty array and show error
      setAllEvents([]);
      setError(`Backend error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      const response = await apiService.getFeaturedEvents();
      if (response.success && response.events) {
        setFeaturedEvents(response.events);
      } else {
        // Fallback: use most viewed events from allEvents
        const featured = allEvents
          .filter(event => event.status === 'active')
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 6);
        setFeaturedEvents(featured);
      }
    } catch (err) {
      console.error('Failed to load featured events, using fallback');
      // Fallback: use most viewed events from allEvents
      const featured = allEvents
        .filter(event => event.status === 'active')
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 6);
      setFeaturedEvents(featured);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to create events');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createEvent(eventData);
      if (response.success && response.event) {
        // Add to local state
        setAllEvents(prevEvents => [response.event, ...prevEvents]);
        // Refresh featured events
        loadFeaturedEvents();
        return response.event;
      } else {
        throw new Error('Failed to create event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to update events');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateEvent(eventId, updates);
      if (response.success && response.event) {
        // Update local state
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId ? response.event : event
          )
        );
        // Refresh featured events
        loadFeaturedEvents();
      } else {
        throw new Error('Failed to update event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelEvent = async (eventId: string) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to cancel events');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.deleteEvent(eventId);
      if (response.success) {
        // Remove from local state
        setAllEvents(prevEvents => 
          prevEvents.filter(event => event.id !== eventId)
        );
        // Refresh featured events
        loadFeaturedEvents();
      } else {
        throw new Error('Failed to cancel event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel event');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = (eventId: string, userData: Partial<RegisteredUser> = {}) => {
    // Add to registered events
    if (!registeredEventIds.includes(eventId)) {
      setRegisteredEventIds(prev => [...prev, eventId]);
    }

    // Get event details for notification
    const event = allEvents.find(e => e.id === eventId);

    // Add user to registered users for this event
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      name: userData.name || "Anonymous",
      email: userData.email || "user@example.com",
      phone: userData.phone,
      registrationDate: new Date().toISOString(),
      ticketType: userData.ticketType || "General",
      paymentStatus: userData.paymentStatus || "pending",
      paymentMethod: userData.paymentMethod,
    };

    setRegisteredUsers(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newUser]
    }));

    // Create notification data for the event creator
    if (event && typeof window !== 'undefined') {
      const notificationData = {
        type: 'registration' as const,
        title: 'New Registration!',
        message: `${newUser.name} has registered for your event`,
        eventId: eventId,
        eventTitle: event.title,
        registrationData: {
          userName: newUser.name,
          userEmail: newUser.email,
          userPhone: newUser.phone,
          ticketType: newUser.ticketType,
          paymentMethod: newUser.paymentMethod || 'Not specified',
          paymentStatus: newUser.paymentStatus,
          registrationDate: newUser.registrationDate,
        },
      };

      // Store notification for event creator in localStorage
      const creatorNotificationsKey = `notifications_${event.creator.id}`;
      const existingNotifications = JSON.parse(localStorage.getItem(creatorNotificationsKey) || '[]');
      const newNotification = {
        ...notificationData,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      existingNotifications.unshift(newNotification);
      localStorage.setItem(creatorNotificationsKey, JSON.stringify(existingNotifications));
      
      // Dispatch custom event for real-time update if creator is currently logged in
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (currentUser && event.creator.id === currentUser.id) {
        window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
      }
    }

    // Increment booked count
    setAllEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, booked: event.booked + 1 }
          : event
      )
    );
  };

  const getRegisteredUsers = (eventId: string): RegisteredUser[] => {
    return registeredUsers[eventId] || [];
  };

  const addEventRating = async (eventId: string, rating: Omit<EventRating, 'id' | 'createdAt'>) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to rate events');
    }

    try {
      const response = await apiService.addEventRating(eventId, rating.rating, rating.comment);
      if (response.success) {
        // Update local state
        const newRating: EventRating = {
          ...rating,
          id: response.rating?.id || Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { 
                  ...event, 
                  ratings: [...(event.ratings || []), newRating]
                }
              : event
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to add rating:', err);
      throw err;
    }
  };

  const sendEventUpdate = (eventId: string, message: string) => {
    // In a real app, this would send notifications to all registered users
    const users = getRegisteredUsers(eventId);
    console.log(`Sending update to ${users.length} attendees:`, message);
    
    // Mock notification sending
    users.forEach(user => {
      console.log(`Notification sent to ${user.email}: ${message}`);
    });
  };

  const incrementEventViews = (eventId: string) => {
    setAllEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, views: (event.views || 0) + 1 }
          : event
      )
    );
  };

  const isRegistered = (eventId: string): boolean => {
    return registeredEventIds.includes(eventId);
  };

  const getEventById = (eventId: string): Event | undefined => {
    return allEvents.find(event => event.id === eventId);
  };

  const refreshEvents = async () => {
    await loadEvents();
    await loadFeaturedEvents();
  };

  const value: EventsContextType = {
    allEvents,
    featuredEvents,
    addEvent,
    updateEvent,
    cancelEvent,
    registerForEvent,
    isRegistered,
    getEventById,
    getRegisteredUsers,
    addEventRating,
    sendEventUpdate,
    incrementEventViews,
    loading,
    error,
    refreshEvents,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
};
