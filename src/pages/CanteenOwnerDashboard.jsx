import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shops } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Star, 
  Clock, 
  Phone, 
  MapPin,
  LogOut,
  Settings,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const CanteenOwnerDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [canteen, setCanteen] = useState(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('canteenOwnerSession');
    if (!sessionData) {
      navigate('/canteen-owner/login');
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);

    // Check session expiry (24 hours)
    const loginTime = new Date(parsedSession.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      localStorage.removeItem('canteenOwnerSession');
      toast.error('Session expired. Please login again.');
      navigate('/canteen-owner/login');
      return;
    }

    // Find the canteen
    const allCanteens = JSON.parse(localStorage.getItem('sliit_eats_shops_v1') || '[]');
    const userCanteen = allCanteens.find(c => c.id === parsedSession.canteenId);
    setCanteen(userCanteen);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('canteenOwnerSession');
    toast.success('Logged out successfully');
    navigate('/canteen-owner/login');
  };

  if (!session || !canteen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-500 rounded">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{canteen.name}</h1>
                <p className="text-xs text-muted-foreground">Canteen Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {session.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Canteen Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your canteen operations and view performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-blue-700">Total Customers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">Rs. 45,678</div>
              <div className="text-sm text-green-700">Monthly Revenue</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">4.5</div>
              <div className="text-sm text-orange-700">Average Rating</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">+12%</div>
              <div className="text-sm text-purple-700">Growth Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Canteen Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Canteen Information
              </CardTitle>
              <CardDescription>
                Your canteen details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={canteen.status === 'open' ? 'default' : 'secondary'}>
                  {canteen.status === 'open' ? '● Open' : '● Closed'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Category</span>
                <Badge variant="outline" className="capitalize">
                  {canteen.category}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Operating Hours</span>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{canteen.operatingHours.open} - {canteen.operatingHours.close}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Contact</span>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{canteen.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{canteen.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Manage your canteen settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Update Canteen Info
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Update Operating Hours
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Update Contact Details
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Star className="mr-2 h-4 w-4" />
                View Customer Reviews
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Sales Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities in your canteen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Customer review received</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Daily sales target achieved</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CanteenOwnerDashboard;
