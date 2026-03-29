import { useState } from 'react';
import { Gift, CheckCircle, Clock, QrCode, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoyalty } from '@/contexts/LoyaltyContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MyRewards = () => {
  const { user } = useAuth();
  const { getRedeemedRewards, useRedeemedReward } = useLoyalty();
  const [activeTab, setActiveTab] = useState('available');
  
  if (!user || user.role !== 'user') {
    return null;
  }

  const userRedeemedRewards = getRedeemedRewards(user.id);
  const availableRewards = userRedeemedRewards.filter(reward => !reward.used);
  const usedRewards = userRedeemedRewards.filter(reward => reward.used);

  const handleUseReward = (reward) => {
    const result = useRedeemedReward(reward.id, user.id);
    
    if (result.success) {
      toast.success(result.message);
      // In a real app, this might apply the discount or benefit
      if (reward.type === 'discount') {
        toast.info(`Discount code: ${reward.code || 'REWARD' + reward.id.slice(-6)}`);
      }
    } else {
      toast.error(result.message);
    }
  };

  const RewardCard = ({ reward, showUseButton = true }) => {
    const isExpired = new Date(reward.validUntil) < new Date();
    
    return (
      <Card className={`transition-all duration-200 ${
        reward.used 
          ? 'border-muted bg-muted/30 opacity-75' 
          : isExpired
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-primary/30 bg-primary/5'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{reward.title}</CardTitle>
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant={reward.used ? "secondary" : isExpired ? "destructive" : "default"}>
                {reward.used ? 'Used' : isExpired ? 'Expired' : 'Available'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {reward.pointsRequired} pts
              </Badge>
            </div>
          </div>
          <CardDescription className="text-sm">
            {reward.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Redeemed: {new Date(reward.redeemedAt).toLocaleDateString()}</span>
              </div>
              {reward.used && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Used: {new Date(reward.usedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {reward.type === 'discount' && !reward.used && !isExpired && (
              <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-center gap-2 text-center">
                  <Ticket className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-mono text-lg font-bold text-primary">
                      {reward.code || `REWARD${reward.id.slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Show this code at checkout</p>
                  </div>
                </div>
              </div>
            )}

            {reward.type === 'free_item' && !reward.used && !isExpired && (
              <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                <div className="flex items-center justify-center gap-2 text-center">
                  <QrCode className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-mono text-sm">FREE ITEM</p>
                    <p className="text-xs text-muted-foreground">Show this at the counter</p>
                  </div>
                </div>
              </div>
            )}

            {showUseButton && !reward.used && !isExpired && (
              <Button 
                className="w-full" 
                onClick={() => handleUseReward(reward)}
                variant={reward.type === 'discount' ? 'outline' : 'default'}
              >
                {reward.type === 'discount' ? 'Show Code' : 'Use Reward'}
              </Button>
            )}

            {isExpired && (
              <p className="text-xs text-destructive text-center">
                This reward expired on {new Date(reward.validUntil).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (userRedeemedRewards.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Rewards Yet</h3>
        <p className="text-muted-foreground">
          Start earning points by purchasing food from any canteen to redeem rewards!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'available' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Available ({availableRewards.length})
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'used' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Used ({usedRewards.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'available' && availableRewards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No available rewards. Redeem more rewards to see them here!</p>
          </div>
        )}

        {activeTab === 'used' && usedRewards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No used rewards yet. Use your available rewards to see them here!</p>
          </div>
        )}

        {(activeTab === 'available' ? availableRewards : usedRewards).map((reward) => (
          <RewardCard 
            key={reward.id} 
            reward={reward} 
            showUseButton={activeTab === 'available'}
          />
        ))}
      </div>
    </div>
  );
};

export default MyRewards;
