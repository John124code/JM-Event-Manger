import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  BarChart3,
  Shield,
  Bell
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need admin privileges to access this page.
          </p>
          <Link to="/dashboard">
            <Button className="btn-hero text-white">
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const adminNavItems = [
    {
      href: "/admin",
      label: "Overview",
      icon: BarChart3,
      isActive: location.pathname === "/admin",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      isActive: location.pathname === "/admin/users",
    },
    {
      href: "/admin/events",
      label: "Events",
      icon: Calendar,
      isActive: location.pathname === "/admin/events",
    },
    {
      href: "/admin/transactions",
      label: "Transactions",
      icon: DollarSign,
      isActive: location.pathname === "/admin/transactions",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      isActive: location.pathname === "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Admin Navigation */}
          <div className="mb-6">
            <div className="flex items-center space-x-1 p-1 bg-secondary/20 rounded-lg">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md transition-all
                    ${item.isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Content */}
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
};
