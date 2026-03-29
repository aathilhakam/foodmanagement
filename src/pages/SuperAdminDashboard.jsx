import { jsx, jsxs } from "react/jsx-runtime";
import { useAuth } from "@/contexts/AuthContext";
import { shops, users, blogPosts } from "@/data/mockData";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Shield, UtensilsCrossed, Users, FileText, Settings, Building2 } from "lucide-react";
const SuperAdminDashboard = () => {
  const { user } = useAuth();
  if (!user || user.role !== "super_admin") return /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true });
  const shopAdmins = users.filter((u) => u.role === "shop_admin");
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto min-h-screen px-4 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 animate-fade-in", children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-2 font-display text-2xl font-bold", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-6 w-6 text-primary" }),
        " Super Admin Panel"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-muted-foreground", children: "Full system oversight and canteen management." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-8 grid gap-4 sm:grid-cols-4", children: [
      { icon: UtensilsCrossed, label: "Canteens", value: shops.length },
      { icon: Users, label: "Admins", value: shopAdmins.length },
      { icon: FileText, label: "Posts", value: blogPosts.length },
      { icon: Settings, label: "System", value: "Healthy" }
    ].map((stat) => /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-xl p-5", children: [
      /* @__PURE__ */ jsx(stat.icon, { className: "mb-2 h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: stat.label }),
      /* @__PURE__ */ jsx("p", { className: "font-display text-2xl font-bold", children: stat.value })
    ] }, stat.label)) }),
    /* @__PURE__ */ jsxs("div", { className: "glass-card mb-6 rounded-xl p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-lg font-semibold", children: "All Canteens" }),
        /* @__PURE__ */ jsxs(Link, { to: "/admin/canteens", children: /* @__PURE__ */ jsxs(Button, { variant: "hero", size: "sm", children: [
          /* @__PURE__ */ jsx(Building2, { className: "mr-1 h-3.5 w-3.5" }),
          " Manage Canteens"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: shops.map((shop) => {
        const admin = users.find((u) => u.id === shop.adminId);
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("img", { src: shop.image, alt: shop.name, className: "h-10 w-10 rounded-lg object-cover" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium", children: shop.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Admin: ",
                admin?.name || "Unassigned"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Badge, { className: shop.status === "open" ? "status-open border-0" : "status-closed border-0", children: shop.status }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }, shop.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "glass-card rounded-xl p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 font-display text-lg font-semibold", children: "Canteen Admins" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: shopAdmins.map((admin) => {
        const shop = shops.find((s) => s.id === admin.shopId);
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground", children: admin.avatar }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium", children: admin.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                admin.email,
                " \u2022 ",
                shop?.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
        ] }, admin.id);
      }) })
    ] })
  ] });
};
var stdin_default = SuperAdminDashboard;
export {
  stdin_default as default
};
