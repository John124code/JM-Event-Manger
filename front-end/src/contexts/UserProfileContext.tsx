import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useEvents } from './EventsContext';
import { apiService } from '../services/api';

export interface UserEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  attendees?: number;
  capacity?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
  isVerified: boolean;
  stats: {
    eventsCreated: number;
    eventsAttended: number;
    totalRatings: number;
    averageRating: number;
    followers: number;
    following: number;
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

interface UserProfileContextType {
  profile: UserProfile | null;
  createdEvents: UserEvent[];
  attendedEvents: UserEvent[];
  favoriteEvents: UserEvent[];
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  addToFavorites: (eventId: string) => void;
  removeFromFavorites: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateProfile: updateAuthProfile } = useAuth();
  const { allEvents } = useEvents();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteEvents, setFavoriteEvents] = useState<UserEvent[]>([]);
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile from authenticated user
  useEffect(() => {
    if (user && isAuthenticated && !profile) {
      initializeProfile();
    } else if (!user || !isAuthenticated) {
      setProfile(null);
      setFavoriteEvents([]);
      setFavoriteEventIds([]);
    }
  }, [user, isAuthenticated]);

  const initializeProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // Set basic profile from auth user
      const basicProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || 'Welcome to my profile!',
        location: user.location,
        joinedDate: user.joinedDate,
        isVerified: user.isVerified,
        stats: {
          eventsCreated: 0,
          eventsAttended: 0,
          totalRatings: 0,
          averageRating: 0,
          followers: 0,
          following: 0,
          ...(user.stats || {})
        },
        socialLinks: {}
      };
      
      setProfile(basicProfile);

      // Try to load additional profile data from backend
      try {
        const profileResponse = await apiService.getUserProfile(user.id);
        if (profileResponse.success && profileResponse.user) {
          setProfile(profileResponse.user);
        }
      } catch (err) {
        console.log('Using basic profile - extended profile not available');
      }

      // Try to load user stats from backend
      try {
        const statsResponse = await apiService.getUserStats(user.id);
        if (statsResponse.success && statsResponse.stats) {
          setProfile(prev => prev ? {
            ...prev,
            stats: { ...prev.stats, ...statsResponse.stats }
          } : prev);
        }
      } catch (err) {
        console.log('Using basic stats - extended stats not available');
      }

    } catch (err: any) {
      console.error('Failed to initialize profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Get user's created events from EventsContext (memoized to prevent infinite loops)
  const createdEvents = useMemo(() => 
    user 
      ? allEvents
          .filter(event => event.creator?.id === user.id)
          .map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            image: event.image || '/placeholder-tech-event.jpg',
            category: event.category,
            status: (event.status === 'cancelled' ? 'cancelled' : 
                    new Date(event.date) < new Date() ? 'completed' : 'upcoming') as 'upcoming' | 'completed' | 'cancelled',
            attendees: event.booked,
            capacity: event.capacity
          }))
      : [], 
    [user, allEvents]
  );

  // Get user's attended events (memoized to prevent infinite loops)
  // Note: Currently no attendees tracking in Event interface, so this returns empty array
  const attendedEvents = useMemo(() => [], []);

  // Calculate favorites from IDs (memoized)
  const calculatedFavorites = useMemo(() => {
    return [...createdEvents, ...attendedEvents].filter(event => 
      favoriteEventIds.includes(event.id)
    );
  }, [favoriteEventIds, createdEvents, attendedEvents]);

  // Update favorites when calculation changes
  useEffect(() => {
    setFavoriteEvents(calculatedFavorites);
  }, [calculatedFavorites]);

  // Update profile stats when created events change
  useEffect(() => {
    if (profile && user && profile.stats.eventsCreated !== createdEvents.length) {
      const updatedStats = {
        ...profile.stats,
        eventsCreated: createdEvents.length
      };
      setProfile(prev => prev ? { ...prev, stats: updatedStats } : null);
    }
  }, [createdEvents.length, user, profile?.stats.eventsCreated]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !isAuthenticated) {
      throw new Error('No profile to update or not authenticated');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateProfile(updates);
      if (response.success && response.user) {
        setProfile(response.user);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.uploadAvatar(file);
      if (response.success && response.avatarUrl) {
        // Update profile with new avatar
        if (profile) {
          setProfile(prev => prev ? { ...prev, avatar: response.avatarUrl } : null);
        }
        
        // Also update the user in AuthContext so navbar shows the new avatar
        try {
          if (response.user) {
            // If backend returned updated user object, use it
            await updateAuthProfile(response.user);
          } else {
            // Otherwise just update the avatar
            await updateAuthProfile({ avatar: response.avatarUrl });
          }
        } catch (authError) {
          console.warn('Failed to update auth context with new avatar:', authError);
          // Continue anyway as the upload was successful
        }
        
        return response.avatarUrl;
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      setError(err.message || 'Failed to upload avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      if (response.success) {
        // Password changed successfully
        console.log('Password changed successfully');
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    await initializeProfile();
  };

  const addToFavorites = (eventId: string) => {
    if (!favoriteEventIds.includes(eventId)) {
      setFavoriteEventIds(prev => [...prev, eventId]);
    }
  };

  const removeFromFavorites = (eventId: string) => {
    setFavoriteEventIds(prev => prev.filter(id => id !== eventId));
  };

  const isFavorite = (eventId: string): boolean => {
    return favoriteEventIds.includes(eventId);
  };

  const value: UserProfileContextType = {
    profile,
    createdEvents,
    attendedEvents,
    favoriteEvents,
    updateProfile,
    uploadAvatar,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    changePassword,
    refreshProfile,
    loading,
    error,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};