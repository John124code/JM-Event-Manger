import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useEvents } from '@/contexts/EventsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  DollarSign, 
  Mail, 
  Phone, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface EventNotificationsProps {
  eventId: string;
}

export const EventNotifications: React.FC<EventNotificationsProps> = ({ eventId }) => {
  const { getEventNotifications } = useNotifications();
  const { getEventById } = useEvents();
  
  const event = getEventById(eventId);
  const notifications = getEventNotifications(eventId);
  const registrationNotifications = notifications.filter(n => n.type === 'registration');
  const paymentNotifications = notifications.filter(n => n.type === 'payment');

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'refunded':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'refunded':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!event) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Event not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event.title} - Registration Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{registrationNotifications.length}</div>
              <div className="text-sm text-muted-foreground">Total Registrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {registrationNotifications.filter(n => n.registrationData?.paymentStatus === 'paid').length}
              </div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {registrationNotifications.filter(n => n.registrationData?.paymentStatus === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Registrations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {registrationNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No registrations yet for this event.
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-0">
                {registrationNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">
                              {notification.registrationData?.userName || 'Anonymous User'}
                            </h4>
                            <Badge 
                              className={getPaymentStatusColor(notification.registrationData?.paymentStatus || 'pending')}
                            >
                              {getPaymentStatusIcon(notification.registrationData?.paymentStatus || 'pending')}
                              <span className="ml-1">
                                {notification.registrationData?.paymentStatus || 'pending'}
                              </span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {notification.registrationData?.userEmail && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span>{notification.registrationData.userEmail}</span>
                              </div>
                            )}
                            
                            {notification.registrationData?.userPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{notification.registrationData.userPhone}</span>
                              </div>
                            )}
                            
                            {notification.registrationData?.ticketType && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3" />
                                <span>{notification.registrationData.ticketType}</span>
                                <span className="text-xs">via {notification.registrationData.paymentMethod}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{format(new Date(notification.createdAt), 'MMM dd, yyyy')}</div>
                          <div>{format(new Date(notification.createdAt), 'HH:mm')}</div>
                          <div className="text-xs">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < registrationNotifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
