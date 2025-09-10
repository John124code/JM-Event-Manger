import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Calendar, 
  Users, 
  Star, 
  Zap, 
  Shield, 
  Globe, 
  Heart,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Event Discovery",
      description: "AI-powered recommendations based on your interests and location"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with like-minded people and build lasting relationships"
    },
    {
      icon: Star,
      title: "Premium Experience",
      description: "Curated events with verified organizers and quality assurance"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Get instant notifications about event changes and updates"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data and payments are protected with enterprise-grade security"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Discover events worldwide or create your own local community"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Events Created", value: "15K+", icon: Calendar },
    { label: "Cities Covered", value: "200+", icon: Globe },
    { label: "Success Rate", value: "98%", icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="outline" className="text-sm">About EventHub</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Connecting People Through
            <span className="block">Amazing Experiences</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            EventHub is more than just an event platform. We're building a community where 
            passionate people discover, create, and share unforgettable experiences together.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="glass mb-16">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-4">Our Mission</CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              To democratize event discovery and creation, making it easy for anyone to find their tribe 
              and share their passions with the world.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="glass text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose EventHub?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the platform we always wanted to use - intuitive, powerful, and focused on what matters most.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <Card className="glass mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center mb-8">Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Community First</h3>
                <p className="text-muted-foreground">
                  Every decision we make prioritizes the needs and experiences of our community members.
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Trust & Safety</h3>
                <p className="text-muted-foreground">
                  We're committed to creating a safe, inclusive environment where everyone feels welcome.
                </p>
              </div>
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve our platform to deliver cutting-edge features and experiences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="glass text-center">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of event enthusiasts who are already discovering amazing experiences on EventHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button size="lg" className="btn-hero text-white px-8">
                  Discover Events
                </Button>
              </Link>
              <Link to="/create">
                <Button size="lg" variant="outline" className="px-8">
                  Create Your Event
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default About;
