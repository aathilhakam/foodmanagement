import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoyaltyProvider } from "@/contexts/LoyaltyContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import ShopDetail from "./pages/ShopDetail";
import BlogFeed from "./pages/BlogFeed";
import BlogPostDetail from "./pages/BlogPostDetail";
import Login from "./pages/Login";
import ShopAdminDashboard from "./pages/ShopAdminDashboard";
import PostManagement from "./pages/PostManagement";
import CommentManagement from "./pages/CommentManagement";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminCanteenManagement from "./pages/AdminCanteenManagement";
import CanteenAdminLogin from "./pages/CanteenAdminLogin";
import CanteenAdminDashboard from "./pages/CanteenAdminDashboard";
import CanteenOwnerLogin from "./pages/CanteenOwnerLogin";
import CanteenOwnerDashboard from "./pages/CanteenOwnerDashboard";
import Offers from "./pages/Offers";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(LoyaltyProvider, { children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
  /* @__PURE__ */ jsx(Toaster, {}),
  /* @__PURE__ */ jsx(Sonner, {}),
  /* @__PURE__ */ jsxs(BrowserRouter, { children: [
    /* @__PURE__ */ jsx(Navbar, {}),
    /* @__PURE__ */ jsxs(Routes, { children: [
      /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Index, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/shop/:id", element: /* @__PURE__ */ jsx(ShopDetail, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/blog", element: /* @__PURE__ */ jsx(BlogFeed, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/blog/:id", element: /* @__PURE__ */ jsx(BlogPostDetail, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(Login, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/offers", element: /* @__PURE__ */ jsx(Offers, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/dashboard", element: /* @__PURE__ */ jsx(ShopAdminDashboard, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/dashboard/posts", element: /* @__PURE__ */ jsx(PostManagement, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/dashboard/comments", element: /* @__PURE__ */ jsx(CommentManagement, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/admin", element: /* @__PURE__ */ jsx(SuperAdminDashboard, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/admin/canteens", element: /* @__PURE__ */ jsx(AdminCanteenManagement, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/canteen-admin/login", element: /* @__PURE__ */ jsx(CanteenAdminLogin, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/canteen-admin/dashboard", element: /* @__PURE__ */ jsx(CanteenAdminDashboard, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/canteen-owner/login", element: /* @__PURE__ */ jsx(CanteenOwnerLogin, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/canteen-owner/dashboard", element: /* @__PURE__ */ jsx(CanteenOwnerDashboard, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
    ] })
  ] })
] }) }) }) });
var stdin_default = App;
export {
  stdin_default as default
};
