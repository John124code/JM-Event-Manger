import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Extended mock data for all events
  const allEvents = [
    {
      id: "1",
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders for a day of cutting-edge technology discussions and networking.",
      creator: { name: "Sarah Johnson", avatar: "/placeholder-avatar.jpg" },
      date: "March 15, 2024",
      time: "9:00 AM - 6:00 PM",
      location: "San Francisco Convention Center",
      capacity: 500,
      booked: 342,
      category: "Technology",
      image: "/placeholder-tech-event.jpg"
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
    },
    {
      id: "4",
      title: "Photography Masterclass",
      description: "Learn advanced photography techniques from professional photographers.",
      creator: { name: "Alex Kim", avatar: "/placeholder-avatar4.jpg" },
      date: "April 2, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Photo Studio Downtown",
      capacity: 15,
      booked: 12,
      category: "Workshop",
      image: "/placeholder-photo.jpg"
    },
    {
      id: "5",
      title: "Startup Pitch Night",
      description: "Watch local entrepreneurs pitch their innovative ideas to investors.",
      creator: { name: "Jordan Liu", avatar: "/placeholder-avatar5.jpg" },
      date: "April 5, 2024",
      time: "6:00 PM - 9:00 PM",
      location: "Innovation Hub",
      capacity: 200,
      booked: 156,
      category: "Business",
      image: "/placeholder-pitch.jpg"
    },
    {
      id: "6",
      title: "Music Festival 2024",
      description: "Three days of amazing live music featuring local and international artists.",
      creator: { name: "Sofia Martinez", avatar: "/placeholder-avatar6.jpg" },
      date: "April 12-14, 2024",
      time: "12:00 PM - 11:00 PM",
      location: "City Park Amphitheater",
      capacity: 5000,
      booked: 3200,
      category: "Entertainment",
      image: "/placeholder-music.jpg"
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Technology", label: "Technology" },
    { value: "Workshop", label: "Workshop" },
    { value: "Community", label: "Community" },
    { value: "Business", label: "Business" },
    { value: "Entertainment", label: "Entertainment" },
  ];

  // Filter events based on search query and category
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Page Header */}
      <section className="pt-24 pb-12 hero-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="text-gradient block">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find the perfect event for you. From tech meetups to creative workshops, 
              there's something for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events, locations, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 glass">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Link to="/create">
              <Button className="btn-hero text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredEvents.length} events found
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onBook={() => console.log("Book event:", event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="glass p-12 max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or browse all categories.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="btn-glass"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;