import { useState, useEffect, useCallback } from 'react';
import { useEvents } from '@/contexts/EventsContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface EventStats {
  eventId: string;
  totalViews: number;
  totalRegistrations: number;
  conversionRate: number;
  averageRating: number;
  recentActivity: {
    timestamp: string;
    type: 'view' | 'registration' | 'rating';
    data?: any;
  }[];
  paymentStats: {
    paid: number;
    pending: number;
    refunded: number;
    totalRevenue: number;
  };
  ticketStats: {
    ticketType: string;
    sold: number;
    available: number;
    revenue: number;
  }[];
}

export interface RealTimeStats {
  totalEvents: number;
  totalViews: number;
  totalRegistrations: number;
  totalRevenue: number;
  conversionRate: number;
  averageRating: number;
  recentActivity: EventStats['recentActivity'];
  eventStats: Record<string, EventStats>;
  isLoading: boolean;
  lastUpdated: string;
}

export const useRealTimeEventStats = (eventId?: string, refreshInterval: number = 120000) => {
  const { allEvents, getEventById, getRegisteredUsers } = useEvents();
  const { getEventNotifications } = useNotifications();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<RealTimeStats>({
    totalEvents: 0,
    totalViews: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    conversionRate: 0,
    averageRating: 0,
    recentActivity: [],
    eventStats: {},
    isLoading: true,
    lastUpdated: new Date().toISOString(),
  });
  
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const calculateEventStats = useCallback((eventId: string): EventStats | null => {
    const event = getEventById(eventId);
    if (!event) return null;

    const registeredUsers = getRegisteredUsers(eventId);
    const notifications = getEventNotifications(eventId);
    const registrationNotifications = notifications.filter(n => n.type === 'registration');

    // Calculate payment stats
    const paymentStats = {
      paid: registrationNotifications.filter(n => n.registrationData?.paymentStatus === 'paid').length,
      pending: registrationNotifications.filter(n => n.registrationData?.paymentStatus === 'pending').length,
      refunded: registrationNotifications.filter(n => n.registrationData?.paymentStatus === 'refunded').length,
      totalRevenue: 0,
    };

    // Calculate ticket stats and revenue
    const ticketStats = event.ticketTypes?.map(ticket => {
      const soldCount = registrationNotifications.filter(n => 
        n.registrationData?.ticketType === ticket.name && 
        n.registrationData?.paymentStatus === 'paid'
      ).length;
      
      const revenue = soldCount * (ticket.price || 0);
      paymentStats.totalRevenue += revenue;

      return {
        ticketType: ticket.name,
        sold: soldCount,
        available: Math.max(0, (ticket.available || 0) - soldCount),
        revenue,
      };
    }) || [];

    // Use actual values instead of calculations that might cause loops
    const totalViews = event.views || 0;
    const totalRegistrations = registrationNotifications.length;
    const conversionRate = totalViews > 0 ? (totalRegistrations / totalViews) * 100 : 0;

    // Calculate average rating
    const ratings = event.ratings || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    // Get recent activity from notifications
    const recentActivity = notifications
      .slice(0, 10)
      .map(notification => ({
        timestamp: notification.createdAt,
        type: notification.type as 'view' | 'registration' | 'rating',
        data: notification.registrationData || notification,
      }));

    return {
      eventId,
      totalViews,
      totalRegistrations,
      conversionRate,
      averageRating,
      recentActivity,
      paymentStats,
      ticketStats,
    };
  }, [getEventById, getRegisteredUsers, getEventNotifications]);

  const calculateOverallStats = useCallback((): RealTimeStats => {
    if (!user) {
      return {
        totalEvents: 0,
        totalViews: 0,
        totalRegistrations: 0,
        totalRevenue: 0,
        conversionRate: 0,
        averageRating: 0,
        recentActivity: [],
        eventStats: {},
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Filter events created by the current user - use stable filtering
    const userEvents = allEvents.filter(event => event.creator?.id === user.id);
    const eventStats: Record<string, EventStats> = {};
    
    let totalViews = 0;
    let totalRegistrations = 0;
    let totalRevenue = 0;
    let totalRatings = 0;
    let totalRatingSum = 0;
    const allActivity: EventStats['recentActivity'] = [];

    userEvents.forEach(event => {
      const eventStat = calculateEventStats(event.id);
      if (eventStat) {
        eventStats[event.id] = eventStat;
        totalViews += eventStat.totalViews;
        totalRegistrations += eventStat.totalRegistrations;
        totalRevenue += eventStat.paymentStats.totalRevenue;
        
        // Add to overall rating calculation
        if (event.ratings && event.ratings.length > 0) {
          totalRatings += event.ratings.length;
          totalRatingSum += event.ratings.reduce((sum, rating) => sum + rating.rating, 0);
        }

        // Collect recent activity
        allActivity.push(...eventStat.recentActivity);
      }
    });

    // Sort recent activity by timestamp (most recent first)
    allActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const conversionRate = totalViews > 0 ? (totalRegistrations / totalViews) * 100 : 0;
    const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

    return {
      totalEvents: userEvents.length,
      totalViews,
      totalRegistrations,
      totalRevenue,
      conversionRate,
      averageRating,
      recentActivity: allActivity.slice(0, 20), // Keep last 20 activities
      eventStats,
      isLoading: false,
      lastUpdated: new Date().toISOString(),
    };
  }, [user?.id, allEvents, calculateEventStats]); // Stable dependencies

  // Update stats function
  const updateStats = useCallback(() => {
    if (isUpdating) return; // Prevent multiple simultaneous updates
    
    setIsUpdating(true);
    
    try {
      setStats(prevStats => {
        const newStats = calculateOverallStats();
        // Only show loading on initial load, not on updates
        return {
          ...newStats,
          isLoading: !hasInitialLoad
        };
      });
      
      if (!hasInitialLoad) {
        setHasInitialLoad(true);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [calculateOverallStats, hasInitialLoad, isUpdating]);

  // Initial load and interval updates - DISABLED automatic updates
  useEffect(() => {
    // Initial load only
    updateStats();
    
    // REMOVED automatic interval updates to prevent continuous counting
    // Only update when data actually changes via events
    
  }, []); // Empty dependency array - only run once on mount

  // Update only when user or events actually change
  useEffect(() => {
    if (hasInitialLoad) {
      const timeoutId = setTimeout(() => {
        updateStats();
      }, 2000); // Debounce updates when data changes

      return () => clearTimeout(timeoutId);
    }
  }, [user?.id, allEvents.length]); // Only update when user ID or number of events change

  // Return specific event stats if eventId is provided
  if (eventId) {
    return {
      ...stats,
      eventStats: stats.eventStats[eventId] ? { [eventId]: stats.eventStats[eventId] } : {},
      currentEventStats: stats.eventStats[eventId] || null,
    };
  }

  return stats;
};
