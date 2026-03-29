import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/", label: "Canteens" },
    { to: "/blog", label: "Blog & News" },
    { to: "/offers", label: "Offers" }
  ];
  const adminLinks = user?.role === "super_admin" ? [{ to: "/admin", label: "Admin Panel" }] : user?.role === "shop_admin" ? [{ to: "/dashboard", label: "Dashboard" }] : [];
  const allLinks = [...links, ...adminLinks];
  const isActive = (path) => location.pathname === path;
  return /* @__PURE__ */ jsxs("nav", { className: "sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex h-16 items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(UtensilsCrossed, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxs("span", { className: "font-display text-lg font-bold tracking-tight", children: [
          "SLIIT",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Eats" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-1 md:flex", children: allLinks.map((l) => /* @__PURE__ */ jsx(Link, { to: l.to, children: /* @__PURE__ */ jsx(Button, { variant: isActive(l.to) ? "hero" : "ghost", size: "sm", children: l.label }) }, l.to)) }),
      /* @__PURE__ */ jsx("div", { className: "hidden items-center gap-2 md:flex", children: isAuthenticated ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground", children: user?.avatar }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: logout, children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }) })
      ] }) : /* @__PURE__ */ jsx(Link, { to: "/login", children: /* @__PURE__ */ jsx(Button, { variant: "hero", size: "sm", children: "Sign In" }) }) }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: () => setMobileOpen(!mobileOpen), children: mobileOpen ? /* @__PURE__ */ jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" }) })
    ] }),
    mobileOpen && /* @__PURE__ */ jsx("div", { className: "border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 p-4", children: [
      allLinks.map((l) => /* @__PURE__ */ jsx(Link, { to: l.to, onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsx(Button, { variant: isActive(l.to) ? "hero" : "ghost", className: "w-full justify-start", children: l.label }) }, l.to)),
      isAuthenticated ? /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "justify-start", onClick: () => {
        logout();
        setMobileOpen(false);
      }, children: [
        /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
        " Sign Out"
      ] }) : /* @__PURE__ */ jsx(Link, { to: "/login", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsx(Button, { variant: "hero", className: "w-full", children: "Sign In" }) })
    ] }) })
  ] });
};
var stdin_default = Navbar;
export {
  stdin_default as default
};
