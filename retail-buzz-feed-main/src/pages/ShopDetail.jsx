import { useParams, Link } from "react-router-dom";
import { shops as seedShops, foodItems as seedFoodItems, blogPosts as seedBlogPosts } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import BlogCard from "@/components/BlogCard";
import CartItem from "@/components/CartItem";
import LoyaltyRewards from "@/components/LoyaltyRewards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, ArrowLeft, UtensilsCrossed, ShoppingCart, Plus } from "lucide-react";
import { toast } from "sonner";

// Canteen-specific point calculation rates
const CANTEEN_POINTS_RATES = {
  's1': 1000,  // P&S Canteen: Spend 1,000 Rs → 1 point
  's2': 800,   // Annona Canteen: Spend 800 Rs → 1 point
  's3': 1200,  // New Building Canteen: Spend 1,200 Rs → 1 point
  's4': 500,   // Juice Bar: Spend 500 Rs → 1 point
  's5': 900,   // E-Faculty Canteen: Spend 900 Rs → 1 point
};

const ShopDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, getUserCart, getCartTotal, processPurchase, clearUserCart } = useLoyalty();
  
  // Get data from localStorage or fallback to seed data
  const shops = storage.get(STORAGE_KEYS.SHOPS, seedShops);
  const foodItems = storage.get(STORAGE_KEYS.FOOD_ITEMS, seedFoodItems);
  const blogPosts = storage.get(STORAGE_KEYS.BLOG_POSTS, seedBlogPosts);
  
  const shop = shops.find((s) => s.id === id);
  const items = foodItems.filter((f) => f.shopId === id);
  const posts = blogPosts.filter((p) => p.shopId === id);
  
  // Sort posts: pinned posts first, then by creation date (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  if (!shop) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Canteen not found.</div>;
  
  const userCartItems = user ? getUserCart(user.id) : [];
  const cartTotal = user ? getCartTotal(user.id) : 0;
  const canteenRate = CANTEEN_POINTS_RATES[id] || 5000;
  const pointsEarned = Math.floor(cartTotal / canteenRate);
  
  const handleAddToCart = (item) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    addToCart(item, user.id);
    toast.success(`${item.name} added to cart`);
  };
  
  const handleCheckout = () => {
    if (!user) return;
    
    const points = processPurchase(user.id);
    if (points > 0) {
      toast.success(`Purchase completed! You earned ${points} loyalty points!`);
    } else {
      toast.error("Your cart is empty");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-64 overflow-hidden md:h-80">
        <img src={shop.image} alt={shop.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="container absolute bottom-0 left-0 right-0 mx-auto px-4 pb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <Badge className={shop.status === "open" ? "status-open border-0" : "status-closed border-0"}>
                {shop.status === "open" ? "● Open" : "● Closed"}
              </Badge>
              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{shop.name}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {shop.address}
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Star className="h-3.5 w-3.5 fill-primary" />
                  {shop.rating}
                </span>
              </div>
            </div>
            
            {/* User Info Display */}
            {user && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Logged in as</div>
                <div className="font-medium text-primary">{user.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {user.role === 'user' ? 'Student' : user.role === 'shop_admin' ? 'Canteen Admin' : 'Super Admin'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <p className="max-w-2xl text-muted-foreground">{shop.description}</p>
        
        <Tabs defaultValue="menu" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="blog">Blog & News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            {items.length > 0 && (
              <section className="space-y-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Menu Items
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                            <p className="mt-1 font-display font-bold text-primary">
                              Rs. {item.price}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => handleAddToCart(item)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>
          
          <TabsContent value="cart">
            {user ? (
              <div className="space-y-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Your Cart
                </h2>
                {userCartItems.length > 0 ? (
                  <div>
                    <div className="space-y-4 mb-6">
                      {userCartItems.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            Rs. {cartTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                          <span className="text-muted-foreground">Points you'll earn:</span>
                          <span className="font-medium text-primary">+{pointsEarned} points</span>
                        </div>
                        <Button onClick={handleCheckout} className="w-full" size="lg">
                          Complete Purchase
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Your cart is empty. Add items from the menu to get started!
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Please login to view your cart
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="rewards">
            <LoyaltyRewards shopId={id} />
          </TabsContent>
          
          <TabsContent value="blog">
            {sortedPosts.length > 0 && (
              <section className="space-y-6">
                <h2 className="font-display text-xl font-semibold">
                  Latest from {shop.name}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {sortedPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-12">
          <LoyaltyPoints />
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
