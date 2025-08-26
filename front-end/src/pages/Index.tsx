import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventCard } from "@/components/events/EventCard";
import { Calendar, Users, Sparkles, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Mock data for featured events
  const featuredEvents = [
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
    }
  ];

  const stats = [
    { label: "Active Events", value: "1,200+", icon: Calendar },
    { label: "Community Members", value: "15,000+", icon: Users },
    { label: "Success Stories", value: "500+", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 hero-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 glass rounded-full text-sm font-medium text-primary mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Welcome to the Future of Events
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Create Amazing
              <span className="text-gradient block">Events Together</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover, create, and attend incredible events in your community. 
              Connect with like-minded people and make unforgettable memories.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/events">
                <Button size="lg" className="btn-hero text-white px-8 py-6 text-lg">
                  Explore Events
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/create">
                <Button variant="outline" size="lg" className="btn-glass px-8 py-6 text-lg">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass p-8 text-center card-hover">
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Events</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular events happening in your area
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onBook={() => console.log("Book event:", event.id)}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/events">
              <Button variant="outline" size="lg" className="btn-glass">
                View All Events
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Create Your First Event?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of event creators who trust our platform to bring their communities together.
            </p>
            <Link to="/create">
              <Button size="lg" className="btn-hero text-white px-8 py-6 text-lg">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
