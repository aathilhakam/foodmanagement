import { useMemo, useState } from "react";
import { blogPosts, comments as seedComments } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { MessageCircle, Send, Star, ThumbsUp, ThumbsDown, Pin, Pencil, Trash2 } from "lucide-react";

const formatTimeAgo = (value) => {
  const createdMs = new Date(value).getTime();
  const nowMs = Date.now();
  const diffMs = Math.max(nowMs - createdMs, 0);
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

const sortPinnedThenNewest = (a, b) => {
  const aPinned = !!a.isPinned;
  const bPinned = !!b.isPinned;
  if (aPinned !== bPinned) return aPinned ? -1 : 1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((value) => (
      <Star key={value} className={`h-3.5 w-3.5 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
    ))}
  </div>
);

const RatingPicker = ({ rating, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((value) => (
      <button
        key={value}
        type="button"
        onClick={() => onChange(value)}
        className="text-muted-foreground transition-colors hover:text-amber-400"
        aria-label={`Set rating ${value}`}
      >
        <Star className={`h-5 w-5 ${value <= rating ? "fill-amber-400 text-amber-400" : ""}`} />
      </button>
    ))}
  </div>
);

const CommentItem = ({
  comment,
  replies,
  reactions,
  canModerate,
  canDeleteOwn,
  editingId,
  editDraft,
  setEditingId,
  setEditDraft,
  onLike,
  onDislike,
  onTogglePin,
  onDelete,
  onSaveEdit,
}) => (
  <div className={`rounded-lg border border-border/50 p-4 ${comment.isPinned ? "border-primary/30 bg-primary/5" : "bg-card/40"}`}>
    {comment.isPinned && (
      <div className="mb-2 flex items-center gap-1 text-xs text-primary">
        <Pin className="h-3 w-3" /> Pinned
      </div>
    )}

    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold">
        {comment.userName?.[0] ?? "U"}
      </span>
      <span className="text-sm font-medium">{comment.userName}</span>
      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
      <StarRating rating={comment.rating || 0} />
    </div>

    {editingId === comment.id ? (
      <div className="mt-2 space-y-2">
        <Textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} className="min-h-[70px] bg-card/40" />
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="hero" onClick={() => onSaveEdit(comment.id)}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingId(null);
              setEditDraft("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    ) : (
      <p className="mt-2 text-sm text-foreground/80">{comment.content}</p>
    )}

    <div className="mt-2 flex items-center gap-3">
      <button
        type="button"
        onClick={() => onLike(comment.id)}
        className={`flex items-center gap-1 text-xs ${
          reactions[comment.id] === "like" ? "text-primary" : "text-muted-foreground hover:text-primary"
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" /> {comment.likes}
      </button>
      <button
        type="button"
        onClick={() => onDislike(comment.id)}
        className={`flex items-center gap-1 text-xs ${
          reactions[comment.id] === "dislike" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" /> {comment.dislikes ?? 0}
      </button>

      {(canModerate || canDeleteOwn) && (
        <div className="ml-auto flex items-center gap-1">
          {canModerate && (
            <button
              type="button"
              onClick={() => onTogglePin(comment.id)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                comment.isPinned ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
              title={comment.isPinned ? "Unpin" : "Pin"}
            >
              <Pin className="h-3.5 w-3.5" />
              {comment.isPinned ? "Unpin" : "Pin"}
            </button>
          )}

          {canModerate && (
            <button
              type="button"
              onClick={() => {
                setEditingId(comment.id);
                setEditDraft(comment.content || "");
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>

    {replies.length > 0 && (
      <div className="ml-6 mt-3 space-y-3 border-l-2 border-border/30 pl-4">
        {replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            replies={[]}
            reactions={reactions}
            canModerate={canModerate}
            canDeleteOwn={canDeleteOwn}
            editingId={editingId}
            editDraft={editDraft}
            setEditingId={setEditingId}
            setEditDraft={setEditDraft}
            onLike={onLike}
            onDislike={onDislike}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
            onSaveEdit={onSaveEdit}
          />
        ))}
      </div>
    )}
  </div>
);

const CommentSection = ({ postId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState(() => storage.get(STORAGE_KEYS.COMMENTS, seedComments));
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [commentReactions, setCommentReactions] = useState(() => storage.get(STORAGE_KEYS.COMMENT_REACTIONS, {}));
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  const post = blogPosts.find((p) => p.id === postId);
  const canModerate = !!user && user.role === "shop_admin" && post?.shopId && user.shopId === post.shopId;
  const currentUserId = user?.id || "anonymous";
  const myReactions = commentReactions[currentUserId] || {};

  const topLevelComments = useMemo(
    () => comments.filter((comment) => comment.postId === postId && !comment.parentId).sort(sortPinnedThenNewest),
    [comments, postId]
  );

  const getReplies = (commentId) => comments.filter((comment) => comment.parentId === commentId).sort(sortPinnedThenNewest);

  const persistComments = (next) => {
    setComments(next);
    storage.set(STORAGE_KEYS.COMMENTS, next);
  };

  const persistReactions = (next) => {
    setCommentReactions(next);
    storage.set(STORAGE_KEYS.COMMENT_REACTIONS, next);
  };

  const handleLike = (commentId) => {
    if (!isAuthenticated) return;
    if (myReactions[commentId]) return;

    persistComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: (comment.likes || 0) + 1 } : comment)),
    );
    persistReactions({
      ...commentReactions,
      [currentUserId]: { ...myReactions, [commentId]: "like" },
    });
  };

  const handleDislike = (commentId) => {
    if (!isAuthenticated) return;
    if (myReactions[commentId]) return;

    persistComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, dislikes: (comment.dislikes || 0) + 1 } : comment)),
    );
    persistReactions({
      ...commentReactions,
      [currentUserId]: { ...myReactions, [commentId]: "dislike" },
    });
  };

  const handleTogglePin = (commentId) => {
    if (!canModerate) return;
    persistComments(comments.map((c) => (c.id === commentId ? { ...c, isPinned: !c.isPinned } : c)));
  };

  const handleDelete = (commentId) => {
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;

    const canDeleteOwn = !!user && target.userId === user.id;
    if (!canModerate && !canDeleteOwn) return;

    const toDelete = new Set([commentId]);
    comments.forEach((c) => {
      if (c.parentId === commentId) toDelete.add(c.id);
    });

    persistComments(comments.filter((c) => !toDelete.has(c.id)));
  };

  const handleSaveEdit = (commentId) => {
    if (!canModerate) return;
    const nextText = editDraft.trim();
    if (!nextText) return;

    persistComments(comments.map((c) => (c.id === commentId ? { ...c, content: nextText } : c)));
    setEditingId(null);
    setEditDraft("");
  };

  const handleSendComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    const createdAt = new Date().toISOString();
    const comment = {
      id: `c-${Date.now()}`,
      postId,
      userId: user?.id || "anonymous",
      userName: user?.name || "Student",
      content: trimmed,
      createdAt,
      likes: 0,
      dislikes: 0,
      isPinned: false,
      rating: newRating,
    };

    persistComments([comment, ...comments]);
    setNewComment("");
    setNewRating(5);
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
        <MessageCircle className="h-5 w-5 text-primary" />
        Comments
        <Badge variant="secondary">{topLevelComments.length}</Badge>
      </h3>

      {isAuthenticated ? (
        <div className="space-y-2 rounded-lg border border-border/50 bg-card/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Your rating</span>
            <RatingPicker rating={newRating} onChange={setNewRating} />
          </div>
          <div className="flex gap-3">
            <Textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[80px] bg-card/40"
            />
            <Button type="button" onClick={handleSendComment} variant="hero" size="icon" className="shrink-0 self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 bg-card/40 p-4 text-center text-sm text-muted-foreground">
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>{" "}
          to leave a comment
        </div>
      )}

      <div className="space-y-3">
        {topLevelComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={getReplies(comment.id)}
            reactions={myReactions}
            canModerate={canModerate}
            canDeleteOwn={!!user && comment.userId === user.id}
            editingId={editingId}
            editDraft={editDraft}
            setEditingId={setEditingId}
            setEditDraft={setEditDraft}
            onLike={handleLike}
            onDislike={handleDislike}
            onTogglePin={handleTogglePin}
            onDelete={handleDelete}
            onSaveEdit={handleSaveEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
