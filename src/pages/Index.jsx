import { useMemo, useState, useEffect } from "react";
import { offers as seedOffers, shops as seedShops } from "@/data/mockData";
import ShopCard from "@/components/ShopCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { UtensilsCrossed, Flame, Search } from "lucide-react";
const Index = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offersOnly, setOffersOnly] = useState(false);
  const [offers] = useState(() => storage.get(STORAGE_KEYS.OFFERS, seedOffers));
  const [shops, setShops] = useState(() => storage.get(STORAGE_KEYS.SHOPS, seedShops));

  // Listen for storage changes to update shops in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const newShops = storage.get(STORAGE_KEYS.SHOPS, seedShops);
      console.log('Storage change detected, new shops:', newShops);
      setShops(newShops);
    };

    // Listen for custom storage events from same tab
    const handleCustomStorageUpdate = (event) => {
      console.log('Custom storage update received:', event.detail);
      if (event.detail.key === STORAGE_KEYS.SHOPS) {
        console.log('Updating shops from custom event:', event.detail.value);
        setShops(event.detail.value);
      }
    };

    // Listen for canteen status changes specifically
    const handleCanteenStatusChanged = (event) => {
      console.log('Canteen status changed event received:', event.detail);
      const { allCanteens } = event.detail;
      if (allCanteens) {
        console.log('Updating shops from canteen status change:', allCanteens);
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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activeOfferShopIds = useMemo(() => {
    const now = Date.now();
    return new Set(
      offers
        .filter((o) => o.active)
        .filter((o) => {
          const until = o.validUntil ? new Date(o.validUntil).getTime() : Number.POSITIVE_INFINITY;
          return Number.isFinite(until) ? until >= now : true;
        })
        .map((o) => o.shopId),
    );
  }, [offers]);

  const filtered = shops.filter((shop) => {
    const statusMatch = filter === "all" ? true : shop.status === filter;
    const queryMatch = normalizedQuery
      ? [shop.name, shop.description, shop.address].join(" ").toLowerCase().includes(normalizedQuery)
      : true;
    const offerMatch = offersOnly ? activeOfferShopIds.has(shop.id) : true;
    return statusMatch && queryMatch && offerMatch;
  });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border/30 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Flame className="h-3 w-3" /> SLIIT Canteen Management System
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Discover <span className="text-gradient">SLIIT</span> Canteens
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse campus canteens, read the latest updates, and stay connected with the SLIIT food community.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <div className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search canteen by name, description or location..."
              className="pl-10"
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="rounded-full"
            >
              All Canteens
            </Button>
            <Button
              variant={filter === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("open")}
              className="rounded-full"
            >
              Open Canteens
            </Button>
            <Button
              variant={filter === "closed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("closed")}
              className="rounded-full"
            >
              Closed Canteens
            </Button>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            {filter === "all" ? "All Canteens" : filter === "open" ? "Open Canteens" : "Closed Canteens"}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop, i) => (
            <div key={shop.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <ShopCard shop={shop} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">No canteens found. Try another keyword or filter.</div>
        )}
      </section>
    </div>
  );
};
export default Index;
