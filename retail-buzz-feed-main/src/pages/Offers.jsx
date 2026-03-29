import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { offers as seedOffers, shops as seedShops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketPercent, Copy, ExternalLink, Search, Filter, MapPin, Star, Tag } from "lucide-react";

const Offers = () => {
  const [offers] = useState(() => storage.get(STORAGE_KEYS.OFFERS, seedOffers));
  const [shops] = useState(() => storage.get(STORAGE_KEYS.SHOPS, seedShops));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState("all");

  const normalized = searchQuery.trim().toLowerCase();

  const activeOffers = useMemo(() => {
    const now = Date.now();
    return offers
      .filter((o) => o.active)
      .filter((o) => {
        const until = o.validUntil ? new Date(o.validUntil).getTime() : Number.POSITIVE_INFINITY;
        return Number.isFinite(until) ? until >= now : true;
      })
      .filter((o) => {
        const matchesSearch = !normalized || 
          [o.title, o.description, o.couponCode].join(" ").toLowerCase().includes(normalized);
        
        const matchesShop = selectedShop === "all" || o.shopId === selectedShop;
        
        return matchesSearch && matchesShop;
      });
  }, [offers, normalized, selectedShop]);

  // Group offers by canteen
  const offersByCanteen = useMemo(() => {
    const grouped = {};
    activeOffers.forEach(offer => {
      if (!grouped[offer.shopId]) {
        grouped[offer.shopId] = {
          shop: shops.find(s => s.id === offer.shopId),
          offers: []
        };
      }
      grouped[offer.shopId].offers.push(offer);
    });
    return grouped;
  }, [activeOffers, shops]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      <div className="mb-6 animate-fade-in">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
          <TicketPercent className="h-7 w-7 text-primary" />
          Offers & Coupons
          <Badge variant="secondary">{activeOffers.length}</Badge>
        </h1>
        <p className="mt-2 text-muted-foreground">Browse active discounts and coupon codes from all canteens.</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offers by title, description, or coupon code..."
            className="pl-10"
          />
        </div>
        
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
      </div>

      {/* All Offers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeOffers.map((offer) => {
          const shop = shops.find(s => s.id === offer.shopId);
          return (
            <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{offer.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        📍 {shop?.name || 'Unknown Canteen'}
                      </Badge>
                      {shop?.status === "open" && (
                        <Badge className="bg-green-500 text-white text-xs">● Open</Badge>
                      )}
                    </div>
                  </div>
                  {offer.isPinned && (
                    <Badge className="bg-primary">
                      <Tag className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {offer.discountPercent}% OFF
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Valid until {offer.validUntil}
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                    <p className="text-xs text-muted-foreground">Coupon code</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold">{offer.couponCode}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copy(offer.couponCode)} 
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/shop/${offer.shopId}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Canteen
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeOffers.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <TicketPercent className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No offers found</h3>
          <p>Try adjusting your search or filters to find available offers.</p>
        </div>
      )}
    </div>
  );
};

export default Offers;

