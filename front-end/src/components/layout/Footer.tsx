import { Link } from "react-router-dom";
import { Calendar, Mail, MapPin, Phone, Twitter, Linkedin, Globe, Shield, Heart, Zap, Users, Star, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Footer = () => {
  const footerLinks = {
    platform: [
      { label: "About Us", href: "/about" },
      { label: "Events", href: "/events" },
      { label: "Create Event", href: "/create" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Live Chat", href: "/chat" },
      { label: "API Documentation", href: "/api-docs" },
      { label: "Status Page", href: "/status" },
      { label: "Report Bug", href: "/bug-report" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR Compliance", href: "/gdpr" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Refund Policy", href: "/refunds" },
    ],
    community: [
      { label: "Blog", href: "/blog" },
      { label: "Community Guidelines", href: "/guidelines" },
      { label: "Event Guidelines", href: "/event-guidelines" },
      { label: "Success Stories", href: "/stories" },
      { label: "Ambassador Program", href: "/ambassadors" },
      { label: "Partner with Us", href: "/partners" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/JohnOnStack", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/in/john-olawoye-b16657361", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/John124code", label: "GitHub" },
  ];

  const features = [
    { icon: Shield, title: "Secure & Safe", description: "Your data is protected with enterprise-grade security" },
    { icon: Zap, title: "Lightning Fast", description: "Create and discover events in seconds" },
    { icon: Users, title: "Community Driven", description: "Join a thriving community of event creators" },
    { icon: Heart, title: "Made with Love", description: "Crafted by passionate event enthusiasts" },
  ];

  const stats = [
    { label: "Events Created", value: "12,500+" },
    { label: "Happy Users", value: "50,000+" },
    { label: "Cities Covered", value: "200+" },
    { label: "Success Rate", value: "98%" },
  ];

  return (
    <footer className="glass border-t mt-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border/50">
          <div className="glass p-8 rounded-xl text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-gradient">
              Stay in the Loop
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get the latest updates on amazing events, exclusive offers, and community highlights 
              delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                placeholder="Enter your email address"
                className="glass flex-1"
              />
              <Button className="btn-hero text-white px-6">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 border-b border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 border-b border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-primary">
                  <span className="text-white font-bold text-xl">JM</span>
                </div>
                <span className="logo-gradient text-2xl font-bold">
                  EventsPlatform
                </span>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                The ultimate platform for creating, discovering, and attending amazing events. 
                Connect with your community, build lasting relationships, and create unforgettable experiences.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">miracleolawoye7@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">+234 9137917087</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">Lagos, Nigeria.</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Secured
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  5.0 Rating
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Global Platform
                </Badge>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                Platform
              </h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => {
                  // Only make these specific links clickable
                  const clickableLinks = ["/about", "/events", "/create", "/dashboard"];
                  const isClickable = clickableLinks.includes(link.href);
                  
                  return (
                    <li key={link.href}>
                      {isClickable ? (
                        <Link
                          to={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm hover:underline"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm cursor-default">
                          {link.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <span className="text-muted-foreground text-sm cursor-default">
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <span className="text-muted-foreground text-sm cursor-default">
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Community</h3>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.href}>
                    <span className="text-muted-foreground text-sm cursor-default">
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2024 JM EventsPlatform. All rights reserved. Made with ❤️ for the community.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-muted/50 hover:bg-primary/10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>
            
            {/* Language & Region */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};