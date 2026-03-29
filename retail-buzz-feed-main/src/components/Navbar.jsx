import { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const links = [
    { to: "/", label: "Canteens" },
    { to: "/blog", label: "Blog & News" },
    { to: "/offers", label: "Offers" }
  ];
  
  const adminLinks = user?.role === "super_admin" 
    ? [{ to: "/admin", label: "Admin Panel" }] 
    : user?.role === "shop_admin" 
    ? [{ to: "/dashboard", label: "Dashboard" }] 
    : [];
    
  const allLinks = [...links, ...adminLinks];
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold tracking-tight">
            SLIIT
            <span className="text-primary">Eats</span>
          </span>
        </Link>
        
        <div className="hidden items-center gap-1 md:flex">
          {allLinks.map((l) => (
            <Link key={l.to} to={l.to}>
              <Button variant={isActive(l.to) ? "hero" : "ghost"} size="sm">
                {l.label}
              </Button>
            </Link>
          ))}
        </div>
        
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Fragment>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user?.avatar}
              </span>
              <Button variant="ghost" size="icon" onClick={() => {
                logout();
                navigate("/");
              }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </Fragment>
          ) : (
            <Link to="/login">
              <Button variant="hero" size="sm">Sign In</Button>
            </Link>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {allLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}>
                <Button 
                  variant={isActive(l.to) ? "hero" : "ghost"} 
                  className="w-full justify-start" 
                >
                  {l.label}
                </Button>
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                className="justify-start" 
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="hero" className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
