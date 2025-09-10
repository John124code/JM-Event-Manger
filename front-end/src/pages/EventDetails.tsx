import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventsContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventReviews } from "@/components/events/EventReviews";
import { SocialSharing } from "@/components/events/SocialSharing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner, PageLoading } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  X,
  Star,
  DollarSign,
  BarChart3,
  Smartphone
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getEventById, isRegistered, addEventRating, incrementEventViews } = useEvents();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const event = id ? getEventById(id) : null;
  const userIsRegistered = id ? isRegistered(id) : false;
  const registrationSuccess = searchParams.get('registered') === 'true';

  // Check if user is the creator
  const isCreator = event && user && event.creator.name === user.name;

  useEffect(() => {
    if (!id || !event) {
      navigate("/events");
      return;
    }

    // Increment view count when page loads
    incrementEventViews(id);
    setIsLoading(false);
  }, [id, event, navigate, incrementEventViews]);

  // Clear booking error when ticket is selected
  useEffect(() => {
    if (selectedTicket && bookingError) {
      setBookingError(null);
    }
  }, [selectedTicket, bookingError]);

  const handleRegister = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (userIsRegistered) {
      // Already registered, maybe show success message
      return;
    }

    if (!selectedTicket) {
      // If no ticket selected, navigate to payment page anyway
      // The payment page can handle ticket selection
      navigate(`/events/${id}/payment`, {
        state: {
          ticket: null,
          quantity: 1,
          totalPrice: 0
        }
      });
      return;
    }

    // Navigate to payment page with ticket information
    navigate(`/events/${id}/payment`, {
      state: {
        ticket: selectedTicket,
        quantity: quantity,
        totalPrice: selectedTicket.price * quantity
      }
    });
  };

  const handleAddReview = (review: any) => {
    if (id) {
      addEventRating(id, review);
    }
  };

  // Calculate average rating
  const averageRating = event?.ratings?.length > 0 
    ? event.ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / event.ratings.length 
    : 0;

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

  const isFull = event.booked >= event.capacity;
  const availableSpots = event.capacity - event.booked;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Registration Success Alert */}
      {registrationSuccess && (
        <div className="pt-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription>
                🎉 Registration successful! You're all set for {event.title}. Check your email for confirmation details.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      
      <div className={`${registrationSuccess ? 'pb-16' : 'pt-20 pb-16'}`}>
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
                  src={event.image || "/placeholder-tech-event.jpg"} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-tech-event.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 left-4 glass text-white border-white/20"
                >
                  {event.category}
                </Badge>

                {/* Event Status */}
                {event.status === 'cancelled' && (
                  <Badge 
                    variant="destructive" 
                    className="absolute top-4 right-4"
                  >
                    Cancelled
                  </Badge>
                )}
              </div>

              {/* Event Header */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      <span>{averageRating.toFixed(1)} ({event.ratings?.length || 0} reviews)</span>
                    </div>
                  )}
                </div>

                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={event.creator.avatar} alt={event.creator.name} />
                    <AvatarFallback>
                      {event.creator.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Organized by</p>
                    <p className="font-medium text-foreground">{event.creator.name}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="share">Share</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="tickets" className="space-y-6 mt-6">
                  {/* Ticket Types */}
                  <Card className="glass p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Choose your ticket type
                    </h2>
                    <div className="space-y-4">
                      {event.ticketTypes?.map((ticket, index) => {
                        const ticketKey = ticket.id || ticket.name || index.toString();
                        const selectedKey = selectedTicket?._id || selectedTicket?.name || selectedTicket?.id;
                        return (
                          <div 
                            key={ticketKey} 
                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedKey === ticketKey
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div>
                              <h3 className="font-medium text-foreground">{ticket.name}</h3>
                              {ticket.description && (
                                <p className="text-sm text-muted-foreground">{ticket.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticket.available} available
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <p className="text-2xl font-bold text-foreground">₦{ticket.price.toLocaleString()}</p>
                              {selectedKey === ticketKey && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Selected Ticket Summary */}
                  {selectedTicket && (
                    <Card className="glass p-6 border-primary">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Ticket Summary
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{selectedTicket.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                          </div>
                          <p className="text-lg font-semibold text-foreground">₦{selectedTicket.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantity:</span>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              disabled={quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setQuantity(Math.min(selectedTicket.available, quantity + 1))}
                              disabled={quantity >= selectedTicket.available}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between text-lg font-semibold">
                          <span>Total:</span>
                          <span>₦{(selectedTicket.price * quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Payment Methods */}
                  {event.paymentMethods && event.paymentMethods.length > 0 && (
                    <Card className="glass p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">
                        Payment Methods
                      </h2>
                      <div className="space-y-3">
                        {event.paymentMethods.map((method, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            {method.type === 'bank_transfer' && <DollarSign className="w-5 h-5 text-green-600" />}
                            {method.type === 'cash_app' && <Smartphone className="w-5 h-5 text-blue-600" />}
                            <div>
                              <p className="font-medium capitalize">{method.type.replace('_', ' ')}</p>
                              <p className="text-sm text-muted-foreground">
                                {method.type === 'bank_transfer' && method.details.bankName}
                                {method.type === 'cash_app' && method.details.username}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <EventReviews
                    eventId={event.id}
                    ratings={event.ratings || []}
                    onAddReview={handleAddReview}
                    canReview={userIsRegistered}
                  />
                </TabsContent>

                <TabsContent value="share" className="mt-6">
                  <SocialSharing event={event} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="glass p-6 sticky top-24">
                <div className="space-y-4">
                  {/* Ticket Price */}
                  {event.ticketTypes && event.ticketTypes.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-3xl font-bold text-foreground">
                        ${Math.min(...event.ticketTypes.map(t => t.price))}
                      </p>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">
                        {event.booked} / {event.capacity} registered
                      </span>
                    </div>
                    <Badge variant={isFull ? "destructive" : "secondary"}>
                      {isFull ? "Sold Out" : `${availableSpots} spots left`}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.booked / event.capacity) * 100}%` }}
                    />
                  </div>

                  {/* Error Message */}
                  {bookingError && (
                    <Alert variant="destructive">
                      <AlertDescription>{bookingError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {userIsRegistered ? (
                      <Button disabled className="w-full btn-success">
                        <Check className="w-4 h-4 mr-2" />
                        Registered
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleRegister}
                        disabled={isFull || event.status === 'cancelled'}
                        className="w-full btn-hero text-white"
                      >
                        {isFull ? "Event Full" : 
                         event.status === 'cancelled' ? "Event Cancelled" :
                         !selectedTicket ? "Register Now" :
                         `Register Now - ₦${(selectedTicket.price * quantity).toLocaleString()}`}
                      </Button>
                    )}

                    {selectedTicket && !userIsRegistered && (
                      <p className="text-sm text-muted-foreground text-center">
                        {selectedTicket.name} × {quantity} = ₦{(selectedTicket.price * quantity).toLocaleString()}
                      </p>
                    )}

                    {/* Creator Actions */}
                    {isCreator && (
                      <div className="space-y-2 pt-4 border-t border-border">
                        <Link to={`/events/${event.id}/analytics`}>
                          <Button variant="outline" className="w-full">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Event
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Location Card */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Location</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">{event.location}</p>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View on Map
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Event Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">{event.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registrations</span>
                    <span className="font-medium">{event.booked}</span>
                  </div>
                  {event.ratings && event.ratings.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
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

export default EventDetails;
