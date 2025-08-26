import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users, MapPin, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

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
  };
  isOwner?: boolean;
  onBook?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard = ({ 
  event, 
  isOwner = false, 
  onBook, 
  onEdit, 
  onDelete 
}: EventCardProps) => {
  const isFull = event.booked >= event.capacity;
  const availableSpots = event.capacity - event.booked;

  return (
    <Card className="glass-hover p-0 overflow-hidden group">
      {/* Event Image */}
      <Link to={`/events/${event.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={event.image || "/placeholder-event.jpg"} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 glass text-white border-white/20"
          >
            {event.category}
          </Badge>
          
          {/* Capacity Status */}
          <div className="absolute top-3 right-3">
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
            </div>
          ) : (
            <Button 
              className="w-full btn-hero text-white"
              disabled={isFull}
              onClick={onBook}
            >
              {isFull ? "Event Full" : "Register Now"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};