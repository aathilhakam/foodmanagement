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
  FileText,
  Plus
} from "lucide-react";

const ArticleManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== "shop_admin") return navigate("/dashboard");

  const shop = shops.find((s) => s.id === user.shopId);
  const [articles, setArticles] = useState(() => 
    storage.get(STORAGE_KEYS.BLOG_POSTS, seedPosts).filter(p => p.shopId === user.shopId)
  );
  const [comments, setComments] = useState(() => {
    const allComments = storage.get(STORAGE_KEYS.COMMENTS, seedComments);
    const articleIds = articles.map(a => a.id);
    return allComments.filter(c => articleIds.includes(c.postId));
  });

  const [editingArticle, setEditingArticle] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      const updatedArticles = storage.get(STORAGE_KEYS.BLOG_POSTS, seedPosts).filter(p => p.shopId === user.shopId);
      const updatedComments = storage.get(STORAGE_KEYS.COMMENTS, seedComments);
      const articleIds = updatedArticles.map(a => a.id);
      const filteredComments = updatedComments.filter(c => articleIds.includes(c.postId));
      
      setArticles(updatedArticles);
      setComments(filteredComments);
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('newComment', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('newComment', handleUpdate);
    };
  }, [user.shopId]);

  const persistArticles = (next) => {
    setArticles(next);
    const allPosts = storage.get(STORAGE_KEYS.BLOG_POSTS, seedPosts);
    const updatedPosts = allPosts.map(post => 
      next.find(a => a.id === post.id) || post
    );
    storage.set(STORAGE_KEYS.BLOG_POSTS, updatedPosts);
  };

  const persistComments = (next) => {
    setComments(next);
    const allComments = storage.get(STORAGE_KEYS.COMMENTS, seedComments);
    const updatedComments = allComments.map(comment => 
      next.find(c => c.id === comment.id) || comment
    );
    storage.set(STORAGE_KEYS.COMMENTS, updatedComments);
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article.id);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditExcerpt(article.excerpt);
  };

  const handleSaveArticle = () => {
    if (!editingArticle || !editTitle.trim() || !editContent.trim()) return;

    const updatedArticles = articles.map(article =>
      article.id === editingArticle
        ? { 
            ...article, 
            title: editTitle.trim(),
            content: editContent.trim(),
            excerpt: editExcerpt.trim(),
            updatedAt: new Date().toISOString()
          }
        : article
    );

    persistArticles(updatedArticles);
    setEditingArticle(null);
    setEditTitle("");
    setEditContent("");
    setEditExcerpt("");
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveComment = () => {
    if (!editingComment || !editCommentContent.trim()) return;

    const updatedComments = comments.map(comment =>
      comment.id === editingComment
        ? { ...comment, content: editCommentContent.trim(), updatedAt: new Date().toISOString() }
        : comment
    );

    persistComments(updatedComments);
    setEditingComment(null);
    setEditCommentContent("");
  };

  const handleDeleteComment = (commentId) => {
    persistComments(comments.filter(c => c.id !== commentId));
  };

  const handleTogglePin = (commentId) => {
    persistComments(comments.map(comment =>
      comment.id === commentId ? { ...comment, isPinned: !comment.isPinned } : comment
    ));
  };

  const getCommentCount = (articleId) => {
    return comments.filter(c => c.postId === articleId).length;
  };

  const getArticleComments = (articleId) => {
    return comments.filter(c => c.postId === articleId);
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
            <FileText className="h-6 w-6 text-primary" />
            Article Management
          </h1>
        </div>
        <p className="text-muted-foreground">Manage articles and comments for {shop?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold text-primary">{articles.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        
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
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {articles.length > 0 ? Math.round(comments.length / articles.length) : 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles with Comments */}
      <div className="space-y-8">
        {articles.map((article) => {
          const articleComments = getArticleComments(article.id);
          const commentCount = articleComments.length;
          
          return (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {editingArticle === article.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        article.title
                      )}
                      <Badge variant="secondary">{commentCount} comments</Badge>
                    </CardTitle>
                    
                    {editingArticle === article.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editExcerpt}
                          onChange={(e) => setEditExcerpt(e.target.value)}
                          placeholder="Article excerpt..."
                          rows={2}
                        />
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Article content..."
                          rows={6}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveArticle}>
                            <Save className="mr-1 h-3 w-3" />
                            Save Article
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingArticle(null);
                              setEditTitle("");
                              setEditContent("");
                              setEditExcerpt("");
                            }}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-muted-foreground">{article.excerpt}</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.content}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditArticle(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              {/* Comments Section */}
              {articleComments.length > 0 && (
                <CardContent className="space-y-4 border-t">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Comments ({articleComments.length})
                  </h4>
                  
                  {articleComments
                    .sort((a, b) => {
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
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
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </div>
                                {comment.likes > 0 && (
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    {comment.likes}
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
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              rows={3}
                              className="resize-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveComment}>
                                <Save className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditCommentContent("");
                                }}
                              >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{comment.content}</p>
                        )}
                      </div>
                    ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleManagement;
