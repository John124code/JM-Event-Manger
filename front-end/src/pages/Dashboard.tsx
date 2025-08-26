import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Plus, 
  Settings,
  Star,
  MapPin
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  // Mock data for user's events and registrations
  const userEvents = [
    {
      id: "1",
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders for a day of cutting-edge technology discussions and networking.",
      creator: { name: user.name, avatar: user.avatar },
      date: "March 15, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "San Francisco Convention Center",
      capacity: 500,
      booked: 342,
      category: "Technology",
      image: "/placeholder-tech-event.jpg"
    },
    {
      id: "4",
      title: "AI & Machine Learning Workshop",
      description: "Hands-on workshop covering the latest in AI and ML technologies.",
      creator: { name: user.name, avatar: user.avatar },
      date: "April 10, 2024",
      time: "1:00 PM - 6:00 PM",
      location: "Tech Hub Downtown",
      capacity: 30,
      booked: 25,
      category: "Workshop",
      image: "/placeholder-workshop.jpg"
    }
  ];

  const registeredEvents = [
    {
      id: "2",
      title: "Creative Workshop Series",
      description: "Unleash your creativity in this hands-on workshop covering design thinking and innovation.",
      creator: { name: "Mike Chen", avatar: "/placeholder-avatar2.jpg" },
      date: "March 20, 2024",
      time: "2:00 PM - 5:00 PM",
      location: "Downtown Art Studio",
      capacity: 25,
      booked: 18,
      category: "Workshop",
      image: "/placeholder-workshop.jpg"
    },
    {
      id: "3",
      title: "Community Food Festival",
      description: "Celebrate local cuisine and connect with your neighbors at our annual food festival.",
      creator: { name: "Emma Rodriguez", avatar: "/placeholder-avatar3.jpg" },
      date: "March 25, 2024",
      time: "11:00 AM - 8:00 PM",
      location: "Central Park",
      capacity: 1000,
      booked: 756,
      category: "Community",
      image: "/placeholder-food.jpg"
    }
  ];

  const stats = [
    {
      label: "Events Created",
      value: userEvents.length,
      icon: Calendar,
      trend: "+2 this month",
      color: "text-blue-500"
    },
    {
      label: "Total Attendees",
      value: userEvents.reduce((total, event) => total + event.booked, 0),
      icon: Users,
      trend: "+67 this month",
      color: "text-green-500"
    },
    {
      label: "Events Attending",
      value: registeredEvents.length,
      icon: Star,
      trend: "+1 this week",
      color: "text-purple-500"
    },
    {
      label: "Success Rate",
      value: "95%",
      icon: TrendingUp,
      trend: "+5% improvement",
      color: "text-orange-500"
    }
  ];

  const handleEditEvent = (eventId: string) => {
    // Navigate to edit event page (to be implemented)
    console.log("Edit event:", eventId);
  };

  const handleDeleteEvent = (eventId: string) => {
    // Handle event deletion (to be implemented)
    console.log("Delete event:", eventId);
  };

  const handleBookEvent = (eventId: string) => {
    // Handle event booking (to be implemented)
    console.log("Book event:", eventId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {user.name.split(' ')[0]}!
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your events and track your community engagement
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link to="/create">
                  <Button className="btn-hero text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
                <Button variant="outline" className="btn-glass">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass p-6 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                    <Badge variant="secondary" className="glass">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="my-events" className="space-y-6">
            <TabsList className="glass w-full md:w-auto">
              <TabsTrigger value="my-events" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                My Events ({userEvents.length})
              </TabsTrigger>
              <TabsTrigger value="registered" className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Registered ({registeredEvents.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* My Events Tab */}
            <TabsContent value="my-events" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                  Events You Created
                </h2>
                <Link to="/create">
                  <Button variant="outline" className="btn-glass">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
              </div>

              {userEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isOwner={true}
                      onEdit={() => handleEditEvent(event.id)}
                      onDelete={() => handleDeleteEvent(event.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="glass p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No events created yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start building your community by creating your first event!
                  </p>
                  <Link to="/create">
                    <Button className="btn-hero text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            {/* Registered Events Tab */}
            <TabsContent value="registered" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">
                  Events You're Attending
                </h2>
                <Link to="/events">
                  <Button variant="outline" className="btn-glass">
                    <Calendar className="w-4 h-4 mr-2" />
                    Browse Events
                  </Button>
                </Link>
              </div>

              {registeredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onBook={() => handleBookEvent(event.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="glass p-12 text-center">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No events registered yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Discover amazing events in your community!
                  </p>
                  <Link to="/events">
                    <Button className="btn-hero text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Browse Events
                    </Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">
                Event Analytics
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Event Performance
                  </h3>
                  <div className="space-y-4">
                    {userEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 glass rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {Math.round((event.booked / event.capacity) * 100)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.booked}/{event.capacity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Community Impact
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-semibold text-foreground">$12,450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Repeat Attendees</span>
                      <span className="font-semibold text-foreground">68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Average Rating</span>
                      <span className="font-semibold text-foreground">4.8/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Community Growth</span>
                      <span className="font-semibold text-green-500">+23%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
