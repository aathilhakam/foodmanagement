import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { foodItems, blogPosts } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import BlogCard from "@/components/BlogCardNew";
import CartItem from "@/components/CartItem";
import LoyaltyPoints from "@/components/LoyaltyPoints";
import LoyaltyRewards from "@/components/LoyaltyRewards";
import MyRewards from "@/components/MyRewards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, ArrowLeft, UtensilsCrossed, ShoppingCart, Plus, Clock, Phone, Mail, Globe, FileText, Calendar } from "lucide-react";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ShopDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { 
    addToCart, 
    getUserCart, 
    getCartTotal, 
    processPurchase, 
    getUserPoints, 
    getRedeemedRewards 
  } = useLoyalty();
  const [shops, setShops] = useState(() => storage.get(STORAGE_KEYS.SHOPS, []));
  const shop = shops.find((s) => s.id === id);
  const items = foodItems.filter((f) => f.shopId === id);
  const posts = blogPosts.filter((p) => p.shopId === id);

  // Listen for storage changes to update shops in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      setShops(storage.get(STORAGE_KEYS.SHOPS, []));
    };

    // Listen for custom storage events from same tab
    const handleCustomStorageUpdate = (event) => {
      if (event.detail.key === STORAGE_KEYS.SHOPS) {
        setShops(event.detail.value);
      }
    };

    // Listen for canteen status changes specifically
    const handleCanteenStatusChanged = (event) => {
      const { allCanteens } = event.detail;
      if (allCanteens) {
        setShops(allCanteens);
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom storage events from same tab
    window.addEventListener('storageUpdate', handleCustomStorageUpdate);
    
    // Listen for canteen status changes
    window.addEventListener('canteenStatusChanged', handleCanteenStatusChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleCustomStorageUpdate);
      window.removeEventListener('canteenStatusChanged', handleCanteenStatusChanged);
    };
  }, []);
  
  if (!shop) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Canteen not found.</div>;
  
  const userCartItems = user ? getUserCart(user.id) : [];
  const cartTotal = user ? getCartTotal(user.id) : 0;
  const pointsEarned = Math.floor(cartTotal / 1000);
  
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
      
      // Check if user can redeem any rewards with new points
      const currentPoints = getUserPoints(user.id);
      const availableRewards = getRedeemedRewards(user.id).filter(r => !r.used);
      
      if (availableRewards.length > 0) {
        toast.info(`You have ${availableRewards.length} reward(s) available! Check "My Rewards" to use them.`);
      }
      
      if (currentPoints >= 10) {
        toast.success(`You now have ${currentPoints} points! Redeem rewards in the Rewards section.`);
      }
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
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <p className="max-w-2xl text-muted-foreground">{shop.description}</p>
        
        {/* Enhanced Canteen Details */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-semibold text-primary">
                {shop.operatingHours?.open || '08:00'} - {shop.operatingHours?.close || '20:00'}
              </p>
              <p className="text-sm text-muted-foreground">Daily</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-semibold">{shop.phone || '+94 11 234 5678'}</p>
              {shop.email && (
                <p className="text-sm text-muted-foreground mt-1">{shop.email}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UtensilsCrossed className="h-4 w-4 text-primary" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant="secondary" className="capitalize">
                {shop.category || 'Food & Beverages'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-primary" />
                Rating & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{shop.rating || '4.0'}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(shop.rating || 4) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {shop.reviews || Math.floor(Math.random() * 100) + 20} reviews
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{shop.address}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary" />
                Additional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Status: <Badge className={shop.status === "open" ? "status-open border-0" : "status-closed border-0"}>
                  {shop.status === "open" ? "Open Now" : "Closed"}
                </Badge>
              </p>
              {shop.website && (
                <a 
                  href={shop.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm mt-2 block"
                >
                  Visit Website →
                </a>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="menu" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="cart">Cart</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
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
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Rewards</h3>
                <LoyaltyRewards shopId={id} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">My Rewards</h3>
                <MyRewards />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="articles">
            <section className="space-y-6">
              <h2 className="font-display text-xl font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Interesting Articles About Campus Canteens
              </h2>
              
              <div className="space-y-6">
                {blogPosts
                  .filter(post => post.shopId === id)
                  .map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-semibold mb-2">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.createdAt).toLocaleDateString("en-US", { 
                                  month: "short", 
                                  day: "numeric", 
                                  year: "numeric" 
                                })}
                              </span>
                              <div className="flex gap-1">
                                {post.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
              
              {/* Additional interesting articles about canteens */}
              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold mb-4">
                  More Interesting Reads
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">The Evolution of Campus Dining</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      From simple cafeterias to sophisticated dining experiences, campus canteens have transformed dramatically over the years.
                    </p>
                    <Badge variant="outline">Campus Life</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Sustainable Practices in Campus Food Service</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      How modern canteens are implementing eco-friendly practices and reducing their environmental impact.
                    </p>
                    <Badge variant="outline">Sustainability</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">The Psychology of Campus Dining</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Understanding how food choices affect student performance and well-being during academic life.
                    </p>
                    <Badge variant="outline">Wellness</Badge>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Technology in Modern Canteens</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      From digital ordering to smart inventory systems, how technology is revolutionizing campus dining.
                    </p>
                    <Badge variant="outline">Innovation</Badge>
                  </Card>
                </div>
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="blog">
            {posts.length > 0 && (
              <section className="space-y-6">
                <h2 className="font-display text-xl font-semibold">
                  Latest from {shop.name}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {posts.map((post) => (
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
