import { useState, useEffect } from "react";
import { offers as seedOffers, shops as seedShops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/simple-dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Pin, 
  Tag, 
  Calendar, 
  Percent,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";

const OfferManagement = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [shops, setShops] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState("all");
  
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    discountPercent: 10,
    couponCode: "",
    validUntil: "",
    shopId: "",
    isPinned: false,
    active: true
  });

  useEffect(() => {
    const storedOffers = storage.get(STORAGE_KEYS.OFFERS, seedOffers);
    const storedShops = storage.get(STORAGE_KEYS.SHOPS, seedShops);
    setOffers(storedOffers);
    setShops(storedShops);
  }, []);

  const persistOffers = (updatedOffers) => {
    setOffers(updatedOffers);
    storage.set(STORAGE_KEYS.OFFERS, updatedOffers);
  };

  const handleCreateOffer = () => {
    if (!user || !user.shopId) {
      toast.error("You must be a canteen admin to create offers");
      return;
    }

    const { title, description, discountPercent, couponCode, validUntil, isPinned } = newOffer;

    if (!title || !description || !couponCode || !validUntil) {
      toast.error("Please fill all required fields");
      return;
    }

    const offer = {
      id: `o-${Date.now()}`,
      title,
      description,
      discountPercent,
      couponCode,
      validUntil,
      shopId: user.shopId,
      shopName: shops.find(s => s.id === user.shopId)?.name || "Unknown Canteen",
      isPinned,
      active: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    persistOffers([offer, ...offers]);
    setNewOffer({
      title: "",
      description: "",
      discountPercent: 10,
      couponCode: "",
      validUntil: "",
      shopId: "",
      isPinned: false,
      active: true
    });
    setIsCreating(false);
    toast.success("Offer created successfully!");
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      discountPercent: offer.discountPercent,
      couponCode: offer.couponCode,
      validUntil: offer.validUntil,
      shopId: offer.shopId,
      isPinned: offer.isPinned,
      active: offer.active
    });
    setIsCreating(true);
  };

  const handleUpdateOffer = () => {
    if (!editingOffer) return;

    const updatedOffers = offers.map(offer =>
      offer.id === editingOffer.id
        ? {
            ...offer,
            title: newOffer.title,
            description: newOffer.description,
            discountPercent: newOffer.discountPercent,
            couponCode: newOffer.couponCode,
            validUntil: newOffer.validUntil,
            isPinned: newOffer.isPinned,
            active: newOffer.active
          }
        : offer
    );

    persistOffers(updatedOffers);
    setIsCreating(false);
    setEditingOffer(null);
    setNewOffer({
      title: "",
      description: "",
      discountPercent: 10,
      couponCode: "",
      validUntil: "",
      shopId: "",
      isPinned: false,
      active: true
    });
    toast.success("Offer updated successfully!");
  };

  const handleDeleteOffer = (offerId) => {
    const updatedOffers = offers.filter(offer => offer.id !== offerId);
    persistOffers(updatedOffers);
    toast.success("Offer deleted successfully!");
  };

  const handleTogglePin = (offerId) => {
    const updatedOffers = offers.map(offer =>
      offer.id === offerId ? { ...offer, isPinned: !offer.isPinned } : offer
    );
    persistOffers(updatedOffers);
  };

  const handleToggleActive = (offerId) => {
    const updatedOffers = offers.map(offer =>
      offer.id === offerId ? { ...offer, active: !offer.active } : offer
    );
    persistOffers(updatedOffers);
  };

  // Filter offers based on user role and search
  const filteredOffers = offers.filter(offer => {
    const matchesUser = !user || user.role === 'super_admin' || offer.shopId === user.shopId;
    const matchesSearch = !searchQuery || 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.couponCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShop = selectedShop === "all" || offer.shopId === selectedShop;
    
    return matchesUser && matchesSearch && matchesShop;
  });

  if (!user || (user.role !== 'shop_admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-8 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You must be a canteen admin to manage offers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <Tag className="h-7 w-7 text-primary" />
          Offer Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage promotional offers for your canteen.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offers..."
            className="pl-10"
          />
        </div>
        
        {user.role === 'super_admin' && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by canteen:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedShop("all")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedShop === "all" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All Canteens
              </button>
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShop(shop.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedShop === shop.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {shop.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Offer Button */}
      <div className="mb-6">
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingOffer ? "Edit Offer" : "Create New Offer"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Offer Title</Label>
                <Input
                  id="title"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Weekend Special"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newOffer.description}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your offer..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={newOffer.discountPercent}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <Input
                    id="couponCode"
                    value={newOffer.couponCode}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g., WEEKEND20"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={newOffer.validUntil}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="pin-offer"
                  checked={newOffer.isPinned}
                  onCheckedChange={(checked) => setNewOffer(prev => ({ ...prev, isPinned: checked }))}
                />
                <Label htmlFor="pin-offer">Pin this offer (will appear at the top)</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={editingOffer ? handleUpdateOffer : handleCreateOffer}
                  className="flex-1"
                >
                  {editingOffer ? "Update Offer" : "Create Offer"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingOffer(null);
                    setNewOffer({
                      title: "",
                      description: "",
                      discountPercent: 10,
                      couponCode: "",
                      validUntil: "",
                      shopId: "",
                      isPinned: false,
                      active: true
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No offers found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedShop !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Create your first offer to get started"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base">{offer.title}</CardTitle>
                      {offer.isPinned && (
                        <Badge className="bg-primary">
                          <Pin className="mr-1 h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      <Badge variant={offer.active ? "default" : "secondary"}>
                        {offer.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {offer.shopName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Valid until {offer.validUntil}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Percent className="mr-1 h-3 w-3" />
                      {offer.discountPercent}% OFF
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Code: <span className="font-mono bg-muted px-2 py-1 rounded">{offer.couponCode}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOffer(offer)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePin(offer.id)}
                    >
                      <Pin className="h-4 w-4 mr-1" />
                      {offer.isPinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(offer.id)}
                    >
                      {offer.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteOffer(offer.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OfferManagement;
