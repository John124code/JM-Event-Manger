import { useState, useEffect } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvents } from "@/contexts/EventsContext";
import { useRealTimeAnalytics } from "@/hooks/useRealTimeAnalytics";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
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
  MapPin
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { 
    profile, 
    createdEvents, 
    attendedEvents, 
    favoriteEvents, 
    loading, 
    error,
    refreshProfile
  } = useUserProfile();
  
  const { cancelEvent, getRegisteredUsers } = useEvents();
  const { analytics, isLoading: analyticsLoading, refreshAnalytics } = useRealTimeAnalytics();
  const navigate = useNavigate();

  // Refresh profile data when dashboard loads to ensure latest events are shown
  useEffect(() => {
    if (profile && !loading) {
      // Only refresh if we don't have a profile or it's been a while
      const lastRefresh = sessionStorage.getItem('lastProfileRefresh');
      const now = Date.now();
      if (!lastRefresh || now - parseInt(lastRefresh) > 300000) { // 5 minutes
        refreshProfile();
        refreshAnalytics(); // Also refresh analytics
        sessionStorage.setItem('lastProfileRefresh', now.toString());
      }
    }
  }, []);

  // Auto-refresh analytics every 60 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAnalytics();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  const handleEditEvent = (eventId: string) => {
    // Navigate to the edit page with the event ID as a query parameter
    navigate(`/edit?edit=${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await cancelEvent(eventId);
        // Refresh the profile data to update the dashboard
        await refreshProfile();
        // Show success message (you could add a toast notification here)
        console.log('Event deleted successfully');
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <Card className="glass p-8 text-center">
            <p className="text-destructive">Failed to load dashboard</p>
          </Card>
        </div>
      </div>
    );
  }

  // Real-time analytics data from hook
  const upcomingEvents = [
    ...createdEvents.filter(e => e.status === 'upcoming'),
    ...attendedEvents.filter(e => e.status === 'upcoming')
  ];

  // Generate real-time activity feed based on analytics
  const recentActivity = [
    {
      id: 1,
      type: 'registration',
      message: `${analytics.todayRegistrations} new registrations today`,
      time: 'Live',
      icon: Users,
      color: 'text-green-500'
    },
    {
      id: 2,
      type: 'view',
      message: `${analytics.todayViews} views on your events today`,
      time: 'Live',
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      id: 3,
      type: 'rating',
      message: `Average rating: ${analytics.averageRating.toFixed(1)} stars`,
      time: 'Updated now',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      id: 4,
      type: 'revenue',
      message: `₦${analytics.revenueThisMonth.toLocaleString()} revenue this month`,
      time: 'Live',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
  ];

  const quickStats = [
    {
      label: "Total Views",
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-500",
      change: `+${analytics.monthlyGrowth.views}%`,
      changeType: "positive"
    },
    {
      label: "Registrations", 
      value: analytics.totalRegistrations.toLocaleString(),
      icon: Users,
      color: "text-green-500",
      change: `+${analytics.monthlyGrowth.registrations}%`,
      changeType: "positive"
    },
    {
      label: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      change: `+${analytics.monthlyGrowth.conversionRate}%`,
      changeType: "positive"
    },
    {
      label: "Avg Rating",
      value: analytics.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-500",
      change: `+${analytics.monthlyGrowth.rating}%`,
      changeType: "positive"
    }
  ];

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
                    Welcome back, {profile.name}!
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
                <Card key={index} className="glass p-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Events */}
              <Card className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Upcoming Events
                  </h2>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 glass rounded-lg hover:bg-muted/30 transition-colors">
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
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {event.category}
                      </Badge>
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

              {/* Performance Overview */}
              <Card className="glass p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Performance Overview
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {analytics.totalViews.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Total Views</div>
                    <div className="text-xs text-green-600">+12% this month</div>
                  </div>
                  
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {analytics.conversionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Conversion Rate</div>
                    <div className="text-xs text-green-600">+2.3% this month</div>
                  </div>
                  
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      ${analytics.revenueThisMonth.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Revenue (Est.)</div>
                    <div className="text-xs text-green-600">+18% this month</div>
                  </div>
                </div>
              </Card>

              {/* Top Performing Events */}
              <Card className="glass p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Recent Events
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {createdEvents.slice(0, 4).map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={{
                        ...event,
                        creator: { name: profile.name, avatar: profile.avatar },
                        booked: event.attendees || 0,
                        capacity: event.capacity || 100,
                      }}
                      isOwner={true}
                      onEdit={() => handleEditEvent(event.id)}
                      onDelete={() => handleDeleteEvent(event.id)}
                    />
                  ))}
                </div>
                
                {createdEvents.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No events created yet</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/create" className="block">
                    <Button className="w-full btn-hero text-white justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                  <Link to="/profile" className="block">
                    <Button variant="outline" className="w-full btn-glass justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                  <Link to="/events" className="block">
                    <Button variant="outline" className="w-full btn-glass justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Real-Time Activity
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-muted/20`}>
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {activity.time === 'Live' && (
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Goals & Achievements */}
              <Card className="glass p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Live Goals
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">Monthly Events</span>
                      <span className="text-muted-foreground">{analytics.totalEventsCreated}/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((analytics.totalEventsCreated / 10) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">Event Registrations</span>
                      <span className="text-muted-foreground">{analytics.totalRegistrations}/1000</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((analytics.totalRegistrations / 1000) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">Average Rating</span>
                      <span className="text-muted-foreground">{analytics.averageRating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(analytics.averageRating / 5) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">Conversion Rate</span>
                      <span className="text-muted-foreground">{analytics.conversionRate}%/25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((analytics.conversionRate / 25) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* My Events Section */}
          {createdEvents.length > 0 && (
            <Card className="glass p-6 mt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                My Events ({createdEvents.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={{
                      ...event,
                      creator: { name: profile.name, avatar: profile.avatar },
                      booked: event.attendees || 0,
                      capacity: event.capacity || 100,
                    }}
                    isOwner={true}
                    onEdit={() => handleEditEvent(event.id)}
                    onDelete={() => handleDeleteEvent(event.id)}
                    showFavorite={false}
                  />
                ))}
              </div>
              
              {createdEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-4">Start by creating your first event</p>
                  <Link to="/create">
                    <Button className="btn-hero text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}

          {/* Event Registrations Section */}
          {createdEvents.length > 0 && (
            <Card className="glass p-6 mt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Event Registrations
              </h2>
              
              <div className="space-y-6">
                {createdEvents.map((event) => {
                  const registeredUsers = getRegisteredUsers(event.id);
                  
                  if (registeredUsers.length === 0) return null;
                  
                  return (
                    <div key={event.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {registeredUsers.length} registered participant{registeredUsers.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {registeredUsers.length}/{event.capacity || 100}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {registeredUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={user.paymentStatus === 'paid' ? 'default' : 
                                          user.paymentStatus === 'pending' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {user.paymentStatus}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {user.ticketType}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {registeredUsers.length > 6 && (
                        <div className="mt-4 text-center">
                          <Button variant="outline" size="sm">
                            View All {registeredUsers.length} Participants
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {createdEvents.every(event => getRegisteredUsers(event.id).length === 0) && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Registrations Yet</h3>
                    <p className="text-muted-foreground">When people register for your events, they'll appear here</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
