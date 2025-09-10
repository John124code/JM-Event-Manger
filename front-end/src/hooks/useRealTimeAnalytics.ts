import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

export interface RealTimeAnalytics {
  totalViews: number;
  totalRegistrations: number;
  conversionRate: number;
  averageRating: number;
  revenueThisMonth: number;
  upcomingEventsCount: number;
  totalEventsCreated: number;
  activeEventsCount: number;
  todayViews: number;
  todayRegistrations: number;
  monthlyGrowth: {
    views: number;
    registrations: number;
    conversionRate: number;
    rating: number;
  };
}

export const useRealTimeAnalytics = () => {
  const { user } = useAuth();
  const { allEvents } = useEvents();
  const { profile, createdEvents } = useUserProfile();
  const [analytics, setAnalytics] = useState<RealTimeAnalytics>({
    totalViews: 0,
    totalRegistrations: 0,
    conversionRate: 0,
    averageRating: 0,
    revenueThisMonth: 0,
    upcomingEventsCount: 0,
    totalEventsCreated: 0,
    activeEventsCount: 0,
    todayViews: 0,
    todayRegistrations: 0,
    monthlyGrowth: {
      views: 0,
      registrations: 0,
      conversionRate: 0,
      rating: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  // Calculate real-time analytics based on user's created events
  const calculateAnalytics = useMemo(() => {
    if (!user || !createdEvents.length) {
      setIsLoading(false);
      return {
        totalViews: 0,
        totalRegistrations: 0,
        conversionRate: 0,
        averageRating: profile?.stats?.averageRating || 0,
        revenueThisMonth: 0,
        upcomingEventsCount: 0,
        totalEventsCreated: 0,
        activeEventsCount: 0,
        todayViews: 0,
        todayRegistrations: 0,
        monthlyGrowth: {
          views: Math.floor(Math.random() * 20) + 5, // Simulate growth
          registrations: Math.floor(Math.random() * 15) + 3,
          conversionRate: Math.floor(Math.random() * 5) + 1,
          rating: Math.floor(Math.random() * 3) + 1,
        },
      };
    }

    // Get user's events from all events
    const userEvents = allEvents.filter(event => 
      event.creator?.id === user.id || 
      event.creator?.name === user.name
    );

    // Calculate total views across all user's events
    const totalViews = userEvents.reduce((sum, event) => sum + (event.views || 0), 0);
    
    // Calculate total registrations across all user's events
    const totalRegistrations = userEvents.reduce((sum, event) => sum + (event.booked || 0), 0);
    
    // Calculate conversion rate (registrations / views * 100)
    const conversionRate = totalViews > 0 ? (totalRegistrations / totalViews * 100) : 0;
    
    // Calculate average rating from profile
    const averageRating = profile?.stats?.averageRating || 0;
    
    // Calculate revenue (estimate based on ticket prices)
    const revenueThisMonth = userEvents.reduce((sum, event) => {
      const eventRevenue = event.ticketTypes?.reduce((ticketSum, ticket) => {
        const ticketPrice = typeof ticket.price === 'number' ? ticket.price : 0;
        const soldTickets = ticket.sold || Math.floor((ticket.available || 0) * 0.3); // Estimate sold tickets
        return ticketSum + (ticketPrice * soldTickets);
      }, 0) || 0;
      return sum + eventRevenue;
    }, 0);
    
    // Count different event statuses
    const upcomingEventsCount = userEvents.filter(event => {
      const eventDate = new Date(event.date);
      const now = new Date();
      return eventDate >= now && event.status !== 'cancelled';
    }).length;
    
    const totalEventsCreated = userEvents.length;
    const activeEventsCount = userEvents.filter(event => event.status === 'active').length;
    
    // Simulate today's metrics (you can replace with real tracking)
    const todayViews = Math.floor(totalViews * 0.05) + Math.floor(Math.random() * 20);
    const todayRegistrations = Math.floor(totalRegistrations * 0.03) + Math.floor(Math.random() * 5);

    return {
      totalViews,
      totalRegistrations,
      conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
      averageRating,
      revenueThisMonth: Math.round(revenueThisMonth),
      upcomingEventsCount,
      totalEventsCreated,
      activeEventsCount,
      todayViews,
      todayRegistrations,
      monthlyGrowth: {
        views: Math.floor(Math.random() * 25) + 5,
        registrations: Math.floor(Math.random() * 20) + 3,
        conversionRate: Math.floor(Math.random() * 8) + 1,
        rating: Math.floor(Math.random() * 5) + 1,
      },
    };
  }, [user, createdEvents, allEvents, profile]);

  // Update analytics when dependencies change
  useEffect(() => {
    setIsLoading(true);
    const newAnalytics = calculateAnalytics;
    setAnalytics(newAnalytics);
    setIsLoading(false);
  }, [calculateAnalytics]);

  // Set up interval for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random fluctuations to simulate real-time changes
      setAnalytics(prev => ({
        ...prev,
        todayViews: prev.todayViews + Math.floor(Math.random() * 3),
        todayRegistrations: prev.todayRegistrations + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    analytics,
    isLoading,
    refreshAnalytics: () => {
      const newAnalytics = calculateAnalytics;
      setAnalytics(newAnalytics);
    }
  };
};
