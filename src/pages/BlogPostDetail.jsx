import { jsx, jsxs } from "react/jsx-runtime";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "@/data/mockData";
import CommentSection from "@/components/CommentSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
const BlogPostDetail = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);
  if (!post) return /* @__PURE__ */ jsx("div", { className: "flex min-h-[60vh] items-center justify-center text-muted-foreground", children: "Post not found." });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative h-72 overflow-hidden md:h-96", children: [
      /* @__PURE__ */ jsx("img", { src: post.image, alt: post.title, className: "h-full w-full object-cover" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" })
    ] }),
    /* @__PURE__ */ jsx("article", { className: "container mx-auto -mt-20 max-w-3xl px-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Link, { to: "/blog", children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "mb-4", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
        " Back to Blog"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: post.tags.map((tag) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: tag }, tag)) }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 font-display text-3xl font-bold md:text-4xl", children: post.title }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-4 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" }),
          " ",
          post.author
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
          " ",
          new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: `/shop/${post.shopId}`, className: "text-primary hover:underline", children: post.shopName })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 space-y-4 text-foreground/80 leading-relaxed", children: post.content.split("\n\n").map((para, i) => /* @__PURE__ */ jsx("p", { children: para }, i)) }),
      /* @__PURE__ */ jsx("hr", { className: "my-10 border-border/50" }),
      /* @__PURE__ */ jsx(CommentSection, { postId: post.id })
    ] }) })
  ] });
};
var stdin_default = BlogPostDetail;
export {
  stdin_default as default
};
