import { Coins, ShoppingCart, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLoyalty } from '@/contexts/LoyaltyContext';
import { useAuth } from '@/contexts/AuthContext';

const LoyaltyPoints = () => {
  const { user } = useAuth();
  const { getUserPoints, getUserTotalSpent, getCartTotal, getUserCart } = useLoyalty();
  
  if (!user || user.role !== 'user') {
    return null;
  }

  const currentPoints = getUserPoints(user.id);
  const currentTotal = getUserTotalSpent(user.id);
  const cartTotal = getCartTotal(user.id);
  const cartItems = getUserCart(user.id);
  
  // Calculate next milestone (every 5000 rupees = 1 point)
  const nextMilestone = Math.floor(currentTotal / 5000) + 1;
  const progressToNext = ((currentTotal % 5000) / 5000) * 100;
  const pointsToNext = 1; // Always 1 point per 5000

  return (
    <div className="space-y-4">
      {/* Points Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Loyalty Points
          </CardTitle>
          <CardDescription>
            Earn 1 point for every Rs. 5,000 spent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {currentPoints}
              </span>
              <span className="text-sm text-muted-foreground">points</span>
            </div>
            <Badge variant="secondary" className="bg-primary/10">
              Rs. {totalSpent.toLocaleString()} spent
            </Badge>
          </div>
          
          {/* Progress to next points */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Next point at Rs. {nextMilestone * 5000}
              </span>
              <span className="text-muted-foreground">
                {progressToNext.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Current Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {cartItems.length} items
                </span>
                <span className="font-semibold">
                  Rs. {cartTotal.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Points you'll earn:
                </span>
                <Badge variant="outline" className="text-primary">
                  +{Math.floor(cartTotal / 5000)} points
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>Spend Rs. 5,000 at any canteen</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>Automatically earn 1 loyalty point</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>Redeem 10 points for 50% off your next purchase</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoyaltyPoints;
