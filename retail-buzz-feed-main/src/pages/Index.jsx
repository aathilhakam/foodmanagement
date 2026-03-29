import { useMemo, useState } from "react";
import { offers as seedOffers, shops as seedShops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import ShopCard from "@/components/ShopCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Flame, Search } from "lucide-react";
const Index = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [offersOnly, setOffersOnly] = useState(false);
  const [offers] = useState(() => storage.get(STORAGE_KEYS.OFFERS, seedOffers));
  
  // Get shops from localStorage or fallback to seed data
  const shops = storage.get(STORAGE_KEYS.SHOPS, seedShops);

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
            
            {/* User Info Display */}
            {user && (
              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="text-sm text-muted-foreground">Currently logged in as</div>
                <div className="font-medium text-primary">{user.email}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {user.role === 'user' ? 'Student' : user.role === 'shop_admin' ? 'Canteen Admin' : 'Super Admin'}
                </div>
              </div>
            )}
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
            <button
              type="button"
              onClick={() => setOffersOnly((v) => !v)}
              className={`rounded-full border px-3 py-1 transition-colors ${
                offersOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              Offers only
            </button>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            All Canteens
          </h2>
          <div className="flex gap-2">
            {["all", "open", "closed"].map((f) => (
              <Button key={f} variant={filter === f ? "hero" : "ghost"} size="sm" onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "open" ? "● Open" : "● Closed"}
              </Button>
            ))}
          </div>
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
