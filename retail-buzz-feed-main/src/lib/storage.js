const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const storage = {
  get(key, fallback) {
    if (typeof window === "undefined") return fallback;
    return safeJsonParse(window.localStorage.getItem(key), fallback);
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
};

export const STORAGE_KEYS = {
  COMMENTS: "sliit_eats_comments_v1",
  OFFERS: "sliit_eats_offers_v1",
  COMMENT_REACTIONS: "sliit_eats_comment_reactions_v1",
  BLOG_POSTS: "sliit_eats_blog_posts_v1",
  SHOPS: "sliit_eats_shops_v1",
  FOOD_ITEMS: "sliit_eats_food_items_v1",
};

