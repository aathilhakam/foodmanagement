import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { offers as seedOffers, shops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketPercent, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

const Offers = () => {
  const [offers] = useState(() => storage.get(STORAGE_KEYS.OFFERS, seedOffers));
  const [copiedCode, setCopiedCode] = useState(null);

  const activeOffers = useMemo(() => {
    const now = Date.now();
    return offers
      .filter((o) => o.active)
      .filter((o) => {
        const until = o.validUntil ? new Date(o.validUntil).getTime() : Number.POSITIVE_INFINITY;
        return Number.isFinite(until) ? until >= now : true;
      });
  }, [offers]);

  const copy = async (text, offerId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(offerId);
      toast.success("Coupon code copied to clipboard!");
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy coupon code");
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {activeOffers.map((offer) => {
          const shop = shops.find((s) => s.id === offer.shopId);
          return (
            <div key={offer.id} className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background via-background to-card shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/30">
              {/* Offer Header */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{shop?.name}</span>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 border-0 text-white font-semibold">
                        {offer.discountPercent}% OFF
                      </Badge>
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">{offer.title}</h3>
                  </div>
                </div>

                {offer.description && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
                )}

                {/* Coupon Code Section */}
                <div className="mt-6 rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-purple/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">Coupon Code</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-foreground bg-background px-3 py-2 rounded-lg border border-border/50">
                          {offer.couponCode}
                        </span>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => copy(offer.couponCode, offer.id)}
                      className="group/btn relative overflow-hidden transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105"
                    >
                      {copiedCode === offer.id ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      Valid until <span className="font-semibold text-foreground">{offer.validUntil}</span>
                    </span>
                  </p>
                </div>

                {/* Canteen Link */}
                {shop && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-muted-foreground">Available at {shop.name}</span>
                    </div>
                    <Link to={`/shop/${shop.id}`}>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="transition-all duration-300 hover:scale-105"
                      >
                        View Canteen
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeOffers.length === 0 && <div className="py-20 text-center text-muted-foreground">No active offers found.</div>}
    </div>
  );
};

export default Offers;

