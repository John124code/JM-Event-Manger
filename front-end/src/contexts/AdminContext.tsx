import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  activeEvents: number;
  pendingEvents: number;
  monthlyGrowth: {
    users: number;
    events: number;
    revenue: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  joinedDate: string;
  isVerified: boolean;
  status: 'active' | 'banned';
  eventsCreated: number;
  lastLogin: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  creator: {
    id: string;
    name: string;
  };
  category: string;
  date: string;
  capacity: number;
  booked: number;
  status: 'active' | 'pending' | 'cancelled' | 'completed';
  revenue: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  currency: 'USD' | 'NGN';
  status: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  date: string;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'event_created' | 'payment' | 'event_cancelled';
  message: string;
  timestamp: string;
  userId?: string;
  eventId?: string;
}

interface AdminContextType {
  stats: PlatformStats;
  users: AdminUser[];
  events: AdminEvent[];
  transactions: Transaction[];
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  // Actions
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  approveEvent: (eventId: string) => void;
  rejectEvent: (eventId: string) => void;
  refundTransaction: (transactionId: string) => void;
  refreshData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

// Real-time data fetching functions
const fetchStats = async (token: string): Promise<PlatformStats> => {
  try {
    // Fetch events to calculate stats
    const eventsResponse = await fetch('http://localhost:3001/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!eventsResponse.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const eventsData = await eventsResponse.json();
    console.log('📊 Events API response:', eventsData);
    
    // Handle different response formats
    let events = [];
    if (Array.isArray(eventsData.data)) {
      events = eventsData.data;
    } else if (Array.isArray(eventsData)) {
      events = eventsData;
    } else {
      console.log('⚠️ Events data is not an array:', eventsData);
      events = [];
    }
    
    // Calculate basic stats from events
    const totalEvents = events.length;
    const activeEvents = events.filter((e: any) => e.status === 'active' || e.status === 'published').length;
    const pendingEvents = events.filter((e: any) => e.status === 'pending').length;
    
    // Try to get more detailed stats from individual event analytics
    let totalRegistrations = 0;
    let totalRevenue = 0;
    
    // For each event, try to get its registration data
    for (const event of events.slice(0, 5)) { // Limit to first 5 events to avoid too many requests
      try {
        const regResponse = await fetch(`http://localhost:3001/api/events/${event._id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (regResponse.ok) {
          const regData = await regResponse.json();
          const registrations = regData.data || [];
          totalRegistrations += registrations.length;
          
          // Calculate revenue from registrations
          totalRevenue += registrations.reduce((sum: number, reg: any) => 
            sum + (reg.totalAmount || reg.ticketPrice || 50), 0);
        }
      } catch (error) {
        console.log(`Could not fetch registrations for event ${event._id}`);
      }
    }
    
    return {
      totalUsers: totalRegistrations + 1, // Add 1 for admin user
      totalEvents,
      totalRegistrations,
      totalRevenue,
      activeEvents,
      pendingEvents,
      monthlyGrowth: {
        users: totalRegistrations > 0 ? 15.0 : 0,
        events: totalEvents > 0 ? 8.3 : 0,
        revenue: totalRevenue > 0 ? 12.5 : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return basic stats if API fails
    return {
      totalUsers: 1,
      totalEvents: 0,
      totalRegistrations: 0,
      totalRevenue: 0,
      activeEvents: 0,
      pendingEvents: 0,
      monthlyGrowth: { users: 0, events: 0, revenue: 0 },
    };
  }
};

const fetchEvents = async (token: string): Promise<AdminEvent[]> => {
  try {
    const response = await fetch('http://localhost:3001/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    console.log('📊 Events fetch response:', data);
    
    // Handle different response formats
    let events = [];
    if (Array.isArray(data.data)) {
      events = data.data;
    } else if (Array.isArray(data)) {
      events = data;
    } else {
      console.log('⚠️ Events data is not an array in fetchEvents:', data);
      return [];
    }
    
    // Map events from your backend to AdminEvent format
    return events.map((event: any) => ({
      id: event._id || event.id,
      title: event.title || 'Untitled Event',
      creator: {
        id: event.creator?._id || event.creator?.id || 'unknown',
        name: event.creator?.name || 'Unknown Creator',
      },
      category: event.category || 'Other',
      date: event.date || new Date().toISOString(),
      capacity: event.capacity || 0,
      booked: event.booked || 0,
      status: event.status || 'active',
      revenue: event.revenue || 0,
      createdAt: event.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

const fetchRecentActivity = async (token: string): Promise<RecentActivity[]> => {
  try {
    // Get events and try to derive activity from them
    const eventsResponse = await fetch('http://localhost:3001/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!eventsResponse.ok) {
      return [];
    }
    
    const eventsData = await eventsResponse.json();
    console.log('📊 Events for activity response:', eventsData);
    
    // Handle different response formats
    let events = [];
    if (Array.isArray(eventsData.data)) {
      events = eventsData.data;
    } else if (Array.isArray(eventsData)) {
      events = eventsData;
    } else {
      console.log('⚠️ Events data is not an array in fetchRecentActivity:', eventsData);
      return [];
    }
    
    // Create activity from recent events
    const activities: RecentActivity[] = [];
    
    for (const event of events.slice(0, 3)) {
      try {
        const regResponse = await fetch(`http://localhost:3001/api/events/${event._id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (regResponse.ok) {
          const regData = await regResponse.json();
          const registrations = regData.data || [];
          
          // Add registration activities
          registrations.slice(0, 2).forEach((reg: any, index: number) => {
            activities.push({
              id: `activity_${event._id}_${index}`,
              type: 'user_registration',
              message: `${reg.name || reg.userName || 'User'} registered for ${event.title}`,
              timestamp: reg.registrationDate || reg.createdAt || new Date().toISOString(),
              userId: reg.userId,
              eventId: event._id,
            });
          });
        }
      } catch (error) {
        console.log(`Could not fetch registrations for activity`);
      }
    }
    
    // If no registration activity, create event creation activity
    if (activities.length === 0) {
      events.slice(0, 3).forEach((event: any, index: number) => {
        activities.push({
          id: `event_activity_${index}`,
          type: 'event_created',
          message: `Event "${event.title}" was created`,
          timestamp: event.createdAt || new Date().toISOString(),
          eventId: event._id,
        });
      });
    }
    
    return activities.slice(0, 10); // Limit to 10 activities
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

const fetchUsers = async (token: string): Promise<AdminUser[]> => {
  try {
    const users: AdminUser[] = [];
    const uniqueUsers = new Set<string>();
    
    // Get all events first
    const eventsResponse = await fetch('http://localhost:3001/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!eventsResponse.ok) {
      console.log('Could not fetch events for user data');
      return [];
    }
    
    const eventsData = await eventsResponse.json();
    console.log('📊 Events for users response:', eventsData);
    
    // Handle different response formats
    let events = [];
    if (Array.isArray(eventsData.data)) {
      events = eventsData.data;
    } else if (Array.isArray(eventsData)) {
      events = eventsData;
    } else {
      console.log('⚠️ Events data is not an array in fetchUsers:', eventsData);
      return [];
    }
    
    console.log(`📊 Fetching users from ${events.length} events...`);
    
    // For each event, get its registrations to collect users
    for (const event of events) {
      try {
        const regResponse = await fetch(`http://localhost:3001/api/events/${event._id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (regResponse.ok) {
          const regData = await regResponse.json();
          const registrations = regData.data || [];
          
          console.log(`📝 Found ${registrations.length} registrations for ${event.title}`);
          
          // Extract unique users from registrations
          registrations.forEach((reg: any) => {
            const userKey = reg.email || reg.userEmail || `user_${reg.id}`;
            
            if (!uniqueUsers.has(userKey)) {
              uniqueUsers.add(userKey);
              
              users.push({
                id: reg.userId || reg.id || `user_${users.length + 1}`,
                name: reg.name || reg.userName || 'Unknown User',
                email: reg.email || reg.userEmail || 'no-email@provided.com',
                role: 'user', // Regular users (admins would be separate)
                joinedDate: reg.registrationDate || reg.createdAt || new Date().toISOString(),
                isVerified: reg.paymentStatus === 'paid' || reg.paymentStatus === 'confirmed',
                status: 'active',
                eventsCreated: 0, // Regular users don't create events
                lastLogin: reg.registrationDate || reg.createdAt || new Date().toISOString(),
              });
            }
          });
        }
      } catch (error) {
        console.log(`Could not fetch registrations for event ${event._id}`);
      }
    }
    
    console.log(`✅ Found ${users.length} unique users from registrations`);
    
    // Add the admin user to the list
    users.unshift({
      id: 'admin_user',
      name: 'JM Event Admin',
      email: 'admin@jmevent.com',
      role: 'admin',
      joinedDate: new Date().toISOString(),
      isVerified: true,
      status: 'active',
      eventsCreated: events.length,
      lastLogin: new Date().toISOString(),
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return at least the admin user if everything fails
    return [{
      id: 'admin_user',
      name: 'JM Event Admin',
      email: 'admin@jmevent.com',
      role: 'admin',
      joinedDate: new Date().toISOString(),
      isVerified: true,
      status: 'active',
      eventsCreated: 0,
      lastLogin: new Date().toISOString(),
    }];
  }
};

const fetchTransactions = async (token: string): Promise<Transaction[]> => {
  try {
    const transactions: Transaction[] = [];
    
    // Get all events first
    const eventsResponse = await fetch('http://localhost:3001/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!eventsResponse.ok) {
      return [];
    }
    
    const eventsData = await eventsResponse.json();
    console.log('📊 Events for transactions response:', eventsData);
    
    // Handle different response formats
    let events = [];
    if (Array.isArray(eventsData.data)) {
      events = eventsData.data;
    } else if (Array.isArray(eventsData)) {
      events = eventsData;
    } else {
      console.log('⚠️ Events data is not an array in fetchTransactions:', eventsData);
      return [];
    }
    
    // For each event, get its registrations to collect transactions
    for (const event of events) {
      try {
        const regResponse = await fetch(`http://localhost:3001/api/events/${event._id}/registrations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (regResponse.ok) {
          const regData = await regResponse.json();
          const registrations = regData.data || [];
          
          // Convert registrations to transactions
          registrations.forEach((reg: any, index: number) => {
            transactions.push({
              id: reg.id || `tx_${event._id}_${index}`,
              userId: reg.userId || 'unknown',
              userName: reg.name || reg.userName || 'Unknown User',
              eventId: event._id,
              eventTitle: event.title,
              amount: reg.totalAmount || reg.ticketPrice || 50,
              currency: 'USD', // Default currency
              status: reg.paymentStatus || 'paid',
              paymentMethod: reg.paymentMethod || 'Unknown',
              date: reg.registrationDate || reg.createdAt || new Date().toISOString(),
            });
          });
        }
      } catch (error) {
        console.log(`Could not fetch registrations for transactions`);
      }
    }
    
    console.log(`💰 Found ${transactions.length} transactions from registrations`);
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  
  // Initialize with empty data instead of mock data
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    activeEvents: 0,
    pendingEvents: 0,
    monthlyGrowth: { users: 0, events: 0, revenue: 0 },
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch real data from API
  const loadAdminData = async () => {
    if (!isAdmin || !token) {
      console.log('❌ Admin data loading skipped - not admin or no token', { isAdmin, hasToken: !!token });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading REAL admin dashboard data from backend...');
      console.log('🔑 Using token:', token?.substring(0, 20) + '...');
      
      // Use the new real admin dashboard endpoint
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch admin data: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const { stats, users, events, transactions, recentActivity } = result.data;
        
        setStats(stats);
        setUsers(users);
        setEvents(events);
        setTransactions(transactions);
        setRecentActivity(recentActivity);
        
        console.log('✅ REAL admin dashboard data loaded successfully:', {
          totalUsers: stats.totalUsers,
          totalEvents: stats.totalEvents,
          totalRegistrations: stats.totalRegistrations,
          totalRevenue: stats.totalRevenue,
          usersLoaded: users.length,
          eventsLoaded: events.length,
          transactionsLoaded: transactions.length
        });
      } else {
        throw new Error('Invalid response format from admin dashboard');
      }
      
    } catch (err) {
      console.error('❌ Error loading REAL admin data:', err);
      setError('Failed to load admin data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // Load data when admin user is available
  useEffect(() => {
    if (isAdmin && token) {
      loadAdminData();
    }
  }, [isAdmin, token]);

  const banUser = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, status: 'banned' as const } : user
      )
    );
  };

  const unbanUser = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, status: 'active' as const } : user
      )
    );
  };

  const approveEvent = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, status: 'active' as const } : event
      )
    );
  };

  const rejectEvent = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, status: 'cancelled' as const } : event
      )
    );
  };

  const refundTransaction = (transactionId: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === transactionId
          ? { ...transaction, status: 'refunded' as const }
          : transaction
      )
    );
  };

  const refreshData = async () => {
    await loadAdminData();
  };

  const value: AdminContextType = {
    stats,
    users,
    events,
    transactions,
    recentActivity,
    loading,
    error,
    banUser,
    unbanUser,
    approveEvent,
    rejectEvent,
    refundTransaction,
    refreshData,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
