import { useState, useEffect, useMemo } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvents } from "@/contexts/EventsContext";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeAnalytics";
import { useRealTimeEventStats } from "@/hooks/useRealTimeEventStats";
import { useNotifications } from "@/contexts/NotificationContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/events/EventCard";
import { 
  Calendar, 
  Users, 
  Heart, 
  Star, 
  TrendingUp, 
  Eye, 
  Plus,
  BarChart3,
  Target,
  Trophy,
  Clock,
  MapPin,
  Bell,
  DollarSign
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL HOOKS
  const { 
    profile, 
    createdEvents = [], 
    attendedEvents = [], 
    favoriteEvents = [], 
    loading, 
    error,
    refreshProfile
  } = useUserProfile();
  
  const { cancelEvent, getRegisteredUsers } = useEvents();
  const { analytics = {}, isLoading: analyticsLoading, refreshAnalytics } = useRealTimeAnalytics();
  const realTimeStats = useRealTimeEventStats();
  const { notifications = [], unreadCount = 0 } = useNotifications();
  const navigate = useNavigate();

  // State hooks
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

  // Memoized values - computed after all hooks are declared
  const safeProfile = useMemo(() => profile || { name: 'User' }, [profile]);
  const safeCreatedEvents = useMemo(() => createdEvents || [], [createdEvents]);
  const safeAttendedEvents = useMemo(() => attendedEvents || [], [attendedEvents]);
  const safeFavoriteEvents = useMemo(() => favoriteEvents || [], [favoriteEvents]);
  const safeNotifications = useMemo(() => notifications || [], [notifications]);
  const safeRealTimeStats = useMemo(() => realTimeStats || {
    totalViews: 0,
    totalRegistrations: 0,
    conversionRate: 0,
    totalRevenue: 0,
    eventStats: {},
    recentActivity: []
  }, [realTimeStats]);

  // Get upcoming events (created events that haven't passed)
  const upcomingEvents = useMemo(() => 
    safeCreatedEvents.filter(event => new Date(event.date) >= new Date()),
    [safeCreatedEvents]
  );

  // Quick stats with real-time data
  const quickStats = useMemo(() => [
    {
      label: "Total Views",
      value: safeRealTimeStats.totalViews?.toLocaleString() || "0",
      icon: Eye,
      color: "text-blue-500",
      change: `+12%`,
      changeType: "positive"
    },
    {
      label: "Registrations", 
      value: safeRealTimeStats.totalRegistrations?.toLocaleString() || "0",
      icon: Users,
      color: "text-green-500",
      change: `+8%`,
      changeType: "positive"
    },
    {
      label: "Conversion Rate",
      value: `${safeRealTimeStats.conversionRate?.toFixed(1) || "0.0"}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      change: `+5%`,
      changeType: "positive"
    },
    {
      label: "Revenue",
      value: `₦${safeRealTimeStats.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-yellow-500",
      change: `+15%`,
      changeType: "positive"
    }
  ], [safeRealTimeStats]);

  // Effects - placed after all hooks
  useEffect(() => {
    if (safeProfile.name !== 'User' && !loading) {
      const lastRefresh = sessionStorage.getItem('lastProfileRefresh');
      const now = Date.now();
      if (!lastRefresh || now - parseInt(lastRefresh) > 300000) { // 5 minutes
        refreshProfile?.();
        refreshAnalytics?.();
        sessionStorage.setItem('lastProfileRefresh', now.toString());
        setLastRefreshTime(now);
      }
    }
  }, [safeProfile.name, loading, refreshProfile, refreshAnalytics]);

  // Auto-refresh analytics - DISABLED to prevent continuous counting
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refreshAnalytics?.();
  //     setLastRefreshTime(Date.now());
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, [refreshAnalytics]);

  // Event handlers
  const handleEditEvent = (eventId: string) => {
    navigate(`/edit?id=${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await cancelEvent(eventId);
        refreshProfile?.();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  // Conditional rendering - after all hooks
  if (loading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <LoadingSpinner className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-foreground">
                    Welcome back, {safeProfile.name}!
                  </h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600">LIVE</span>
                  </div>
                </div>
                <p className="text-xl text-muted-foreground">
                  Here's what's happening with your events - updated in real-time
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0">
                <Link to="/create">
                  <Button className="btn-hero text-white px-6">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-background/80 backdrop-blur border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    <Badge 
                      variant="secondary" 
                      className={`
                        ${stat.changeType === 'positive' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }
                      `}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Main Content with Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="notifications" className="relative">
                    Notifications
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-background/80 backdrop-blur border p-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-primary" />
                      Upcoming Events
                    </h2>
                    
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center gap-4 p-4 bg-background/60 backdrop-blur border rounded-lg hover:bg-muted/30 transition-colors">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {event.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {event.time}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">{event.category}</Badge>
                        </div>
                      ))}
                      
                      {upcomingEvents.length === 0 && (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No upcoming events</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="events" className="space-y-6">
                  <Card className="bg-background/80 backdrop-blur border p-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Plus className="w-6 h-6 text-primary" />
                      My Events ({safeCreatedEvents.length})
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {safeCreatedEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="p-4 bg-background/80 backdrop-blur border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                            </div>
                            <Badge variant="outline">{event.status}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">
                                {safeRealTimeStats.eventStats?.[event.id]?.totalViews || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">
                                {safeRealTimeStats.eventStats?.[event.id]?.totalRegistrations || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Registrations</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-600">
                                ₦{safeRealTimeStats.eventStats?.[event.id]?.paymentStats?.totalRevenue || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Revenue</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}/notifications`)}>
                              Notifications
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card className="bg-background/80 backdrop-blur border p-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Bell className="w-6 h-6 text-primary" />
                      Recent Notifications
                    </h2>
                    
                    <div className="space-y-4">
                      {safeNotifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className={`p-4 rounded-lg border ${!notification.read ? 'bg-blue-50/80 border-blue-200' : 'bg-muted/20 border-gray-200'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              {notification.eventTitle && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.eventTitle}
                                </Badge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                          {notification.registrationData && (
                            <div className="text-xs text-muted-foreground">
                              {notification.registrationData.userName} • {notification.registrationData.ticketType} • {notification.registrationData.paymentStatus}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {safeNotifications.length === 0 && (
                        <div className="text-center py-8">
                          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <Card className="bg-background/80 backdrop-blur border p-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      Real-Time Analytics
                      <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full ml-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-600">STATIC</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          refreshAnalytics?.();
                          setLastRefreshTime(Date.now());
                        }}
                        className="ml-4"
                      >
                        Refresh Data
                      </Button>
                    </h2>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-background/60 backdrop-blur border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{safeRealTimeStats.totalViews}</div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                      </div>
                      <div className="text-center p-4 bg-background/60 backdrop-blur border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{safeRealTimeStats.totalRegistrations}</div>
                        <div className="text-sm text-muted-foreground">Registrations</div>
                      </div>
                      <div className="text-center p-4 bg-background/60 backdrop-blur border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{safeRealTimeStats.conversionRate?.toFixed(1) || "0.0"}%</div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                      </div>
                      <div className="text-center p-4 bg-background/60 backdrop-blur border rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">₦{safeRealTimeStats.totalRevenue?.toLocaleString() || "0"}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Recent Activity</h3>
                        <span className="text-xs text-muted-foreground">
                          Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
                        </span>
                      </div>
                      {(safeRealTimeStats.recentActivity || []).slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-background/60 backdrop-blur border rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'registration' ? 'bg-green-500' :
                            activity.type === 'view' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></div>
                          <div className="flex-1">
                            <span className="text-sm">
                              {activity.type === 'registration' ? '👤 New registration' : 
                               activity.type === 'view' ? '👁️ Event viewed' : '⭐ New rating'}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!safeRealTimeStats.recentActivity || safeRealTimeStats.recentActivity.length === 0) && (
                        <div className="text-center py-8">
                          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-background/80 backdrop-blur border p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/create">
                    <Button className="w-full btn-hero text-white justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="bg-background/80 backdrop-blur border p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Event Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Created Events</span>
                    <span className="font-semibold">{safeCreatedEvents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Attended Events</span>
                    <span className="font-semibold">{safeAttendedEvents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Favorite Events</span>
                    <span className="font-semibold">{safeFavoriteEvents.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
