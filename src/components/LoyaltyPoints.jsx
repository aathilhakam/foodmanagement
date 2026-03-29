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
  const totalSpent = getUserTotalSpent(user.id);
  const cartTotal = getCartTotal(user.id);
  const cartItems = getUserCart(user.id);
  
  // Calculate next milestone for tiered system
  const getNextMilestone = (spent) => {
    if (spent >= 10000) {
      return Math.floor(spent / 10000) * 10000 + 10000;
    } else if (spent >= 5000) {
      return 10000;
    } else {
      return 5000;
    }
  };

  const getProgressToNext = (spent) => {
    const nextMilestone = getNextMilestone(spent);
    const currentMilestone = spent >= 10000 ? Math.floor(spent / 10000) * 10000 : 
                           spent >= 5000 ? 5000 : 0;
    const progress = spent - currentMilestone;
    const total = nextMilestone - currentMilestone;
    return total > 0 ? (progress / total) * 100 : 0;
  };

  // Calculate points for cart using tiered system
  const calculateCartPoints = (total) => {
    if (total >= 10000) {
      return Math.floor(total / 10000) * 2;
    } else if (total >= 5000) {
      return Math.floor(total / 5000);
    } else {
      return 0;
    }
  };

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
            Tiered Rewards: Rs. 5,000 = 1 point, Rs. 10,000 = 2 points
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
                Next point at Rs. {nextMilestone.toLocaleString()}
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
                  +{calculateCartPoints(cartTotal)} points
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
            <span>Spend Rs. 5,000 to earn 1 point</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>Spend Rs. 10,000 to earn 2 points</span>
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
