import { useState } from "react";
import { Link } from "react-router-dom";
import { blogPosts as seedBlogPosts, shops as seedShops, offers as seedOffers } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import BlogCard from "@/components/BlogCard";
import LoyaltyPoints from "@/components/LoyaltyPoints";
import LoyaltyRewards from "@/components/LoyaltyRewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Gift, TrendingUp, Tag, Calendar, Star, Image, MessageSquare, Pin, MapPin, ArrowRight } from "lucide-react";

const POSTS_PER_PAGE = 4;

const BlogFeed = () => {
  const [page, setPage] = useState(1);
  
  // Get data from localStorage or fallback to seed data
  const blogPosts = storage.get(STORAGE_KEYS.BLOG_POSTS, seedBlogPosts);
  const shops = storage.get(STORAGE_KEYS.SHOPS, seedShops);
  const offers = storage.get(STORAGE_KEYS.OFFERS, seedOffers);
  
  // Sort posts: pinned posts first, then by creation date (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  // Sort offers: pinned offers first, then by date
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const paginated = sortedPosts.slice(0, page * POSTS_PER_PAGE);
  
  // Group content by canteen
  const canteenContent = shops.map(shop => {
    const shopPosts = sortedPosts.filter(post => post.shopId === shop.id);
    const shopOffers = sortedOffers.filter(offer => offer.shopId === shop.id);
    
    return {
      shop,
      posts: shopPosts,
      offers: shopOffers,
      hasContent: shopPosts.length > 0 || shopOffers.length > 0
    };
  });
  
  // For events, show all canteens regardless of content
  const allCanteensForEvents = shops;
  
  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <Newspaper className="h-7 w-7 text-primary" />
          Canteen Hub
        </h1>
        <p className="mt-2 text-muted-foreground">Discover canteen promotions, events, offers, and updates from SLIIT canteens.</p>
      </div>
      
      <Tabs defaultValue="updates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="loyalty">My Points</TabsTrigger>
        </TabsList>
        
        <TabsContent value="updates">
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {canteenContent.map(({ shop, posts }) => (
                <Link 
                  key={shop.id} 
                  to={`/canteen/${shop.id}/news`}
                  className="block group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group-hover:scale-105">
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10">
                      <img 
                        src={shop.image} 
                        alt={shop.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={shop.status === "open" ? "default" : "secondary"} className="bg-white/90 text-black">
                            {shop.status === "open" ? "● Open" : "● Closed"}
                          </Badge>
                          <Badge variant="outline" className="bg-white/90 text-black">
                            <Star className="mr-1 h-3 w-3" />
                            {shop.rating}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{shop.name}</h3>
                        <p className="text-sm text-white/80 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {shop.location}
                        </p>
                      </div>
                      
                      {/* Hover overlay with arrow */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center text-white">
                          <ArrowRight className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                          <p className="text-sm font-medium">View All Updates</p>
                          <p className="text-xs opacity-80">{posts.length} posts available</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Latest Updates</div>
                          <div className="text-lg font-semibold">{posts.length} Posts</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Status</div>
                          <div className="text-sm font-medium text-green-600">Active</div>
                        </div>
                      </div>
                      
                      {/* Show latest 2 post previews */}
                      {posts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {posts.slice(0, 2).map((post, index) => (
                            <div key={post.id} className="text-xs text-muted-foreground truncate">
                              • {post.title}
                            </div>
                          ))}
                          {posts.length > 2 && (
                            <div className="text-xs text-primary font-medium">
                              +{posts.length - 2} more posts
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {canteenContent.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Updates Available</h3>
                  <p>Check back later for the latest canteen updates and news.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <div className="space-y-8">
            {allCanteensForEvents.map(({ shop }) => (
              <div key={shop.id} className="space-y-4">
                {/* Canteen Header */}
                <Card className="overflow-hidden">
                  <div className="relative h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/10">
                    <img 
                      src={shop.image} 
                      alt={shop.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div className="relative z-10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-purple-700">{shop.name} Events</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              <Calendar className="mr-1 h-3 w-3" />
                              Upcoming Events
                            </Badge>
                            <Badge variant={shop.status === "open" ? "default" : "secondary"}>
                              {shop.status === "open" ? "● Open" : "● Closed"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* Events for this canteen */}
                <div className="grid gap-4 md:grid-cols-2">
                  {shop.id === "s1" && (
                    <>
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Food Festival Week
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Special food festival at P&S Canteen with exclusive dishes and discounts.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📅 April 15-21, 2026</span>
                            <span>📍 P&S Canteen</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Healthy Eating Campaign
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            Special healthy menu options with nutritional information.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📅 May 1-31, 2026</span>
                            <span>📍 P&S Canteen</span>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {shop.id === "s4" && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Juice Bar Special
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Buy one get one free on all fresh juices at the Juice Bar.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 Every Friday</span>
                          <span>📍 Juice Bar</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {shop.id === "s2" && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Breakfast Bonanza
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Special breakfast combos and discounts on morning meals.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 March 1-31, 2026</span>
                          <span>📍 Annona Canteen</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {shop.id === "s3" && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Tech Week Special
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Special meals for students during tech week and hackathon.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 April 1-7, 2026</span>
                          <span>📍 New Building Canteen</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {shop.id === "s5" && (
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Ramazan Special
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          Special iftar meals and traditional dishes during Ramazan.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📅 March 10 - April 9, 2026</span>
                          <span>📍 E-Faculty Canteen</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="loyalty">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Loyalty Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track your points, spending, and available rewards all in one place.
                </p>
              </CardContent>
            </Card>
            <LoyaltyPoints />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogFeed;
