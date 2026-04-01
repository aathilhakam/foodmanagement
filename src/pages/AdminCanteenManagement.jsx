import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const AdminCanteenManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Only allow super_admin to access this page
  if (!user || user.role !== 'super_admin') {
    navigate('/dashboard');
    return null;
  }

  const [canteens, setCanteens] = useState(() => storage.get(STORAGE_KEYS.SHOPS, shops));
  const [isAddingCanteen, setIsAddingCanteen] = useState(false);
  const [editingCanteen, setEditingCanteen] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    operatingHours: {
      open: '08:00',
      close: '20:00'
    },
    category: 'food',
    image: '',
    status: 'closed'
  });
  const [formErrors, setFormErrors] = useState({});

  const persistCanteens = (updatedCanteens) => {
    setCanteens(updatedCanteens);
    storage.set(STORAGE_KEYS.SHOPS, updatedCanteens);
  };

  const handleToggleCanteenStatus = (canteenId) => {
    const updatedCanteens = canteens.map(canteen => {
      if (canteen.id === canteenId) {
        const newStatus = canteen.status === 'open' ? 'closed' : 'open';
        return { ...canteen, status: newStatus };
      }
      return canteen;
    });
    persistCanteens(updatedCanteens);
    
    // Force update all components by dispatching a custom event
    window.dispatchEvent(new CustomEvent('canteenStatusChanged', {
      detail: {
        canteenId,
        newStatus: updatedCanteens.find(c => c.id === canteenId)?.status,
        allCanteens: updatedCanteens
      }
    }));
    
    // Also trigger localStorage change event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sliit_eats_shops_v1',
      newValue: JSON.stringify(updatedCanteens)
    }));
    
    const updatedCanteen = updatedCanteens.find(c => c.id === canteenId);
    if (updatedCanteen) {
      toast.success(`Canteen "${updatedCanteen.name}" is now ${updatedCanteen.status}`);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
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
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Please enter a valid website URL (e.g., https://example.com)';
    }
    
    // Operating hours validation
    if (!formData.operatingHours.open || !formData.operatingHours.close) {
      errors.operatingHours = 'Operating hours are required';
    } else if (formData.operatingHours.open >= formData.operatingHours.close) {
      errors.operatingHours = 'Close time must be after open time';
    }
    
    // Category validation
    const validCategories = ['food', 'beverage', 'snacks', 'mixed'];
    if (!validCategories.includes(formData.category)) {
      errors.category = 'Please select a valid category';
    }
    
    // Image URL validation
    if (formData.image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.image)) {
      errors.image = 'Please enter a valid image URL';
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
      email: '',
      website: '',
      operatingHours: {
        open: '08:00',
        close: '20:00'
      },
      category: 'food',
      image: '',
      status: 'closed'
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
      email: formData.email.trim(),
      website: formData.website.trim(),
      operatingHours: formData.operatingHours,
      category: formData.category,
      image: formData.image.trim() || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=600&h=400&fit=crop`,
      status: formData.status,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString()
    };

    const updatedCanteens = [...canteens, newCanteen];
    persistCanteens(updatedCanteens);
    
    toast.success(`Canteen "${newCanteen.name}" has been added successfully!`);
    resetForm();
    setIsAddingCanteen(false);
  };

  const handleEditCanteen = (canteen) => {
    setEditingCanteen(canteen);
    setFormData({
      name: canteen.name,
      description: canteen.description,
      address: canteen.address,
      phone: canteen.phone,
      email: canteen.email || '',
      website: canteen.website || '',
      operatingHours: canteen.operatingHours,
      category: canteen.category,
      image: canteen.image,
      status: canteen.status
    });
    setFormErrors({});
  };

  const handleUpdateCanteen = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const updatedCanteens = canteens.map(c => 
      c.id === editingCanteen.id 
        ? { 
            ...c, 
            name: formData.name.trim(),
            description: formData.description.trim(),
            address: formData.address.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            website: formData.website.trim(),
            operatingHours: formData.operatingHours,
            category: formData.category,
            image: formData.image.trim(),
            status: formData.status,
            updatedAt: new Date().toISOString()
          }
        : c
    );

    persistCanteens(updatedCanteens);
    
    toast.success(`Canteen "${formData.name}" has been updated successfully!`);
    resetForm();
    setEditingCanteen(null);
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

  const CanteenForm = ({ isEdit = false }) => (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {isEdit ? 'Edit Canteen' : 'Add New Canteen'}
        </CardTitle>
        <CardDescription>
          {isEdit ? 'Update the canteen information below.' : 'Fill in the details to add a new canteen to the system.'}
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="canteen@example.com"
              type="email"
              className={formErrors.email ? 'border-destructive' : ''}
            />
            {formErrors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.email}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className={formErrors.website ? 'border-destructive' : ''}
            />
            {formErrors.website && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.website}
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

        {/* Form Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={isEdit ? handleUpdateCanteen : handleAddCanteen}>
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Update Canteen' : 'Add Canteen'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsAddingCanteen(false);
              setEditingCanteen(null);
              resetForm();
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Canteen Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and remove canteens in the SLIIT Canteen Management System
          </p>
        </div>

        {/* Add Canteen Button */}
        {!isAddingCanteen && !editingCanteen && (
          <div className="mb-6">
            <Button onClick={() => setIsAddingCanteen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add New Canteen
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAddingCanteen || editingCanteen) && (
          <div className="mb-8">
            <CanteenForm isEdit={!!editingCanteen} />
          </div>
        )}

        {/* Canteens List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Existing Canteens ({canteens.length})</h2>
          
          {canteens.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No canteens have been added yet.</p>
                <p className="text-sm">Click "Add New Canteen" to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {canteens.map((canteen) => (
                <Card key={canteen.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{canteen.name}</h3>
                          <Badge variant={canteen.status === 'open' ? 'default' : 'secondary'}>
                            {canteen.status === 'open' ? '● Open' : '● Closed'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {canteen.category}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{canteen.description}</p>
                        
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{canteen.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{canteen.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{canteen.operatingHours.open} - {canteen.operatingHours.close}</span>
                          </div>
                          {canteen.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{canteen.email}</span>
                            </div>
                          )}
                          {canteen.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a href={canteen.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Status</span>
                          <Switch 
                            checked={canteen.status === 'open'} 
                            onCheckedChange={() => handleToggleCanteenStatus(canteen.id)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCanteen(canteen)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCanteen(canteen.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCanteenManagement;
