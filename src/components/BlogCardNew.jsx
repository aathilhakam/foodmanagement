import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, MessageCircle, ThumbsUp } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const BlogCard = ({ post }) => {
  const [comments] = useState(() => {
    const allComments = storage.get(STORAGE_KEYS.COMMENTS, []);
    // Get comments for this specific blog post
    const blogComments = allComments.filter(comment => comment.postId === post.id);
    // Also get shop-specific comments for the same shop
    const shopComments = allComments.filter(comment => comment.postId === `shop-${post.shopId}`);
    // Combine both types of comments
    return [...blogComments, ...shopComments];
  });

  const recentComments = comments.slice(0, 2);
  const totalComments = comments.length;
  const totalLikes = comments.reduce((sum, comment) => sum + (comment.likes || 0), 0);

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
            {new Date(post.createdAt).toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric", 
              year: "numeric" 
            })}
            <span className="text-primary">•</span>
            <span>{post.shopName}</span>
          </div>
          
          <h3 className="font-display text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
          
          {/* Comments section */}
          {totalComments > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {totalComments} comments
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {totalLikes} likes
                </span>
              </div>
              
              {recentComments.length > 0 && (
                <div className="space-y-1">
                  {recentComments.map((comment) => (
                    <div key={comment.id} className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                      <span className="font-medium text-foreground">{comment.userName}</span>
                      : {comment.content.length > 50 ? comment.content.substring(0, 50) + "..." : comment.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
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
