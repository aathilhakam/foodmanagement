import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { offers as seedOffers, shops, blogPosts, comments } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Pin, LayoutDashboard, FileText, MessageCircle, UtensilsCrossed, TicketPercent, Eye, EyeOff } from "lucide-react";

const ShopAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== "shop_admin") return navigate("/");

  const shop = shops.find((s) => s.id === user.shopId);
  const posts = blogPosts.filter((p) => p.shopId === user.shopId);
  const postComments = comments.filter((c) => posts.some((p) => p.id === c.postId));

  const [offers, setOffers] = useState(() => storage.get(STORAGE_KEYS.OFFERS, seedOffers));
  const [canteenStatus, setCanteenStatus] = useState(shop?.status || "closed");
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    discountPercent: 10,
    couponCode: "",
    validUntil: "",
  });

  const myOffers = useMemo(() => offers.filter((o) => o.shopId === user.shopId), [offers, user.shopId]);

  const persistOffers = (next) => {
    setOffers(next);
    storage.set(STORAGE_KEYS.OFFERS, next);
  };

  const handleCreateOffer = () => {
    const title = newOffer.title.trim();
    const description = newOffer.description.trim();
    const couponCode = newOffer.couponCode.trim();
    const discountPercent = Number(newOffer.discountPercent);
    const validUntil = newOffer.validUntil.trim();

    if (!title || !couponCode || !Number.isFinite(discountPercent) || discountPercent <= 0) return;

    // Validate date range - coupon must be valid for at least 7 days and max 1 year
    const today = new Date();
    const validUntilDate = validUntil ? new Date(validUntil) : null;
    
    if (validUntilDate) {
      const minDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
      const maxDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
      
      if (validUntilDate < minDate || validUntilDate > maxDate) {
        alert('Coupon must be valid between 7 days and 1 year from today');
        return;
      }
    }

    const offer = {
      id: `o-${Date.now()}`,
      shopId: user.shopId,
      title,
      description,
      discountPercent,
      couponCode,
      active: true,
      validUntil: validUntil || "2026-12-31",
      createdAt: new Date().toISOString(),
    };

    persistOffers([offer, ...offers]);
    setNewOffer({ title: "", description: "", discountPercent: 10, couponCode: "", validUntil: "" });
  };

  const handleToggleOffer = (offerId) => {
    persistOffers(offers.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o)));
  };

  const handleDeleteOffer = (offerId) => {
    persistOffers(offers.filter((o) => o.id !== offerId));
  };

  const handleToggleCanteenStatus = () => {
    const newStatus = canteenStatus === "open" ? "closed" : "open";
    setCanteenStatus(newStatus);
    // In a real app, this would update the backend
    console.log(`Canteen status changed to: ${newStatus}`);
  };

  const handleNavigateToPosts = () => {
    navigate("/dashboard/posts");
  };

  const handleNavigateToComments = () => {
    navigate("/article-management");
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Canteen Dashboard <span className="text-primary">•</span> {shop?.name}
        </h1>
        <p className="mt-1 text-muted-foreground">Manage your canteen, posts, articles, and offers.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {/* Canteen Status Card */}
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Canteen Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${canteenStatus === "open" ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-semibold ${canteenStatus === "open" ? "text-green-600" : "text-red-600"}`}>
                  {canteenStatus === "open" ? "Open" : "Closed"}
                </span>
              </div>
              <Switch 
                checked={canteenStatus === "open"} 
                onCheckedChange={handleToggleCanteenStatus}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {canteenStatus === "open" ? "Orders are being accepted" : "Orders are currently disabled"}
            </p>
          </CardContent>
        </Card>

        {/* Total Posts Card - Clickable */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={handleNavigateToPosts}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{posts.length}</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Click to manage posts</p>
          </CardContent>
        </Card>

        {/* Articles Card - Clickable */}
        <Card 
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
          onClick={handleNavigateToComments}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">{posts.length}</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Click to manage articles</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-primary" />
            Offers & Coupons
          </CardTitle>
          <Badge variant="secondary">{myOffers.length}</Badge>
        </CardHeader>

        <CardContent className="space-y-4">

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Input
              value={newOffer.title}
              onChange={(e) => setNewOffer((p) => ({ ...p, title: e.target.value }))}
              placeholder="Offer title (e.g., Lunch Combo Deal)"
              className="bg-card/40"
            />
            <Input
              value={newOffer.description}
              onChange={(e) => setNewOffer((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)"
              className="bg-card/40"
            />
          </div>
          <div className="space-y-2">
            <Input
              value={newOffer.couponCode}
              onChange={(e) => setNewOffer((p) => ({ ...p, couponCode: e.target.value.toUpperCase() }))}
              placeholder="Coupon code (e.g., PNS10)"
              className="bg-card/40"
            />
            <Input
              type="number"
              min={1}
              max={100}
              value={newOffer.discountPercent}
              onChange={(e) => setNewOffer((p) => ({ ...p, discountPercent: e.target.value }))}
              placeholder="Discount %"
              className="bg-card/40"
            />
            <Input 
              type="date" 
              value={newOffer.validUntil} 
              onChange={(e) => setNewOffer((p) => ({ ...p, validUntil: e.target.value }))} 
              className="bg-card/40"
              min={new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
              max={new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="mt-3">
          <Button variant="hero" size="sm" onClick={handleCreateOffer}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Publish Offer
          </Button>
        </div>

        <div className="space-y-3">
          {myOffers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background/50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{offer.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {offer.discountPercent}% OFF
                  </Badge>
                  {offer.active ? (
                    <Badge className="status-open border-0">Active</Badge>
                  ) : (
                    <Badge className="status-closed border-0">Inactive</Badge>
                  )}
                </div>
                {offer.description && <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Coupon: <span className="font-mono text-foreground">{offer.couponCode}</span> • Valid until {offer.validUntil}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <Switch checked={!!offer.active} onCheckedChange={() => handleToggleOffer(offer.id)} />
                </div>
                <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteOffer(offer.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {myOffers.length === 0 && <p className="py-6 text-center text-muted-foreground">No offers yet. Publish your first offer above.</p>}
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Posts</span>
            <Button variant="hero" size="sm" onClick={handleNavigateToPosts}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Manage Posts
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4">
                <div>
                  <h4 className="font-medium">{post.title}</h4>
                  <div className="mt-1 flex gap-2">
                    {post.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p className="py-8 text-center text-muted-foreground">No posts yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopAdminDashboard;
