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

  // Canteen-specific point calculation rates
  const CANTEEN_POINTS_RATES = {
    's1': 1000,  // P&S Canteen: Spend 1,000 Rs → 1 point
    's2': 800,   // Annona Canteen: Spend 800 Rs → 1 point
    's3': 1200,  // New Building Canteen: Spend 1,200 Rs → 1 point
    's4': 500,   // Juice Bar: Spend 500 Rs → 1 point
    's5': 900,   // E-Faculty Canteen: Spend 900 Rs → 1 point
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

  // Calculate points from amount spent for specific canteen
  const calculatePoints = (amount, shopId) => {
    const rate = CANTEEN_POINTS_RATES[shopId] || 5000; // Default to 5000 if shop not found
    return Math.floor(amount / rate);
  };

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

  // Process purchase and award points (canteen-specific)
  const processPurchase = (userId) => {
    const userCartItems = cart.filter(item => item.userId === userId);
    let totalPointsEarned = 0;
    let totalAmount = 0;
    
    // Calculate points for each canteen separately
    const canteenTotals = {};
    userCartItems.forEach(item => {
      if (!canteenTotals[item.shopId]) {
        canteenTotals[item.shopId] = 0;
      }
      canteenTotals[item.shopId] += item.price * item.quantity;
      totalAmount += item.price * item.quantity;
    });
    
    // Calculate points for each canteen
    Object.entries(canteenTotals).forEach(([shopId, amount]) => {
      totalPointsEarned += calculatePoints(amount, shopId);
    });
    
    if (totalPointsEarned > 0) {
      setUserPoints(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + totalPointsEarned
      }));
      
      setTotalSpent(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + totalAmount
      }));
      
      // Clear cart for this user
      setCart(prev => prev.filter(item => item.userId !== userId));
      
      return totalPointsEarned;
    }
    return 0;
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
    getUserPoints,
    getUserTotalSpent,
    getUserCart,
    clearUserCart,
    calculatePoints
  };

  return (
    <LoyaltyContext.Provider value={value}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export default LoyaltyProvider;
