import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  commentCount: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorName: string;
  comment: string;
  createdAt: string;
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, author_name, image_url, caption, created_at, community_comments(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCommunityPosts failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name ?? "Vizinho(a) verde",
    imageUrl: row.image_url,
    caption: row.caption,
    createdAt: row.created_at,
    commentCount: Array.isArray(row.community_comments) ? (row.community_comments[0]?.count ?? 0) : 0,
  }));
}

export async function getCommunityPost(id: string): Promise<CommunityPost | undefined> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, author_name, image_url, caption, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return undefined;

  return {
    id: data.id,
    userId: data.user_id,
    authorName: data.author_name ?? "Vizinho(a) verde",
    imageUrl: data.image_url,
    caption: data.caption,
    createdAt: data.created_at,
    commentCount: 0,
  };
}

export async function getCommunityComments(postId: string): Promise<CommunityComment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("community_comments")
    .select("id, post_id, author_name, comment, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCommunityComments failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    authorName: row.author_name ?? "Vizinho(a) verde",
    comment: row.comment,
    createdAt: row.created_at,
  }));
}
