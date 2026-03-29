import { useParams, Link } from "react-router-dom";
import { blogPosts as seedBlogPosts, shops as seedShops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Newspaper, MapPin, Star, Calendar } from "lucide-react";

const CanteenNews = () => {
  const { id } = useParams();
  
  // Get data from localStorage or fallback to seed data
  const blogPosts = storage.get(STORAGE_KEYS.BLOG_POSTS, seedBlogPosts);
  const shops = storage.get(STORAGE_KEYS.SHOPS, seedShops);
  
  // Find the specific canteen
  const shop = shops.find(s => s.id === id);
  
  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Canteen Not Found</h2>
          <p>The canteen you're looking for doesn't exist.</p>
          <Link to="/blog" className="inline-block mt-4">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Filter posts for this specific canteen
  const canteenPosts = blogPosts.filter(post => post.shopId === id);
  
  // Sort posts: pinned posts first, then by creation date (newest first)
  const sortedPosts = [...canteenPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog Hub
        </Link>
        
        {/* Canteen Header */}
        <Card className="overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/10">
            <img 
              src={shop.image} 
              alt={shop.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{shop.name}</h1>
                  <div className="flex items-center gap-3 text-white/90">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {shop.location}
                    </div>
                    <Badge variant={shop.status === "open" ? "default" : "secondary"} className="bg-white/90 text-black">
                      {shop.status === "open" ? "● Open" : "● Closed"}
                    </Badge>
                    <Badge variant="outline" className="bg-white/90 text-black">
                      <Star className="mr-1 h-3 w-3" />
                      {shop.rating}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-white">
                  <div className="text-sm opacity-80">Total Posts</div>
                  <div className="text-3xl font-bold">{sortedPosts.length}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">All Updates & News</h2>
        </div>
        
        {sortedPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {sortedPosts.map((post, i) => (
              <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Updates Available</h3>
              <p>{shop.name} hasn't posted any updates yet. Check back later!</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Canteen Info */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Canteen Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Contact Details</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Location:</strong> {shop.location}</p>
                  <p><strong>Status:</strong> {shop.status === "open" ? "Open Now" : "Closed"}</p>
                  <p><strong>Rating:</strong> {shop.rating} / 5.0</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Operating Hours</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Monday - Friday:</strong> 7:00 AM - 8:00 PM</p>
                  <p><strong>Saturday:</strong> 8:00 AM - 6:00 PM</p>
                  <p><strong>Sunday:</strong> 9:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CanteenNews;
