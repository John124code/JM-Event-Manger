import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEvents } from "@/contexts/EventsContext";
import { useAuth } from "@/contexts/AuthContext";
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
  AlertTriangle
} from "lucide-react";

interface EventAnalytics {
  views: number;
  registrations: number;
  viewsThisWeek: number;
  registrationsThisWeek: number;
  conversionRate: number;
  revenue: number;
  averageRating: number;
  totalReviews: number;
  pageViews: {
    date: string;
    views: number;
  }[];
  registrationData: {
    date: string;
    registrations: number;
  }[];
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  ticketType: string;
  paymentStatus: "paid" | "pending" | "refunded";
}

const EventAnalytics = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEventById, getRegisteredUsers } = useEvents();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Load analytics data (mock data for now)
    loadAnalytics();
    loadRegisteredUsers();
  }, [user, event, navigate]);

  const loadAnalytics = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock analytics data
    const mockAnalytics: EventAnalytics = {
      views: 1250,
      registrations: event?.booked || 0,
      viewsThisWeek: 340,
      registrationsThisWeek: 25,
      conversionRate: ((event?.booked || 0) / 1250) * 100,
      revenue: (event?.booked || 0) * 50, // Assuming $50 per ticket
      averageRating: 4.6,
      totalReviews: 23,
      pageViews: [
        { date: "2024-03-01", views: 45 },
        { date: "2024-03-02", views: 67 },
        { date: "2024-03-03", views: 89 },
        { date: "2024-03-04", views: 123 },
        { date: "2024-03-05", views: 156 },
        { date: "2024-03-06", views: 134 },
        { date: "2024-03-07", views: 201 },
      ],
      registrationData: [
        { date: "2024-03-01", registrations: 5 },
        { date: "2024-03-02", registrations: 8 },
        { date: "2024-03-03", registrations: 12 },
        { date: "2024-03-04", registrations: 15 },
        { date: "2024-03-05", registrations: 19 },
        { date: "2024-03-06", registrations: 22 },
        { date: "2024-03-07", registrations: 25 },
      ]
    };

    setAnalytics(mockAnalytics);
  };

  const loadRegisteredUsers = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registered users data
    const mockUsers: RegisteredUser[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        registrationDate: "2024-03-01",
        ticketType: "General",
        paymentStatus: "paid"
      },
      {
        id: "2", 
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+1 (555) 987-6543",
        registrationDate: "2024-03-02",
        ticketType: "VIP",
        paymentStatus: "paid"
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob.johnson@email.com",
        registrationDate: "2024-03-03",
        ticketType: "Student",
        paymentStatus: "pending"
      }
    ];

    setRegisteredUsers(mockUsers);
    setLoading(false);
  };

  const sendEventUpdate = () => {
    // In a real app, this would open a modal to compose and send notifications
    alert("Event update notification feature coming soon!");
  };

  const exportAttendeeList = () => {
    // In a real app, this would generate and download a CSV file
    const csvContent = [
      "Name,Email,Phone,Registration Date,Ticket Type,Payment Status",
      ...registeredUsers.map(user => 
        `${user.name},${user.email},${user.phone || 'N/A'},${user.registrationDate},${user.ticketType},${user.paymentStatus}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.title || 'event'}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
                <Button onClick={sendEventUpdate} className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Update
                </Button>
                <Button variant="outline" onClick={exportAttendeeList}>
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.views.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{analytics.viewsThisWeek} this week</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Registrations</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.registrations}</p>
                  <p className="text-sm text-green-600">+{analytics.registrationsThisWeek} this week</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.conversionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Views to registrations</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold text-foreground">${analytics.revenue.toLocaleString()}</p>
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
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ticket Type</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Registration Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment Status</th>
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
                            <Badge variant={user.ticketType === "VIP" ? "default" : "secondary"}>
                              {user.ticketType}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {new Date(user.registrationDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              variant={
                                user.paymentStatus === "paid" ? "default" : 
                                user.paymentStatus === "pending" ? "secondary" : "destructive"
                              }
                              className={
                                user.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                                user.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" : ""
                              }
                            >
                              {user.paymentStatus}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                              {user.phone && (
                                <Button variant="ghost" size="sm">
                                  <Phone className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
