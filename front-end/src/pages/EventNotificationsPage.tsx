import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/contexts/EventsContext';
import { EventNotifications } from '@/components/notifications/EventNotifications';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventNotificationsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { getEventById } = useEvents();
  
  const event = eventId ? getEventById(eventId) : null;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You must be logged in to view notifications.</p>
            <Link to="/login">
              <Button className="mt-4">Login</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
            <Link to="/events">
              <Button className="mt-4">Browse Events</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (event.creator.id !== user.id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You can only view notifications for events you created.</p>
            <Link to="/dashboard">
              <Button className="mt-4">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Event Notifications
            </h1>
            <p className="text-muted-foreground">
              Monitor registrations and activity for your event
            </p>
          </div>

          {/* Event Notifications Component */}
          <EventNotifications eventId={eventId!} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EventNotificationsPage;
