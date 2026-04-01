import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { blogPosts as seedPosts, comments as seedComments, shops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  MessageCircle, 
  Trash2, 
  Pin, 
  Edit, 
  Save,
  X,
  Eye,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Reply,
  FileText
} from "lucide-react";

const CommentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== "shop_admin") return navigate("/dashboard");

  const shop = shops.find((s) => s.id === user.shopId);
  const [posts] = useState(() => 
    storage.get(STORAGE_KEYS.BLOG_POSTS, seedPosts).filter(p => p.shopId === user.shopId)
  );
  const [comments, setComments] = useState(() => {
    const allComments = storage.get(STORAGE_KEYS.COMMENTS, seedComments);
    const shopPostIds = posts.map(p => p.id);
    const shopCommentId = `shop-${user.shopId}`;
    
    // Filter comments for both blog posts and shop-specific comments
    return allComments.filter(c => 
      shopPostIds.includes(c.postId) || c.postId === shopCommentId
    );
  });

  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Listen for new comments in real-time
  useEffect(() => {
    const handleCommentUpdate = () => {
      const allComments = storage.get(STORAGE_KEYS.COMMENTS, seedComments);
      const shopPostIds = posts.map(p => p.id);
      const shopCommentId = `shop-${user.shopId}`;
      
      const filteredComments = allComments.filter(c => 
        shopPostIds.includes(c.postId) || c.postId === shopCommentId
      );
      setComments(filteredComments);
    };

    // Listen for custom comment events
    const handleNewComment = (event) => {
      console.log('New comment event received:', event.detail);
      handleCommentUpdate();
    };

    // Listen for storage changes
    window.addEventListener('storage', handleCommentUpdate);
    window.addEventListener('newComment', handleNewComment);

    return () => {
      window.removeEventListener('storage', handleCommentUpdate);
      window.removeEventListener('newComment', handleNewComment);
    };
  }, [user.shopId, posts]);

  const persistComments = (next) => {
    setComments(next);
    storage.set(STORAGE_KEYS.COMMENTS, next);
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editingComment || !editContent.trim()) return;

    const updatedComments = comments.map(comment =>
      comment.id === editingComment
        ? { ...comment, content: editContent.trim(), updatedAt: new Date().toISOString() }
        : comment
    );

    persistComments(updatedComments);
    setEditingComment(null);
    setEditContent("");
  };

  const handleDeleteComment = (commentId) => {
    persistComments(comments.filter(c => c.id !== commentId));
  };

  const handleTogglePin = (commentId) => {
    persistComments(comments.map(comment =>
      comment.id === commentId ? { ...comment, isPinned: !comment.isPinned } : comment
    ));
  };

  const getPostTitle = (postId) => {
    if (postId === `shop-${user.shopId}`) {
      return `${shop?.name} - Shop Comments`;
    }
    const post = posts.find(p => p.id === postId);
    return post?.title || "Unknown Post";
  };

  const groupedComments = comments.reduce((groups, comment) => {
    if (!groups[comment.postId]) {
      groups[comment.postId] = [];
    }
    groups[comment.postId].push(comment);
    return groups;
  }, {});

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
            <MessageCircle className="h-6 w-6 text-primary" />
            Comment Management
          </h1>
        </div>
        <p className="text-muted-foreground">Manage comments on posts from {shop?.name}</p>
      </div>

      {/* Comments Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Comments</p>
                <p className="text-2xl font-bold text-primary">{comments.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pinned Comments</p>
                <p className="text-2xl font-bold text-primary">
                  {comments.filter(c => c.isPinned).length}
                </p>
              </div>
              <Pin className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Posts with Comments</p>
                <p className="text-2xl font-bold text-primary">{Object.keys(groupedComments).length}</p>
              </div>
              <Eye className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments Grouped by Post */}
      <div className="space-y-8">
        {Object.entries(groupedComments).map(([postId, postComments]) => (
          <Card key={postId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {getPostTitle(postId)}
                <Badge variant="secondary">{postComments.length} comments</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {postComments
                .sort((a, b) => {
                  // Pinned comments first
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  // Then by date (newest first)
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`border rounded-lg p-4 ${comment.isPinned ? "border-primary/30 bg-primary/5" : "border-border/50 bg-background/50"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.userName}</span>
                            {comment.isPinned && (
                              <Badge variant="default" className="bg-primary text-xs">
                                <Pin className="mr-1 h-2 w-2" />
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {comment.createdAt}
                            </div>
                            {comment.likes > 0 && (
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {comment.likes}
                              </div>
                            )}
                            {comment.dislikes > 0 && (
                              <div className="flex items-center gap-1">
                                <ThumbsDown className="h-3 w-3" />
                                {comment.dislikes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(comment.id)}
                          className={comment.isPinned ? "text-primary" : "text-muted-foreground"}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditComment(comment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comment Content */}
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="mr-1 h-3 w-3" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent("");
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    )}

                    {/* Replies (if any) */}
                    {comment.parentId && (
                      <div className="mt-3 pl-4 border-l-2 border-border/30">
                        <p className="text-xs text-muted-foreground mb-1">Reply to previous comment</p>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}

        {comments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
              <p className="text-muted-foreground">When customers start commenting on your posts, they'll appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommentManagement;
