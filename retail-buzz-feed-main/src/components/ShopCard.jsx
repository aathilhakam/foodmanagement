import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const ShopCard = ({ shop }) => /* @__PURE__ */ jsx(Link, { to: `/shop/${shop.id}`, className: "group", children: /* @__PURE__ */ jsxs("div", { className: "glass-card hover-lift overflow-hidden rounded-xl", children: [
  /* @__PURE__ */ jsxs("div", { className: "relative h-48 overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: shop.image,
        alt: shop.name,
        className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" }),
    /* @__PURE__ */ jsx(Badge, { className: `absolute right-3 top-3 ${shop.status === "open" ? "status-open border-0" : "status-closed border-0"}`, children: shop.status === "open" ? "\u25CF Open" : "\u25CF Closed" })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-semibold", children: shop.name }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 line-clamp-2 text-sm text-muted-foreground", children: shop.description }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
        " ",
        shop.address
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-primary", children: [
        /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 fill-primary" }),
        " ",
        shop.rating
      ] })
    ] })
  ] })
] }) });
var stdin_default = ShopCard;
export {
  stdin_default as default
};
