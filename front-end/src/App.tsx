import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { EventsProvider } from "./contexts/EventsContext";
import { AdminProvider } from "./contexts/AdminContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Events from "./pages/Events";
import About from "./pages/About";
import Login from "./pages/Login";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EventDetails from "./pages/EventDetails";
import EventAnalytics from "./pages/EventAnalytics";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="jm-events-ui-theme">
        <AuthProvider>
          <EventsProvider>
            <UserProfileProvider>
              <AdminProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/events/:id" element={<EventDetails />} />
                      <Route path="/events/:eventId/payment" element={<Payment />} />
                      <Route path="/events/:eventId/analytics" element={<EventAnalytics />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/create" element={<CreateEvent />} />
                      <Route path="/edit" element={<EditEvent />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </AdminProvider>
            </UserProfileProvider>
          </EventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
