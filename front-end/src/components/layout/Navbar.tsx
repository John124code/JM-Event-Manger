import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { Moon, Sun, Calendar, Home, Users, Settings, LogOut, User, Plus, Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
  };

    const navItems = [
    { name: 'Home', to: '/' },
    { name: 'Events', to: '/events' },
    { name: 'About', to: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-primary">
              <span className="text-white font-bold text-xl">JM</span>
            </div>
            <span className="logo-gradient text-2xl font-bold hidden sm:block">
              EventsPlatform
            </span>
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`glass-hover ${
                      isActive 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 p-0"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Right Side - Theme Toggle & Auth (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Create Event Button for logged-in users */}
            {user && (
              <Link to="/create">
                <Button size="sm" variant="outline" className="btn-glass hidden sm:flex">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </Link>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="glass-hover w-10 h-10 p-0"
            >
              {mounted && (
                resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 scale-100" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 scale-100" />
                )
              )}
            </Button>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notification Panel */}
                <NotificationPanel />
                
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link to="/create">
                    <DropdownMenuItem className="cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="btn-hero text-white px-6">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-background z-40">
          <div className="p-6 space-y-6">
            {/* Mobile Navigation */}
            <div className="space-y-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block w-full text-left p-4 rounded-lg border transition-colors text-lg font-bold ${
                      isActive 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-card border-border hover:bg-accent/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t pt-6">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-lg">{user.name}</p>
                      <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleTheme}
                    className="w-full justify-start"
                  >
                    {mounted && (
                      resolvedTheme === "dark" ? (
                        <>
                          <Sun className="w-4 h-4 mr-3" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 mr-3" />
                          Dark Mode
                        </>
                      )
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start text-destructive hover:text-destructive text-lg font-bold"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleTheme}
                    className="w-full justify-start text-lg font-bold"
                  >
                    {mounted && (
                      resolvedTheme === "dark" ? (
                        <>
                          <Sun className="w-5 h-5 mr-3" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="w-5 h-5 mr-3" />
                          Dark Mode
                        </>
                      )
                    )}
                  </Button>
                  
                  <Button 
                    size="lg" 
                    className="w-full btn-hero text-white text-lg font-bold" 
                    asChild
                  >
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};