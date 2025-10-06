import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEvents } from "@/contexts/EventsContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  fetchEventAnalytics,
  fetchRegisteredUsers,
  fetchEventFinancials,
  exportEventData,
  sendEventUpdate,
  checkInAttendee,
  type EventAnalyticsData,
  type RegistrationDetails,
  type EventFinancials
} from "@/services/analyticsApi";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Star,
  MessageSquare,
  Share2,
  Download,
  Mail,
  Phone,
  AlertTriangle,
  Check
} from "lucide-react";

// Use types from API service
type EventAnalytics = EventAnalyticsData;
type RegisteredUser = RegistrationDetails;

const EventAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEventById, getRegisteredUsers } = useEvents();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [financials, setFinancials] = useState<EventFinancials | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const event = eventId ? getEventById(eventId) : null;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!event) {
      navigate("/events");
      return;
    }

    // Check if user is the creator of this event
    if (event.creator.name !== user.name) {
      navigate("/events");
      return;
    }

    // Load real-time analytics data
    loadAnalytics();
    loadRegisteredUsers();
    loadFinancials();
  }, [user, event, navigate]);

  const loadAnalytics = async () => {
    if (!eventId) return;
    
    try {
      setAnalyticsLoading(true);
      setError(null);
      
      const analyticsData = await fetchEventAnalytics(eventId);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setAnalyticsLoading(false);
      setLoading(false);
    }
  };

  const loadFinancials = async () => {
    if (!eventId) return;
    
    try {
      const financialData = await fetchEventFinancials(eventId);
      setFinancials(financialData);
    } catch (error) {
      console.error('Failed to load financials:', error);
    }
  };

  const loadRegisteredUsers = async () => {
    if (!eventId) return;
    
    try {
      setUsersLoading(true);
      const usersData = await fetchRegisteredUsers(eventId);
      setRegisteredUsers(usersData);
    } catch (error) {
      console.error('Failed to load registered users:', error);
      setError('Failed to load registered users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCheckIn = async (registrationId: string) => {
    if (!eventId) return;
    
    try {
      await checkInAttendee(eventId, registrationId);
      // Refresh the users list
      loadRegisteredUsers();
    } catch (error) {
      console.error('Failed to check in attendee:', error);
    }
  };

  const handleExportData = async (type: 'registrations' | 'analytics') => {
    if (!eventId) return;
    
    try {
      const blob = await exportEventData(eventId, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event?.title}-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleSendUpdate = async (message: string, subject: string) => {
    if (!eventId) return;
    
    try {
      await sendEventUpdate(eventId, message, subject);
      // Show success message
    } catch (error) {
      console.error('Failed to send update:', error);
    }
  };

  const refreshData = () => {
    loadAnalytics();
    loadRegisteredUsers();
    loadFinancials();
  };

  if (loading || !analytics || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Event Analytics
                </h1>
                <h2 className="text-2xl text-muted-foreground">{event.title}</h2>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => handleSendUpdate("", "")} className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Update
                </Button>
                <Button variant="outline" onClick={() => handleExportData('registrations')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Registrations
                </Button>
                <Button variant="outline" onClick={() => handleExportData('analytics')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Analytics
                </Button>
                <Button variant="outline" onClick={refreshData} disabled={analyticsLoading}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {analyticsLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  {analyticsLoading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{analytics.views.toLocaleString()}</p>
                  )}
                  {!analyticsLoading && (
                    <p className="text-sm text-green-600">+{analytics.viewsThisWeek} this week</p>
                  )}
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Registrations</p>
                  {analyticsLoading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{analytics.registrations}</p>
                  )}
                  {!analyticsLoading && (
                    <p className="text-sm text-green-600">+{analytics.registrationsThisWeek} this week</p>
                  )}
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  {analyticsLoading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-3xl font-bold text-foreground">{analytics.conversionRate.toFixed(1)}%</p>
                  )}
                  <p className="text-sm text-muted-foreground">Views to registrations</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  {analyticsLoading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                  ) : (
                    <p className="text-3xl font-bold text-foreground">${analytics.revenue.toLocaleString()}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total earnings</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Event Details Summary */}
          <Card className="glass p-6 mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{event.booked} / {event.capacity}</p>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="attendees" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attendees">Attendee Management</TabsTrigger>
              <TabsTrigger value="feedback">Reviews & Ratings</TabsTrigger>
              <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="attendees" className="space-y-4">
              <Card className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Registered Attendees</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {registeredUsers.length} attendees
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  {usersLoading ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </div>
                  ) : registeredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No registered attendees yet</p>
                      <p className="text-sm">Registrations will appear here as people sign up</p>
                    </div>
                  ) : (
                    <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ticket Info</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check-in</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border/50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-foreground">{user.name}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <Badge variant={user.ticketType === "VIP" ? "default" : "secondary"}>
                                {user.ticketType}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                Qty: {user.quantity || 1} • ${user.totalAmount || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(user.registrationDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <Badge 
                                variant={
                                  user.paymentStatus === "completed" ? "default" : 
                                  user.paymentStatus === "pending" ? "secondary" : "destructive"
                                }
                                className={
                                  user.paymentStatus === "completed" ? "bg-green-100 text-green-800" :
                                  user.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" : ""
                                }
                              >
                                {user.paymentStatus}
                              </Badge>
                              <div className="text-xs text-muted-foreground capitalize">
                                {user.paymentMethod?.replace('_', ' ')}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <Badge variant={user.checkInStatus ? "default" : "secondary"}>
                                {user.checkInStatus ? "Checked In" : "Not Checked In"}
                              </Badge>
                              {user.checkInTime && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(user.checkInTime).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {!user.checkInStatus && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCheckIn(user.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Check In
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" title="Send Email">
                                <Mail className="w-4 h-4" />
                              </Button>
                              {user.phone && (
                                <Button variant="ghost" size="sm" title="Call">
                                  <Phone className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <Card className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Reviews & Ratings</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-xl font-bold">{analytics.averageRating}</span>
                    <span className="text-muted-foreground">({analytics.totalReviews} reviews)</span>
                  </div>
                </div>

                <Alert className="mb-6">
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    Reviews and ratings will be available after your event concludes. 
                    Attendees will receive an email invitation to leave feedback.
                  </AlertDescription>
                </Alert>

                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews available yet</p>
                  <p className="text-sm">Reviews will appear here after your event</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Page Views Trend</h3>
                  <div className="space-y-2">
                    {analytics.pageViews.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(data.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">{data.views} views</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Registration Trend</h3>
                  <div className="space-y-2">
                    {analytics.registrationData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(data.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">+{data.registrations} registrations</span>
                      </div>
                    ))}
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

export default EventAnalytics;
