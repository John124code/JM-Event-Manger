import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner, PageLoading } from "@/components/ui/loading";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Share2,
  Heart,
  Flag,
  Edit,
  Trash2,
  Check,
  X
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Mock event data - replace with actual API call
  const mockEvents = [
    {
      id: "1",
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders for a day of cutting-edge technology discussions and networking. This summit will feature keynote speakers from major tech companies, interactive workshops, and networking opportunities with fellow tech enthusiasts.\n\nWhat you'll learn:\n• Latest trends in AI and Machine Learning\n• Blockchain and Web3 technologies\n• Sustainable tech solutions\n• Career development in tech\n\nNetworking opportunities with 500+ attendees from leading tech companies.",
      creator: { name: "Sarah Johnson", avatar: "/placeholder-avatar.jpg" },
      date: "March 15, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "San Francisco Convention Center, 747 Howard St, San Francisco, CA 94103",
      capacity: 500,
      booked: 342,
      category: "Technology",
      image: "/placeholder-tech-event.jpg",
      price: "$99",
      tags: ["Technology", "Networking", "AI", "Blockchain"],
      agenda: [
        { time: "9:00 AM", title: "Registration & Welcome Coffee" },
        { time: "10:00 AM", title: "Keynote: The Future of AI" },
        { time: "11:30 AM", title: "Workshop: Building with AI APIs" },
        { time: "1:00 PM", title: "Lunch & Networking" },
        { time: "2:30 PM", title: "Panel: Blockchain in 2024" },
        { time: "4:00 PM", title: "Workshop: Web3 Development" },
        { time: "5:30 PM", title: "Closing Remarks & Drinks" }
      ]
    },
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
      image: "/placeholder-workshop.jpg",
      price: "Free",
      tags: ["Design", "Creativity", "Workshop"],
      agenda: [
        { time: "2:00 PM", title: "Welcome & Introductions" },
        { time: "2:30 PM", title: "Design Thinking Fundamentals" },
        { time: "3:30 PM", title: "Hands-on Creative Exercise" },
        { time: "4:30 PM", title: "Project Showcase" }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch event details
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const foundEvent = mockEvents.find(e => e.id === id);
        if (foundEvent) {
          setEvent(foundEvent);
          // Check if user is already booked (mock check)
          setIsBooked(Math.random() > 0.5);
        } else {
          navigate("/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Simulate API call for booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isBooked) {
        // Cancel booking
        setIsBooked(false);
        setEvent({ ...event, booked: event.booked - 1 });
      } else {
        // Make booking
        if (event.booked >= event.capacity) {
          setBookingError("Sorry, this event is fully booked.");
          return;
        }
        setIsBooked(true);
        setEvent({ ...event, booked: event.booked + 1 });
      }
    } catch (error) {
      setBookingError("Failed to process booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <Card className="glass p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Event Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/events">
              <Button className="btn-hero text-white">
                Browse Events
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && event.creator.name === user.name;
  const isFull = event.booked >= event.capacity;
  const availableSpots = event.capacity - event.booked;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Image */}
              <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                <img 
                  src={event.image || "/placeholder-event.jpg"} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 left-4 glass text-white border-white/20"
                >
                  {event.category}
                </Badge>
              </div>

              {/* Event Header */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="glass">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {event.title}
                </h1>

                <div className="flex items-center space-x-4 text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card className="glass p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  About This Event
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {event.description.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className="text-muted-foreground mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>

              {/* Agenda */}
              {event.agenda && (
                <Card className="glass p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Event Agenda
                  </h2>
                  <div className="space-y-4">
                    {event.agenda.map((item: any, index: number) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-20 text-sm text-primary font-medium">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Location */}
              <Card className="glass p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Location
                </h2>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-foreground">{event.location}</p>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View on Map
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="glass p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {event.price}
                  </div>
                  <p className="text-muted-foreground">per person</p>
                </div>

                <Separator className="my-6" />

                {/* Event Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-foreground font-medium">{event.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="text-foreground font-medium">{event.booked}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <span className={`font-medium ${availableSpots > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {availableSpots} spots
                    </span>
                  </div>
                </div>

                {/* Booking Error */}
                {bookingError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{bookingError}</AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isOwner ? (
                    <div className="space-y-2">
                      <Button className="w-full btn-glass" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Event
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full btn-glass text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Event
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleBooking}
                      disabled={isBooking || (isFull && !isBooked)}
                      className={`w-full ${isBooked ? 'bg-green-500 hover:bg-green-600' : 'btn-hero'} text-white`}
                    >
                      {isBooking ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          {isBooked ? "Canceling..." : "Booking..."}
                        </>
                      ) : isBooked ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Registered - Cancel?
                        </>
                      ) : isFull ? (
                        "Event Full"
                      ) : (
                        "Register Now"
                      )}
                    </Button>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 btn-glass"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="btn-glass">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="btn-glass">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Creator Card */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Event Creator
                </h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={event.creator.avatar} alt={event.creator.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {event.creator.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{event.creator.name}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full btn-glass">
                  View Profile
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetails;
