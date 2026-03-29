import { Gift, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loyaltyRewards } from '@/data/mockData';
import { useLoyalty } from '@/contexts/LoyaltyContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoyaltyRewards = ({ shopId }) => {
  const { user } = useAuth();
  const { getUserPoints } = useLoyalty();
  
  // For non-users (canteen owners, admins), show old features
  if (!user || user.role !== 'user') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Loyalty Program</h3>
        </div>
        
        <Card className="bg-muted/30">
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h4 className="font-semibold mb-2">Canteen Loyalty System</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your canteen's loyalty program and rewards system.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Set up point earning rates</p>
              <p>• Create custom rewards</p>
              <p>• Track customer loyalty</p>
              <p>• Manage redemption system</p>
            </div>
            {!user && (
              <p className="text-xs text-primary mt-4">
                Login as a student to view and redeem rewards
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // For users (students), show the new canteen-specific rewards
  const currentPoints = getUserPoints(user.id);
  const rewards = shopId 
    ? loyaltyRewards.filter(reward => (reward.shopId === shopId || reward.shopId === "all") && reward.active)
    : loyaltyRewards.filter(reward => reward.active);

  const handleRedeemReward = (reward) => {
    if (currentPoints < reward.pointsRequired) {
      toast.error(`You need ${reward.pointsRequired - currentPoints} more points to redeem this reward.`);
      return;
    }
    
    toast.success(`Successfully redeemed: ${reward.title}!`);
    // In a real app, this would call an API to redeem the reward
  };

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No rewards available for this canteen yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Available Rewards</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {rewards.map((reward) => {
          const canRedeem = currentPoints >= reward.pointsRequired;
          const pointsNeeded = reward.pointsRequired - currentPoints;
          
          return (
            <Card 
              key={reward.id} 
              className={`transition-all duration-200 ${
                canRedeem 
                  ? 'border-primary/30 bg-primary/5 hover:shadow-md' 
                  : 'opacity-75'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{reward.title}</CardTitle>
                  </div>
                  <Badge 
                    variant={canRedeem ? "default" : "secondary"}
                    className={canRedeem ? "bg-primary" : ""}
                  >
                    {reward.pointsRequired} points
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Valid until {new Date(reward.validUntil).toLocaleDateString()}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleRedeemReward(reward)}
                    disabled={!canRedeem}
                    className={!canRedeem ? "cursor-not-allowed" : ""}
                  >
                    {canRedeem ? 'Redeem' : `Need ${pointsNeeded} more`}
                  </Button>
                </div>
                
                {!canRedeem && (
                  <div className="mt-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                    You have {currentPoints.toFixed(1)} points. Need {pointsNeeded.toFixed(1)} more to redeem.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LoyaltyRewards;
