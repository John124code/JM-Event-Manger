import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, MapPin, Edit, Trash2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvents } from "@/contexts/EventsContext";
import { getEventPlaceholder, handleImageError } from "@/lib/imageUtils";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    creator: {
      name: string;
      avatar?: string;
    };
    date: string;
    time: string;
    location: string;
    capacity: number;
    booked: number;
    image?: string;
    category: string;
    status?: 'active' | 'upcoming' | 'cancelled' | 'completed';
    ticketTypes?: {
      id: string;
      name: string;
      price: number;
      description?: string;
      available: number;
    }[];
  };
  isOwner?: boolean;
  onBook?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showFavorite?: boolean;
}

export const EventCard = ({ 
  event, 
  isOwner = false, 
  onBook, 
  onEdit, 
  onDelete,
  showFavorite = true
}: EventCardProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useUserProfile();
  const { isRegistered } = useEvents();
  const isFull = event.booked >= event.capacity;
  const availableSpots = event.capacity - event.booked;
  const isEventFavorited = isFavorite(event.id);
  const isUserRegistered = isRegistered(event.id);

  // Get price range from ticket types
  const getPriceRange = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return "Free";
    }
    
    const prices = event.ticketTypes.map(ticket => ticket.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === 0 && maxPrice === 0) {
      return "Free";
    } else if (minPrice === maxPrice) {
      return `$${minPrice}`;
    } else if (minPrice === 0) {
      return `Free - $${maxPrice}`;
    } else {
      return `$${minPrice} - $${maxPrice}`;
    }
  };

  const handleFavoriteToggle = () => {
    if (isEventFavorited) {
      removeFromFavorites(event.id);
    } else {
      addToFavorites(event.id);
    }
  };

  return (
    <Card className="glass-hover p-0 overflow-hidden group">
      {/* Event Image */}
      <Link to={`/events/${event.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.image || getEventPlaceholder(event.category)} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => handleImageError(e, event.category)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge and Status */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge 
              variant="secondary" 
              className="glass text-white border-white/20"
            >
              {event.category}
            </Badge>
            {/* Price Badge */}
            <Badge 
              variant="default" 
              className="bg-green-600 text-white font-bold"
            >
              {getPriceRange()}
            </Badge>
            {isOwner && (
              <Badge 
                variant="default" 
                className="bg-primary text-white"
              >
                My Event
              </Badge>
            )}
            {event.status === 'cancelled' && (
              <Badge 
                variant="destructive" 
                className="bg-destructive text-white"
              >
                Cancelled
              </Badge>
            )}
          </div>
          
          {/* Capacity Status and Favorite Button */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {showFavorite && (
              <Button
                size="sm"
                variant="ghost"
                className={`w-8 h-8 p-0 rounded-full glass hover:bg-white/20 ${
                  isEventFavorited ? 'text-red-500' : 'text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFavoriteToggle();
                }}
              >
                <Heart 
                  className="w-4 h-4" 
                  fill={isEventFavorited ? "currentColor" : "none"}
                />
              </Button>
            )}
            <Badge 
              variant={isFull ? "destructive" : "default"}
              className={isFull ? "bg-destructive" : "bg-success text-white"}
            >
              {isFull ? "Full" : `${availableSpots} spots left`}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Event Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link to={`/events/${event.id}`}>
              <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                {event.title}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {event.description}
            </p>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{event.date}</span>
            <Clock className="w-4 h-4 ml-4 mr-2 text-primary" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2 text-primary" />
            <span>{event.booked} / {event.capacity} attendees</span>
          </div>
        </div>

        {/* Price Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-3 glass rounded-lg border border-primary/20">
            <span className="text-sm font-medium text-muted-foreground">Price</span>
            <span className="text-lg font-bold text-primary">
              {getPriceRange()}
            </span>
          </div>
        </div>

        {/* Creator */}
        <div className="flex items-center mb-6 p-3 glass rounded-lg">
          <Avatar className="w-8 h-8 mr-3">
            <AvatarImage src={event.creator.avatar} alt={event.creator.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {event.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              Created by {event.creator.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {isOwner ? (
            <div className="flex space-x-2 w-full">
              {event.status === 'cancelled' ? (
                <div className="w-full text-center py-2">
                  <span className="text-destructive font-medium">Event Cancelled</span>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onEdit}
                    className="flex-1 btn-glass"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onDelete}
                    className="btn-glass text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {event.status === 'cancelled' ? (
                <Button 
                  className="w-full"
                  disabled
                  variant="secondary"
                >
                  Event Cancelled
                </Button>
              ) : isUserRegistered ? (
                <Button 
                  className="w-full btn-success text-white"
                  disabled
                >
                  ✓ Registered
                </Button>
              ) : (
                <Link to={`/events/${event.id}/payment`} className="w-full">
                  <Button 
                    className="w-full btn-hero text-white"
                    disabled={isFull}
                  >
                    {isFull ? "Event Full" : "Register Now"}
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};