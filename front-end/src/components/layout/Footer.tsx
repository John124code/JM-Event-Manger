import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="footer-glass border-t border-border/50 mt-auto">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-6 lg:gap-6">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left md:col-span-2 lg:col-span-1 order-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-primary">
                <span className="text-white font-bold text-base sm:text-lg lg:text-xl">JM</span>
              </div>
              <span className="logo-gradient text-lg sm:text-xl lg:text-2xl font-bold">
                EventsPlatform
              </span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed max-w-xs mx-auto sm:mx-0">
              Discover amazing events and create unforgettable experiences with our comprehensive event management platform.
            </p>
            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass-hover w-8 h-8 sm:w-10 sm:h-10 p-0 hover:scale-110 transition-transform"
                asChild
              >
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass-hover w-8 h-8 sm:w-10 sm:h-10 p-0 hover:scale-110 transition-transform"
                asChild
              >
                <a 
                  href="https://x.com/JohnOnStack" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Follow @JohnOnStack on X"
                >
                  <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass-hover w-8 h-8 sm:w-10 sm:h-10 p-0 hover:scale-110 transition-transform"
                asChild
              >
                <a 
                  href="https://instagram.com/bukunmiola20" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Follow @bukunmiola20 on Instagram"
                >
                  <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="glass-hover w-8 h-8 sm:w-10 sm:h-10 p-0 hover:scale-110 transition-transform"
                asChild
              >
                <a 
                  href="https://linkedin.com/in/john-olawoye-b16657361" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Connect with John Olawoye on LinkedIn"
                >
                  <Linkedin className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 text-center order-2 md:order-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left order-3">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm lg:text-base hover:underline">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left order-4 md:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Stay Connected</h3>
            
            {/* Contact Info */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-xs sm:text-sm lg:text-base">johnolawoye@gmail,com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-xs sm:text-sm lg:text-base">09137917087</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-xs sm:text-sm lg:text-base">Lagos, Nigeria</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">Subscribe to our newsletter</p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="glass flex-1 text-xs sm:text-sm h-8 sm:h-10"
                />
                <Button size="sm" className="btn-hero text-white whitespace-nowrap h-8 sm:h-10 text-xs sm:text-sm">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 pt-6 mt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-center lg:text-left">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                © 2025 JM EventsPlatform. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors hover:underline">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors hover:underline">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};