import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { blogPosts as seedPosts, shops } from "@/data/mockData";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Pin, 
  Eye, 
  FileText,
  Calendar,
  Tag,
  Save,
  X
} from "lucide-react";

const PostManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.role !== "shop_admin") return navigate("/dashboard");

  const shop = shops.find((s) => s.id === user.shopId);
  const [posts, setPosts] = useState(() => 
    storage.get(STORAGE_KEYS.BLOG_POSTS, seedPosts).filter(p => p.shopId === user.shopId)
  );
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    image: "",
    isPinned: false,
  });

  const persistPosts = (next) => {
    setPosts(next);
    storage.set(STORAGE_KEYS.BLOG_POSTS, next);
  };

  const handleCreatePost = () => {
    const title = newPost.title.trim();
    const content = newPost.content.trim();
    const excerpt = newPost.excerpt.trim() || content.substring(0, 150) + "...";

    if (!title || !content) return;

    const post = {
      id: `p-${Date.now()}`,
      title,
      content,
      excerpt,
      tags: newPost.tags.filter(tag => tag.trim()),
      image: newPost.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=600`,
      createdAt: new Date().toISOString().split('T')[0],
      shopId: user.shopId,
      shopName: shop.name,
      author: shop.name,
      isPinned: newPost.isPinned,
    };

    persistPosts([post, ...posts]);
    setNewPost({ title: "", content: "", excerpt: "", tags: [], image: "", isPinned: false });
    setIsCreating(false);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags,
      image: post.image,
      isPinned: post.isPinned,
    });
  };

  const handleUpdatePost = () => {
    if (!editingPost) return;

    const updatedPosts = posts.map(post => 
      post.id === editingPost.id 
        ? { ...post, ...newPost }
        : post
    );

    persistPosts(updatedPosts);
    setEditingPost(null);
    setNewPost({ title: "", content: "", excerpt: "", tags: [], image: "" });
  };

  const handleDeletePost = (postId) => {
    persistPosts(posts.filter(p => p.id !== postId));
  };

  const handleTogglePin = (postId) => {
    persistPosts(posts.map(p => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));
  };

  const handleAddTag = (tag) => {
    if (tag.trim() && !newPost.tags.includes(tag.trim())) {
      setNewPost(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewPost(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
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
            Post Management
          </h1>
        </div>
        <p className="text-muted-foreground">Create and manage blog posts for {shop?.name}</p>
      </div>

      {/* Create/Edit Post Form */}
      {(isCreating || editingPost) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingPost ? "Edit Post" : "Create New Post"}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPost(null);
                  setNewPost({ title: "", content: "", excerpt: "", tags: [], image: "" });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Post title"
                className="mb-2"
              />
              <Input
                value={newPost.excerpt}
                onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief excerpt (optional)"
                className="mb-2"
              />
              <Input
                value={newPost.image}
                onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.value }))}
                placeholder="Image URL (optional)"
                className="mb-2"
              />
            </div>
            
            <div>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here..."
                rows={8}
                className="mb-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {/* Pin Toggle for Admin */}
            {user && (user.role === 'super_admin' || user.role === 'shop_admin') && (
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                <Switch
                  id="pin-post"
                  checked={newPost.isPinned}
                  onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, isPinned: checked }))}
                />
                <label htmlFor="pin-post" className="text-sm font-medium cursor-pointer">
                  Pin this post (will appear at the top)
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={editingPost ? handleUpdatePost : handleCreatePost}>
                <Save className="mr-2 h-4 w-4" />
                {editingPost ? "Update Post" : "Publish Post"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingPost(null);
                  setNewPost({ title: "", content: "", excerpt: "", tags: [], image: "", isPinned: false });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Post Button */}
      {!isCreating && !editingPost && (
        <div className="mb-6">
          <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className={post.isPinned ? "border-primary/30 bg-primary/5" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    {post.isPinned && (
                      <Badge variant="default" className="bg-primary">
                        <Pin className="mr-1 h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.createdAt}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {post.tags.length} tags
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(post.id)}
                    className={post.isPinned ? "text-primary" : "text-muted-foreground"}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPost(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Start engaging with your customers by creating your first post.</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostManagement;
