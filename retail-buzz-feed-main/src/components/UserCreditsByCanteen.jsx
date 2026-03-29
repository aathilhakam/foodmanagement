import { TrendingUp, MapPin, Star, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLoyalty } from '@/contexts/LoyaltyContext';
import { shops as seedShops } from '@/data/mockData';
import { storage, STORAGE_KEYS } from '@/lib/storage';

// Canteen-specific point calculation rates and rewards
const CANTEEN_POINTS_RATES = {
  's1': { 
    rate: 1000, 
    name: 'P&S Canteen',
    discountPoints: 15,
    freebiePoints: 30,
    freebie: 'Free beverage (up to 100 Rs)'
  },
  's2': { 
    rate: 800, 
    name: 'Annona Canteen',
    discountPoints: 12,
    freebiePoints: 20,
    freebie: 'Free dessert (any item up to 150 Rs)'
  },
  's3': { 
    rate: 1200, 
    name: 'New Building Canteen',
    discountPoints: 10,
    freebiePoints: 18,
    freebie: 'Free meal combo (main course + drink)'
  },
  's4': { 
    rate: 500, 
    name: 'Juice Bar',
    discountPoints: 8,
    freebiePoints: 15,
    freebie: 'Any juice free (up to 120 Rs)'
  },
  's5': { 
    rate: 900, 
    name: 'E-Faculty Canteen',
    discountPoints: 14,
    freebiePoints: 25,
    freebie: 'Free snack + beverage combo (up to 200 Rs total)'
  },
};

const UserCreditsByCanteen = () => {
  const { user } = useAuth();
  const { getUserPoints, getUserCart, calculatePoints } = useLoyalty();
  
  // For non-users (canteen owners, admins), show management view
  if (!user || user.role !== 'user') {
    return (
      <div className="space-y-6">
        {/* Overall Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Canteen Loyalty Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Active Canteens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">10</div>
                <div className="text-sm text-muted-foreground">Total Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">247</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Canteen Management
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-base">P&S Canteen</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="default">● Open</Badge>
                  <Badge variant="outline">Rate: Rs. 1,000/point</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-semibold">45</div>
                    <div className="text-xs text-muted-foreground">Customers</div>
                  </div>
                  <div>
                    <div className="font-semibold">128</div>
                    <div className="text-xs text-muted-foreground">Points Given</div>
                  </div>
                  <div>
                    <div className="font-semibold">Rs. 128K</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• 2 active rewards</p>
                  <p>• 15 redemptions this month</p>
                  <p>• 4.2★ average rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-base">Juice Bar</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="default">● Open</Badge>
                  <Badge variant="outline">Rate: Rs. 500/point</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-semibold">62</div>
                    <div className="text-xs text-muted-foreground">Customers</div>
                  </div>
                  <div>
                    <div className="font-semibold">89</div>
                    <div className="text-xs text-muted-foreground">Points Given</div>
                  </div>
                  <div>
                    <div className="font-semibold">Rs. 44.5K</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• 2 active rewards</p>
                  <p>• 23 redemptions this month</p>
                  <p>• 4.6★ average rating</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Information */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Loyalty Program Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="font-medium">Available Management Tools:</div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Customize point earning rates per canteen</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Create and manage reward offerings</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Track customer engagement and redemptions</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Generate analytics and reports</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get shops from localStorage or fallback to seed data
  const shops = storage.get(STORAGE_KEYS.SHOPS, seedShops);
  
  // Calculate user's spending and points for each canteen
  const canteenStats = shops.map(shop => {
    const userCart = getUserCart(user.id);
    const canteenItems = userCart.filter(item => item.shopId === shop.id);
    const totalSpent = canteenItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const pointsEarned = calculatePoints(totalSpent, shop.id); // Use canteen-specific calculation
    
    return {
      shop,
      totalSpent,
      pointsEarned,
      itemsCount: canteenItems.reduce((sum, item) => sum + item.quantity, 0),
      rate: CANTEEN_POINTS_RATES[shop.id]?.rate || 5000
    };
  }).filter(stat => stat.totalSpent > 0); // Only show canteens where user has spent money

  const totalPoints = getUserPoints(user.id);
  const totalSpent = canteenStats.reduce((sum, stat) => sum + stat.totalSpent, 0);

  if (canteenStats.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>You haven't earned any loyalty points yet.</p>
        <p className="text-sm mt-2">Start ordering from canteens to earn points!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Loyalty Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Rs. {totalSpent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{canteenStats.length}</div>
              <div className="text-sm text-muted-foreground">Canteens Visited</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canteen-wise Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Points by Canteen
        </h3>
        
        {canteenStats.map(({ shop, totalSpent, pointsEarned, itemsCount }) => {
          const canteenRate = CANTEEN_POINTS_RATES[shop.id];
          const nextDiscountPoints = canteenRate?.discountPoints || 15;
          const nextFreebiePoints = canteenRate?.freebiePoints || 30;
          const pointsToNextDiscount = Math.max(0, nextDiscountPoints - (pointsEarned % nextDiscountPoints));
          const pointsToNextFreebie = Math.max(0, nextFreebiePoints - (pointsEarned % nextFreebiePoints));
          
          return (
            <Card key={shop.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{shop.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={shop.status === "open" ? "default" : "secondary"}>
                      {shop.status === "open" ? "● Open" : "● Closed"}
                    </Badge>
                    <Badge variant="outline">
                      <Star className="mr-1 h-3 w-3" />
                      {shop.rating}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-primary">{pointsEarned}</div>
                    <div className="text-xs text-muted-foreground">Points Earned</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Rs. {totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Amount Spent</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{itemsCount}</div>
                    <div className="text-xs text-muted-foreground">Items Ordered</div>
                  </div>
                </div>
                
                {/* Reward Information */}
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Next Reward: 10% Discount</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {pointsToNextDiscount} points to go
                      </Badge>
                    </div>
                    <div className="text-xs text-blue-600">
                      Earn {nextDiscountPoints} points to get 10% off your next purchase
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Freebie Reward</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {pointsToNextFreebie} points to go
                      </Badge>
                    </div>
                    <div className="text-xs text-green-600">
                      After {nextFreebiePoints} points, get {canteenRate?.freebie || 'Free item'}
                    </div>
                  </div>
                </div>
              
              {/* Progress to next point */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to next point (Rs. {canteenRate.rate} per point)</span>
                  <span>{canteenRate.rate - (totalSpent % canteenRate.rate)} Rs. to go</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(totalSpent % canteenRate.rate) / (canteenRate.rate / 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Recent activity indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Last activity: Recently</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Points Information */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">How Points Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="font-medium">Canteen-Specific Point Rates:</div>
          {Object.entries(CANTEEN_POINTS_RATES).map(([shopId, canteenRate]) => (
            <div key={shopId} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span><strong>{canteenRate.name}</strong>: Spend Rs. {canteenRate.rate.toLocaleString()} → Earn 1 point</span>
            </div>
          ))}
          <div className="flex items-start gap-2 mt-3 pt-3 border-t">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>Points are calculated per canteen and added to your total</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>Redeem points for exclusive rewards at each canteen</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreditsByCanteen;
