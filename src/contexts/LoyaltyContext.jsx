import { createContext, useContext, useState, useEffect } from 'react';
import { users } from '@/data/mockData';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};

export const LoyaltyProvider = ({ children }) => {
  const [userPoints, setUserPoints] = useState({});
  const [cart, setCart] = useState([]);
  const [totalSpent, setTotalSpent] = useState({});

  // Points calculation: tiered system
  // 5,000 = 1 point, 10,000 = 2 points
  const calculatePoints = (amount) => {
    if (amount >= 10000) {
      return Math.floor(amount / 10000) * 2;
    } else if (amount >= 5000) {
      return Math.floor(amount / 5000);
    } else {
      return 0;
    }
  };

  // Initialize user points data
  useEffect(() => {
    const initialPoints = {};
    const initialSpent = {};
    
    users.forEach(user => {
      if (user.role === 'user') {
        initialPoints[user.id] = 0;
        initialSpent[user.id] = 0;
      }
    });
    
    setUserPoints(initialPoints);
    setTotalSpent(initialSpent);
  }, []);

  // Add item to cart
  const addToCart = (item, userId) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1, userId }];
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  // Calculate cart total
  const getCartTotal = (userId) => {
    return cart
      .filter(item => item.userId === userId)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Process purchase and award points
  const processPurchase = (userId) => {
    const cartTotal = getCartTotal(userId);
    const pointsEarned = calculatePoints(cartTotal);
    
    if (pointsEarned > 0) {
      setUserPoints(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + pointsEarned
      }));
      
      setTotalSpent(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + cartTotal
      }));
      
      // Clear cart for this user
      setCart(prev => prev.filter(item => item.userId !== userId));
      
      return pointsEarned;
    }
    return 0;
  };

  // Redeem reward with points
  const redeemReward = (userId, reward) => {
    const currentPoints = userPoints[userId] || 0;
    
    if (currentPoints < reward.pointsRequired) {
      return { success: false, message: 'Insufficient points' };
    }
    
    // Deduct points
    setUserPoints(prev => ({
      ...prev,
      [userId]: prev[userId] - reward.pointsRequired
    }));
    
    // Store redeemed reward
    const redeemedReward = {
      ...reward,
      userId,
      redeemedAt: new Date().toISOString(),
      used: false,
      id: `redeemed-${Date.now()}`
    };
    
    // Store in localStorage for persistence
    const existingRedeemed = JSON.parse(localStorage.getItem('redeemedRewards') || '[]');
    existingRedeemed.push(redeemedReward);
    localStorage.setItem('redeemedRewards', JSON.stringify(existingRedeemed));
    
    return { 
      success: true, 
      message: `Successfully redeemed: ${reward.title}`,
      redeemedReward 
    };
  };

  // Get user's redeemed rewards
  const getRedeemedRewards = (userId) => {
    const allRedeemed = JSON.parse(localStorage.getItem('redeemedRewards') || '[]');
    return allRedeemed.filter(reward => reward.userId === userId);
  };

  // Use a redeemed reward
  const useRedeemedReward = (rewardId, userId) => {
    const allRedeemed = JSON.parse(localStorage.getItem('redeemedRewards') || '[]');
    const rewardIndex = allRedeemed.findIndex(r => r.id === rewardId && r.userId === userId);
    
    if (rewardIndex === -1) {
      return { success: false, message: 'Reward not found' };
    }
    
    if (allRedeemed[rewardIndex].used) {
      return { success: false, message: 'Reward already used' };
    }
    
    // Mark as used
    allRedeemed[rewardIndex].used = true;
    allRedeemed[rewardIndex].usedAt = new Date().toISOString();
    
    localStorage.setItem('redeemedRewards', JSON.stringify(allRedeemed));
    
    return { 
      success: true, 
      message: `Reward used: ${allRedeemed[rewardIndex].title}`,
      reward: allRedeemed[rewardIndex]
    };
  };

  // Get user's current points
  const getUserPoints = (userId) => {
    return userPoints[userId] || 0;
  };

  // Get user's total spent
  const getUserTotalSpent = (userId) => {
    return totalSpent[userId] || 0;
  };

  // Get user's cart items
  const getUserCart = (userId) => {
    return cart.filter(item => item.userId === userId);
  };

  // Clear cart for user
  const clearUserCart = (userId) => {
    setCart(prev => prev.filter(item => item.userId !== userId));
  };

  const value = {
    userPoints,
    cart,
    totalSpent,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    processPurchase,
    redeemReward,
    getRedeemedRewards,
    useRedeemedReward,
    getUserPoints,
    getUserTotalSpent,
    getUserCart,
    clearUserCart,
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};
