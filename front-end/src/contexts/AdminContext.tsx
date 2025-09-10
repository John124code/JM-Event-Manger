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

// Mock data for development
const mockStats: PlatformStats = {
  totalUsers: 1247,
  totalEvents: 89,
  totalRegistrations: 3451,
  totalRevenue: 125650,
  activeEvents: 23,
  pendingEvents: 5,
  monthlyGrowth: {
    users: 12.5,
    events: 8.3,
    revenue: 15.7,
  },
};

const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    joinedDate: '2024-01-15T10:00:00Z',
    isVerified: true,
    status: 'active',
    eventsCreated: 5,
    lastLogin: '2024-03-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'user',
    joinedDate: '2024-02-20T09:15:00Z',
    isVerified: true,
    status: 'active',
    eventsCreated: 12,
    lastLogin: '2024-03-14T16:45:00Z',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'user',
    joinedDate: '2024-01-05T11:30:00Z',
    isVerified: true,
    status: 'active',
    eventsCreated: 3,
    lastLogin: '2024-03-13T10:20:00Z',
  },
];

const mockEvents: AdminEvent[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    creator: { id: '2', name: 'Sarah Johnson' },
    category: 'Technology',
    date: '2024-03-15',
    capacity: 500,
    booked: 342,
    status: 'active',
    revenue: 34200,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Creative Workshop Series',
    creator: { id: '3', name: 'Mike Chen' },
    category: 'Workshop',
    date: '2024-03-20',
    capacity: 25,
    booked: 18,
    status: 'pending',
    revenue: 0,
    createdAt: '2024-03-10T14:30:00Z',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    userId: '4',
    userName: 'Alice Cooper',
    eventId: '1',
    eventTitle: 'Tech Innovation Summit 2024',
    amount: 299,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'Credit Card',
    date: '2024-03-14T09:30:00Z',
  },
  {
    id: 'tx_2',
    userId: '5',
    userName: 'Bob Wilson',
    eventId: '1',
    eventTitle: 'Tech Innovation Summit 2024',
    amount: 493350,
    currency: 'NGN',
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    date: '2024-03-13T15:45:00Z',
  },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: 'act_1',
    type: 'user_registration',
    message: 'New user Alice Cooper registered',
    timestamp: '2024-03-14T10:30:00Z',
    userId: '4',
  },
  {
    id: 'act_2',
    type: 'event_created',
    message: 'Mike Chen created "Creative Workshop Series"',
    timestamp: '2024-03-10T14:30:00Z',
    userId: '3',
    eventId: '2',
  },
  {
    id: 'act_3',
    type: 'payment',
    message: 'Payment received for Tech Innovation Summit 2024',
    timestamp: '2024-03-14T09:30:00Z',
    userId: '4',
    eventId: '1',
  },
];

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats>(mockStats);
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [events, setEvents] = useState<AdminEvent[]>(mockEvents);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

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
    setLoading(true);
    try {
      // In a real app, this would fetch fresh data from the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // For now, we just simulate a refresh
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
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

  // Only provide admin context if user is admin
  if (!isAdmin) {
    return <>{children}</>;
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
