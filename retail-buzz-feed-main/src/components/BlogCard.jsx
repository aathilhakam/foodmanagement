import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Pin } from "lucide-react";

const BlogCard = ({ post }) => {
  return (
    <Link to={`/blog/${post.id}`} className="group">
      <div className="glass-card hover-lift overflow-hidden rounded-xl">
        <div className="relative h-52 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Pinned Badge */}
          {post.isPinned && (
            <div className="absolute top-3 left-3">
              <Badge variant="default" className="bg-primary">
                <Pin className="mr-1 h-3 w-3" />
                Pinned
              </Badge>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 flex gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            <span className="text-primary">•</span>
            <span>{post.shopName}</span>
          </div>
          
          <h3 className="font-display text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
          
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
            Read More
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
