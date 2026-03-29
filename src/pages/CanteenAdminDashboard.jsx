import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shops } from '@/data/mockData';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  Phone, 
  Save,
  X,
  AlertCircle,
  LogOut,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';

const CanteenAdminDashboard = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in as canteen admin
  useEffect(() => {
    const session = localStorage.getItem('canteenAdminSession');
    if (!session) {
      navigate('/canteen-admin/login');
      return;
    }
    
    // Check session expiry (24 hours)
    const sessionData = JSON.parse(session);
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      localStorage.removeItem('canteenAdminSession');
      toast.error('Session expired. Please login again.');
      navigate('/canteen-admin/login');
    }
  }, [navigate]);

  const [canteens, setCanteens] = useState(() => storage.get(STORAGE_KEYS.SHOPS, shops));
  const [showAddForm, setShowAddForm] = useState(true); // Always show add form by default
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    operatingHours: {
      open: '08:00',
      close: '20:00'
    },
    category: 'food',
    image: '',
    status: 'closed',
    // Canteen admin credentials
    adminEmail: '',
    adminPassword: '',
    adminName: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const persistCanteens = (updatedCanteens) => {
    setCanteens(updatedCanteens);
    storage.set(STORAGE_KEYS.SHOPS, updatedCanteens);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Canteen name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Canteen name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.operatingHours.open || !formData.operatingHours.close) {
      errors.operatingHours = 'Operating hours are required';
    } else if (formData.operatingHours.open >= formData.operatingHours.close) {
      errors.operatingHours = 'Close time must be after open time';
    }
    
    const validCategories = ['food', 'beverage', 'snacks', 'mixed'];
    if (!validCategories.includes(formData.category)) {
      errors.category = 'Please select a valid category';
    }
    
    if (formData.image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.image)) {
      errors.image = 'Please enter a valid image URL';
    }
    
    // Admin credentials validation
    if (!formData.adminName.trim()) {
      errors.adminName = 'Admin name is required';
    } else if (formData.adminName.trim().length < 2) {
      errors.adminName = 'Admin name must be at least 2 characters';
    }
    
    if (!formData.adminEmail.trim()) {
      errors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      errors.adminEmail = 'Please enter a valid email address';
    }
    
    if (!formData.adminPassword.trim()) {
      errors.adminPassword = 'Admin password is required';
    } else if (formData.adminPassword.length < 6) {
      errors.adminPassword = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      operatingHours: {
        open: '08:00',
        close: '20:00'
      },
      category: 'food',
      image: '',
      status: 'closed',
      // Reset admin credentials
      adminEmail: '',
      adminPassword: '',
      adminName: ''
    });
    setFormErrors({});
  };

  const handleAddCanteen = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const newCanteen = {
      id: `s${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      operatingHours: formData.operatingHours,
      category: formData.category,
      image: formData.image.trim() || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=600&h=400&fit=crop`,
      status: formData.status,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString(),
      // Add canteen admin credentials
      adminCredentials: {
        name: formData.adminName.trim(),
        email: formData.adminEmail.trim(),
        password: formData.adminPassword.trim()
      }
    };

    const updatedCanteens = [...canteens, newCanteen];
    persistCanteens(updatedCanteens);
    
    // Also save to canteen admins storage for login system
    const existingAdmins = JSON.parse(localStorage.getItem('canteenAdmins') || '[]');
    const newAdmin = {
      id: `admin_${Date.now()}`,
      canteenId: newCanteen.id,
      canteenName: newCanteen.name,
      name: formData.adminName.trim(),
      email: formData.adminEmail.trim(),
      password: formData.adminPassword.trim(),
      role: 'canteen_owner',
      createdAt: new Date().toISOString()
    };
    existingAdmins.push(newAdmin);
    localStorage.setItem('canteenAdmins', JSON.stringify(existingAdmins));
    
    toast.success(`Canteen "${newCanteen.name}" has been added successfully! Admin credentials created.`);
    resetForm();
    // Keep form open for adding more canteens
  };

  const handleDeleteCanteen = (canteenId) => {
    const canteen = canteens.find(c => c.id === canteenId);
    if (!canteen) return;

    if (window.confirm(`Are you sure you want to delete "${canteen.name}"? This action cannot be undone.`)) {
      const updatedCanteens = canteens.filter(c => c.id !== canteenId);
      persistCanteens(updatedCanteens);
      toast.success(`Canteen "${canteen.name}" has been deleted successfully!`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('canteenAdminSession');
    toast.success('Logged out successfully');
    navigate('/canteen-admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Add New Canteen</h1>
                <p className="text-xs text-muted-foreground">Canteen Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'View Canteens' : 'Add Canteen'}
              </Button>
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
        {showAddForm ? (
          /* Add Canteen Form - Always Visible */
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Add New Canteen
                </CardTitle>
                <CardDescription>
                  Fill in the details to add a new canteen to the SLIIT Canteen Management System
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Canteen Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Main Cafeteria"
                      className={formErrors.name ? 'border-destructive' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full p-2 border rounded-md bg-background ${formErrors.category ? 'border-destructive' : ''}`}
                    >
                      <option value="food">Food Court</option>
                      <option value="beverage">Beverage Shop</option>
                      <option value="snacks">Snack Bar</option>
                      <option value="mixed">Mixed</option>
                    </select>
                    {formErrors.category && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the canteen, its specialties, and atmosphere..."
                    rows={3}
                    className={formErrors.description ? 'border-destructive' : ''}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address *</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="e.g., Building A, Ground Floor"
                      className={formErrors.address ? 'border-destructive' : ''}
                    />
                    {formErrors.address && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g., +94 11 234 5678"
                      className={formErrors.phone ? 'border-destructive' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operating Hours *</label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Opening Time</label>
                      <Input
                        type="time"
                        value={formData.operatingHours.open}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          operatingHours: { ...prev.operatingHours, open: e.target.value }
                        }))}
                        className={formErrors.operatingHours ? 'border-destructive' : ''}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Closing Time</label>
                      <Input
                        type="time"
                        value={formData.operatingHours.close}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          operatingHours: { ...prev.operatingHours, close: e.target.value }
                        }))}
                        className={formErrors.operatingHours ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>
                  {formErrors.operatingHours && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.operatingHours}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="closed">Closed (Start Closed)</option>
                    <option value="open">Open (Start Open)</option>
                  </select>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL (Optional)</label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className={formErrors.image ? 'border-destructive' : ''}
                  />
                  {formErrors.image && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.image}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use a random image. Must be a valid image URL (jpg, png, gif, webp).
                  </p>
                </div>

                {/* Canteen Admin Credentials */}
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Canteen Admin Credentials
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create login credentials for the canteen admin to manage their canteen dashboard
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admin Name *</label>
                      <Input
                        value={formData.adminName}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                        placeholder="e.g., John Doe"
                        className={formErrors.adminName ? 'border-destructive' : ''}
                      />
                      {formErrors.adminName && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.adminName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admin Email *</label>
                      <Input
                        value={formData.adminEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                        placeholder="admin@canteen.com"
                        type="email"
                        className={formErrors.adminEmail ? 'border-destructive' : ''}
                      />
                      {formErrors.adminEmail && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.adminEmail}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admin Password *</label>
                      <Input
                        value={formData.adminPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                        placeholder="••••••••"
                        type="password"
                        className={formErrors.adminPassword ? 'border-destructive' : ''}
                      />
                      {formErrors.adminPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.adminPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Important:</strong> These credentials will be used by the canteen admin to log into their dashboard. 
                      Please save this information securely and share it with the canteen administrator.
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleAddCanteen}>
                    <Save className="mr-2 h-4 w-4" />
                    Add Canteen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Canteens List View - Show All Canteens */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">All Canteens ({canteens.length})</h2>
                <p className="text-muted-foreground mt-1">
                  View and manage all canteens in the system
                </p>
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Canteen
              </Button>
            </div>
            
            {canteens.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Canteens Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    No canteens have been added to the system yet.
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Canteen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-primary">{canteens.length}</div>
                      <div className="text-sm text-muted-foreground">Total Canteens</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {canteens.filter(c => c.status === 'open').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Currently Open</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-500/5 border-orange-500/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {canteens.filter(c => c.status === 'closed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Currently Closed</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Canteens Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {canteens.map((canteen) => (
                    <Card key={canteen.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img 
                          src={canteen.image} 
                          alt={canteen.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{canteen.name}</h3>
                              <Badge variant={canteen.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                                {canteen.status === 'open' ? '● Open' : '● Closed'}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="mb-3 text-xs capitalize">
                              {canteen.category}
                            </Badge>
                            <p className="text-muted-foreground text-sm line-clamp-2">{canteen.description}</p>
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCanteen(canteen.id)}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{canteen.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{canteen.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{canteen.operatingHours.open} - {canteen.operatingHours.close}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Added: {new Date(canteen.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${canteen.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <span>{canteen.status === 'open' ? 'Active' : 'Inactive'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* List View Alternative */}
                <div className="mt-8">
                  <Card className="border-dashed border-muted-foreground/30">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4">Quick List View</h4>
                      <div className="space-y-2">
                        {canteens.map((canteen) => (
                          <div key={canteen.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${canteen.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <span className="font-medium">{canteen.name}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {canteen.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {canteen.operatingHours.open} - {canteen.operatingHours.close}
                              </span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCanteen(canteen.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CanteenAdminDashboard;
