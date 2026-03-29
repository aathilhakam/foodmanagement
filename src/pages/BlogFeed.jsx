import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { blogPosts } from "@/data/mockData";
import BlogCard from "@/components/BlogCard";
import LoyaltyPoints from "@/components/LoyaltyPoints";
import LoyaltyRewards from "@/components/LoyaltyRewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Gift, TrendingUp } from "lucide-react";
const POSTS_PER_PAGE = 4;
const BlogFeed = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const paginated = blogPosts.slice(0, page * POSTS_PER_PAGE);
  
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto min-h-screen px-4 py-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8 animate-fade-in", children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-2 font-display text-3xl font-bold", children: [
        /* @__PURE__ */ jsx(Newspaper, { className: "h-7 w-7 text-primary" }),
        " Blog & News"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "Stay updated with the latest from SLIIT canteens." })
    ] }),
    
    /* @__PURE__ */ jsx(Tabs, { defaultValue: "blog", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "blog", children: "Blog & News" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "rewards", children: "All Rewards" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "loyalty", children: "My Points" })
      ] }),
      
      /* @__PURE__ */ jsx(TabsContent, { value: "blog", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-2", children: paginated.map((post, i) => /* @__PURE__ */ jsx("div", { className: "animate-fade-in", style: { animationDelay: `${i * 80}ms` }, children: /* @__PURE__ */ jsx(BlogCard, { post }) }, post.id)) }),
        page < totalPages && /* @__PURE__ */ jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsx(Button, { variant: "hero", onClick: () => setPage((p) => p + 1), children: "Load More" }) })
      ] }) }),
      
      /* @__PURE__ */ jsx(TabsContent, { value: "rewards", children: /* @__PURE__ */ jsx("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Gift, { className: "h-5 w-5 text-primary" }),
              "All Canteen Rewards"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Browse available rewards from all canteens. Earn points with every purchase!" }) })
        ] }),
        /* @__PURE__ */ jsx(LoyaltyRewards, { shopId: null })
      ] }) }),
      
      /* @__PURE__ */ jsx(TabsContent, { value: "loyalty", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
              "Your Loyalty Progress"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Track your points, spending, and available rewards all in one place." }) })
        ] }),
        /* @__PURE__ */ jsx(LoyaltyPoints, {})
      ] }) })
    ] })
  ] });
};
var stdin_default = BlogFeed;
export {
  stdin_default as default
};
