import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLoyalty } from '@/contexts/LoyaltyContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useLoyalty();

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          <img 
            src={item.image} 
            alt={item.name} 
            className="h-16 w-16 rounded-lg object-cover"
          />
          
          <div className="flex-1">
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-muted-foreground">{item.category}</p>
            <p className="mt-1 font-semibold text-primary">
              Rs. {item.price}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="w-8 text-center font-medium">
              {item.quantity}
            </span>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuantityChange(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="text-right">
            <p className="font-semibold">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
