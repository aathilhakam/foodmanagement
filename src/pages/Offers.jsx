import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { offers as seedOffers, shops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketPercent, Copy, ExternalLink } from "lucide-react";

const Offers = () => {
  const [offers] = useState(() => storage.get(STORAGE_KEYS.OFFERS, seedOffers));
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const activeOffers = useMemo(() => {
    const now = Date.now();
    return offers
      .filter((o) => o.active)
      .filter((o) => {
        const until = o.validUntil ? new Date(o.validUntil).getTime() : Number.POSITIVE_INFINITY;
        return Number.isFinite(until) ? until >= now : true;
      })
      .filter((o) => {
        if (!normalized) return true;
        const shop = shops.find((s) => s.id === o.shopId);
        return [o.title, o.description, o.couponCode, shop?.name].join(" ").toLowerCase().includes(normalized);
      });
  }, [offers, normalized]);

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

      <div className="mb-8 max-w-xl">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search offers by canteen, title, or coupon..." />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeOffers.map((offer) => {
          const shop = shops.find((s) => s.id === offer.shopId);
          return (
            <div key={offer.id} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{shop?.name}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{offer.title}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {offer.discountPercent}% OFF
                </Badge>
              </div>

              {offer.description && <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>}

              <div className="mt-4 rounded-lg border border-border/50 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">Coupon code</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold">{offer.couponCode}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => copy(offer.couponCode)} title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Valid until {offer.validUntil}</p>
              </div>

              {shop && (
                <div className="mt-4">
                  <Link to={`/shop/${shop.id}`}>
                    <Button variant="ghost" size="sm">
                      View canteen <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeOffers.length === 0 && <div className="py-20 text-center text-muted-foreground">No active offers found.</div>}
    </div>
  );
};

export default Offers;

