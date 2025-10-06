import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Eye,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  BarChart3
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

// Component that handles admin authentication and renders the dashboard
const AdminDashboardContent = () => {
  const { 
    stats, 
    users, 
    events, 
    transactions, 
    recentActivity, 
    loading, 
    error,
    banUser,
    unbanUser,
    approveEvent,
    rejectEvent,
    refreshData 
  } = useAdmin();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'event_created':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case 'event_cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'banned':
        return <Badge className="bg-red-500 text-white">Banned</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500 text-white">Cancelled</Badge>;
      case 'paid':
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-500 text-white">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your event platform
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={refreshData} 
                  variant="outline" 
                  className="btn-glass"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button variant="outline" className="btn-glass">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(stats.totalUsers)}</p>
                  <p className="text-sm text-green-500">+{stats.monthlyGrowth.users}% this month</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalEvents}</p>
                  <p className="text-sm text-green-500">+{stats.monthlyGrowth.events}% this month</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">${formatNumber(stats.totalRevenue)}</p>
                  <p className="text-sm text-green-500">+{stats.monthlyGrowth.revenue}% this month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="glass p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                  <p className="text-3xl font-bold text-foreground">{stats.activeEvents}</p>
                  <p className="text-sm text-yellow-500">{stats.pendingEvents} pending approval</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pending Events */}
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Pending Events</h3>
                <Badge variant="secondary">{events.filter(e => e.status === 'pending').length}</Badge>
              </div>
              
              <div className="space-y-3">
                {events.filter(e => e.status === 'pending').slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">by {event.creator.name}</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button 
                        size="sm" 
                        onClick={() => approveEvent(event.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 h-auto"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => rejectEvent(event.id)}
                        className="px-2 py-1 h-auto"
                      >
                        <XCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {events.filter(e => e.status === 'pending').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No pending events</p>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="glass p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Users & Events Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* All Registered Users */}
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">All Registered Users ({users.length})</h3>
                <Button variant="outline" size="sm" className="btn-glass">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.role === 'admin' ? '👑 Admin' : '👤 User'} • 
                            Joined: {new Date(user.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(user.status)}
                        {user.role !== 'admin' && (
                          user.status === 'active' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => banUser(user.id)}
                              className="px-2 py-1 h-auto text-xs"
                            >
                              <UserX className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => unbanUser(user.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 h-auto"
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">No users registered yet</p>
                    <p className="text-sm text-muted-foreground">Users will appear here when they register for events</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                <Link to="/admin/transactions">
                  <Button variant="outline" size="sm" className="btn-glass">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{transaction.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">{transaction.userName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {transaction.currency === 'USD' ? '$' : '₦'}{transaction.amount.toLocaleString()}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Main component that handles authentication before rendering admin content
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  if (!user) {
    navigate("/login");
    return null;
  }

  if (user.role !== 'admin') {
    navigate("/dashboard");
    return null;
  }

  // Only render admin content if user is authenticated and is admin
  return <AdminDashboardContent />;
};

export default AdminDashboard;
