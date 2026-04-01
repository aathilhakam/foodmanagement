import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, MessageCircle, ThumbsUp } from "lucide-react";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { useState } from 'react';

const BlogCard = ({ post }) => {
  const [comments] = useState(() => {
    const allComments = storage.get(STORAGE_KEYS.COMMENTS, []);
    return allComments.filter(comment => comment.postId === post.id);
  });

  const recentComments = comments.slice(0, 2);
  const totalComments = comments.length;
  const totalLikes = comments.reduce((sum, comment) => sum + (comment.likes || 0), 0);

  return /* @__PURE__ */ jsx(Link, { to: `/blog/${post.id}`, className: "group", children: /* @__PURE__ */ jsxs("div", { className: "glass-card hover-lift overflow-hidden rounded-xl", children: [
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
      
      // Comments section
      totalComments > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "h-3 w-3" }),
            totalComments + " comments"
          ]}),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(ThumbsUp, { className: "h-3 w-3" }),
            totalLikes + " likes"
          ]})
        ]}),
        recentComments.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-1", children: recentComments.map((comment) => /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: comment.userName }),
          ": ",
          comment.content.length > 50 ? comment.content.substring(0, 50) + "..." : comment.content
        ]}, comment.id)) })
      ]}),
      
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-1 text-sm font-medium text-primary", children: [
        "Read More ",
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-1" })
      ] })
    ] })
  ] }) });
};
var stdin_default = BlogCard;
export {
  stdin_default as default
};
