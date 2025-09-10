import { useState } from "react";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading";
import { EventCard } from "@/components/events/EventCard";
import { 
  User, 
  Calendar, 
  MapPin, 
  Star, 
  Users, 
  Heart, 
  Camera, 
  Edit3, 
  Globe, 
  Twitter, 
  Linkedin,
  CheckCircle,
  Trophy,
  Target,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { 
    profile, 
    createdEvents, 
    attendedEvents, 
    favoriteEvents, 
    uploadAvatar, 
    loading, 
    error 
  } = useUserProfile();
  
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
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
            <p className="text-destructive">Failed to load profile</p>
          </Card>
        </div>
      </div>
    );
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Max 5MB allowed');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (error) {
      alert('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const stats = [
    {
      label: "Events Created",
      value: profile.stats.eventsCreated,
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      label: "Events Attended",
      value: profile.stats.eventsAttended,
      icon: Users,
      color: "text-green-500"
    },
    {
      label: "Average Rating",
      value: profile.stats.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-500"
    },
    {
      label: "Total Favorites",
      value: favoriteEvents.length,
      icon: Heart,
      color: "text-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <Card className="glass p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Avatar Upload */}
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                      w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center 
                      cursor-pointer hover:bg-primary/80 transition-colors shadow-lg
                      ${isUploadingAvatar ? 'pointer-events-none opacity-50' : ''}
                    `}
                  >
                    {isUploadingAvatar ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </label>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                      {profile.isVerified && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(profile.joinedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </p>
                  </div>
                  
                  <Link to="/profile/edit">
                    <Button variant="outline" className="btn-glass">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-foreground mb-4 leading-relaxed">{profile.bio}</p>
                )}

                {/* Social Links */}
                {profile.socialLinks && (
                  <div className="flex items-center gap-4 mb-6">
                    {profile.socialLinks.website && (
                      <a 
                        href={profile.socialLinks.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a 
                        href={`https://twitter.com/${profile.socialLinks.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a 
                        href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Follow Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{profile.stats.followers}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{profile.stats.following}</span>
                    <span className="text-muted-foreground">following</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="glass p-6 text-center">
                  <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
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

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 glass">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="created" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created Events
              </TabsTrigger>
              <TabsTrigger value="attended" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Attended Events
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Created Events */}
                <Card className="glass p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Events Created
                  </h3>
                  <div className="space-y-4">
                    {createdEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-3 glass rounded-lg">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Link to="#" onClick={() => setActiveTab("created")}>
                    <Button variant="ghost" className="w-full mt-4">
                      View All Created Events
                    </Button>
                  </Link>
                </Card>

                {/* Recent Attended Events */}
                <Card className="glass p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Recent Attended Events
                  </h3>
                  <div className="space-y-4">
                    {attendedEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-3 glass rounded-lg">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Link to="#" onClick={() => setActiveTab("attended")}>
                    <Button variant="ghost" className="w-full mt-4">
                      View All Attended Events
                    </Button>
                  </Link>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="created" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Events Created</h2>
                <Link to="/create">
                  <Button className="btn-hero text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
              </div>
              
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
                    onEdit={() => console.log("Edit event:", event.id)}
                    onDelete={() => console.log("Delete event:", event.id)}
                  />
                ))}
              </div>
              
              {createdEvents.length === 0 && (
                <Card className="glass p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Events Created Yet</h3>
                  <p className="text-muted-foreground mb-6">Start creating amazing events for your community!</p>
                  <Link to="/create">
                    <Button className="btn-hero text-white">Create Your First Event</Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="attended" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Events Attended</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendedEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={{
                      ...event,
                      creator: { name: "Event Creator", avatar: "/placeholder-avatar.jpg" },
                      booked: event.attendees || 0,
                      capacity: event.capacity || 100,
                    }}
                    onBook={() => console.log("Already registered for:", event.id)}
                  />
                ))}
              </div>
              
              {attendedEvents.length === 0 && (
                <Card className="glass p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Events Attended Yet</h3>
                  <p className="text-muted-foreground mb-6">Discover amazing events happening in your area!</p>
                  <Link to="/events">
                    <Button className="btn-hero text-white">Browse Events</Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Favorite Events</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={{
                      ...event,
                      creator: { name: "Event Creator", avatar: "/placeholder-avatar.jpg" },
                      booked: event.attendees || 0,
                      capacity: event.capacity || 100,
                    }}
                    onBook={() => console.log("Register for:", event.id)}
                  />
                ))}
              </div>
              
              {favoriteEvents.length === 0 && (
                <Card className="glass p-12 text-center">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Favorite Events Yet</h3>
                  <p className="text-muted-foreground mb-6">Start bookmarking events you're interested in!</p>
                  <Link to="/events">
                    <Button className="btn-hero text-white">Browse Events</Button>
                  </Link>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
