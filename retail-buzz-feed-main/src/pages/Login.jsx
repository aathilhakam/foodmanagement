import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, AlertCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    
    const success = login(email, password);
    if (success) {
      // Navigate based on user role
      if (email === "admin@sliit.lk") {
        navigate("/admin");
      } else if (email.endsWith("@sliit.lk") && email !== "student@sliit.lk") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
  };
  
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to SLIIT Eats</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sliit.lk"
              className="mt-1 bg-card/40"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="mt-1 bg-card/40"
            />
          </div>
          
          <Button variant="hero" className="w-full" type="submit">
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 rounded-lg border border-border/50 bg-card/40 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Demo Accounts:</p>
          <p>P&S Canteen: pscanteen@sliit.lk / PNS123456</p>
          <p>Annona Canteen: annonacanteen@sliit.lk / ANN123456</p>
          <p>New Building Canteen: newbuildingcanteen@sliit.lk / NEW123456</p>
          <p>Juice Bar: juicebar@sliit.lk / JUI123456</p>
          <p>E-Faculty Canteen: efacultycanteen@sliit.lk / EFA123456</p>
          <p>Student: student@sliit.lk / STD123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
