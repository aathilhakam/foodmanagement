import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
const BlogCard = ({ post }) => /* @__PURE__ */ jsx(Link, { to: `/blog/${post.id}`, className: "group", children: /* @__PURE__ */ jsxs("div", { className: "glass-card hover-lift overflow-hidden rounded-xl", children: [
  /* @__PURE__ */ jsxs("div", { className: "relative h-52 overflow-hidden", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: post.image,
        alt: post.title,
        className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-3 flex gap-2", children: post.tags.slice(0, 2).map((tag) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, tag)) })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
      new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "\u2022" }),
      /* @__PURE__ */ jsx("span", { children: post.shopName })
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "font-display text-lg font-semibold leading-tight transition-colors group-hover:text-primary", children: post.title }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 text-sm text-muted-foreground", children: post.excerpt }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-1 text-sm font-medium text-primary", children: [
      "Read More ",
      /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-1" })
    ] })
  ] })
] }) });
var stdin_default = BlogCard;
export {
  stdin_default as default
};
