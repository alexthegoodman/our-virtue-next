"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Link } from "react-aria-components";
import MentionTextarea from "@/components/mentions/MentionTextarea";
import MentionText from "@/components/mentions/MentionText";
import Avatar from "@/components/Avatar";
import styles from "./page.module.css";

interface Church {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  category: string;
  memberCount: number;
  isJoined: boolean;
  isCreator: boolean;
}

interface ChurchPost {
  id: string;
  title?: string;
  content: string;
  imageUrl?: string;
  isPinned: boolean;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  _count: {
    comments: number;
  };
}

interface ChurchPostCommentData {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
}

interface Member {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  role: string;
  joinedAt: string;
}

export default function ChurchPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [church, setChurch] = useState<Church | null>(null);
  const [posts, setPosts] = useState<ChurchPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ChurchPostCommentData[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slug) {
      fetchChurchData();
    }
  }, [slug, user]);

  const fetchChurchData = async () => {
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const [churchRes, postsRes, membersRes] = await Promise.all([
        fetch(`/api/churches/${slug}`, { headers }),
        fetch(`/api/churches/${slug}/posts`, { headers }),
        fetch(`/api/churches/${slug}/members`, { headers }),
      ]);

      if (churchRes.ok) {
        const churchData = await churchRes.json();
        setChurch(churchData);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }
    } catch (error) {
      console.error("Error fetching church data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChurch = async () => {
    if (!user || !church) return;

    try {
      const response = await fetch(`/api/churches/${church.slug}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        // Update the church's joined status immediately
        setChurch(prevChurch => 
          prevChurch ? { 
            ...prevChurch, 
            isJoined: true, 
            memberCount: prevChurch.memberCount + 1 
          } : null
        );
        // Refresh members list
        fetchChurchData();
      }
    } catch (error) {
      console.error("Error joining church:", error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !church || !newPost.content.trim()) return;

    try {
      const response = await fetch(`/api/churches/${church.slug}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          title: newPost.title.trim() || undefined,
          content: newPost.content.trim(),
        }),
      });

      if (response.ok) {
        setNewPost({ title: "", content: "" });
        setShowNewPostForm(false);
        fetchChurchData(); // Refresh posts
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const fetchComments = async (postId: string) => {
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/churches/${slug}/posts/${postId}/comments`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(postId);
    if (!comments[postId]) {
      fetchComments(postId);
    }
  };

  const handleCreateComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const content = (newComment[postId] || "").trim();
    if (!user || !content) return;

    try {
      const response = await fetch(
        `/api/churches/${slug}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), comment],
        }));
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, _count: { comments: p._count.comments + 1 } }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const hasPostedInChurch = user
    ? posts.some((post) => post.author.id === user.id)
    : false;

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "PARENTS":
        return "For Parents";
      case "YOUNG_PEOPLE":
        return "For Young People";
      case "WORKERS":
        return "For Hard Workers";
      default:
        return category;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading church...</div>
      </div>
    );
  }

  if (!church) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Church not found</h1>
          <Link href="/churches" className={styles.backLink}>
            ← Back to Churches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Church Header */}
      <div className={styles.churchHeader}>
        <div className={styles.headerContent}>
          {church.imageUrl && (
            <div className={styles.churchImage}>
              <img src={church.imageUrl} alt={church.name} />
            </div>
          )}

          <div className={styles.churchInfo}>
            <div className={styles.churchCategory}>
              {getCategoryDisplayName(church.category)}
            </div>
            <h1>{church.name}</h1>
            <p className={styles.description}>{church.description}</p>
            <div className={styles.memberCount}>
              {church.memberCount}{" "}
              {church.memberCount === 1 ? "member" : "members"}
            </div>
          </div>

          <div className={styles.headerActions}>
            <Link href="/churches" className={styles.backButton}>
              ← Back to Churches
            </Link>

            {user && !church.isJoined && (
              <button onClick={handleJoinChurch} className={styles.joinButton}>
                Join Church
              </button>
            )}

            {church.isJoined && (
              <span className={styles.joinedBadge}>Member</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "posts" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "members" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          Members ({church.memberCount})
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {activeTab === "posts" && (
          <div className={styles.postsTab}>
            {user && church.isJoined && !hasPostedInChurch && !showNewPostForm && (
              <div className={styles.firstPostNudge}>
                <span>
                  👋 You haven&apos;t posted here yet — introduce yourself to
                  the community!
                </span>
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className={styles.firstPostButton}
                >
                  Make Your First Post
                </button>
              </div>
            )}

            {/* New Post Form */}
            {user && church.isJoined && (
              <div className={styles.newPostSection}>
                {!showNewPostForm ? (
                  <div
                    className={styles.newPostPrompt}
                    onClick={() => setShowNewPostForm(true)}
                  >
                    <span>Share something with the community...</span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleCreatePost}
                    className={styles.newPostForm}
                  >
                    <input
                      type="text"
                      placeholder="Post title (optional)"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className={styles.titleInput}
                    />
                    <MentionTextarea
                      placeholder="What's on your mind? (type @ to mention someone)"
                      value={newPost.content}
                      onChange={(content) =>
                        setNewPost((prev) => ({
                          ...prev,
                          content,
                        }))
                      }
                      className={styles.contentTextarea}
                      rows={4}
                      required
                    />
                    <div className={styles.formActions}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewPostForm(false);
                          setNewPost({ title: "", content: "" });
                        }}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button type="submit" className={styles.postButton}>
                        Post
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Posts List */}
            <div className={styles.postsList}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  id={`post-${post.id}`}
                  className={`${styles.postCard} ${
                    post.isPinned ? styles.pinnedPost : ""
                  }`}
                >
                  {post.isPinned && (
                    <div className={styles.pinnedBadge}>📌 Pinned</div>
                  )}

                  <div className={styles.postHeader}>
                    <div className={styles.postAuthor}>
                      <Avatar
                        username={post.author.username}
                        avatarUrl={post.author.avatarUrl}
                        size={40}
                      />
                      <div className={styles.authorMeta}>
                        <strong>@{post.author.username}</strong>
                        <span className={styles.postDate}>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {post.title && (
                    <h3 className={styles.postTitle}>{post.title}</h3>
                  )}

                  <div className={styles.postContent}>
                    {post.content.split("\n").map((line, i) => (
                      <p key={i}>
                        <MentionText content={line} />
                      </p>
                    ))}
                  </div>

                  {post.imageUrl && (
                    <div className={styles.postImage}>
                      <img src={post.imageUrl} alt="Post attachment" />
                    </div>
                  )}

                  <div className={styles.postFooter}>
                    <span
                      className={styles.commentCount}
                      onClick={() => toggleComments(post.id)}
                    >
                      {post._count.comments}{" "}
                      {post._count.comments === 1 ? "comment" : "comments"}
                    </span>
                  </div>

                  {expandedPostId === post.id && (
                    <div className={styles.commentsSection}>
                      {loadingComments[post.id] && (
                        <div className={styles.commentsLoading}>
                          Loading comments...
                        </div>
                      )}

                      {!loadingComments[post.id] && (
                        <div className={styles.commentsList}>
                          {(comments[post.id] || []).map((comment) => (
                            <div key={comment.id} className={styles.commentCard}>
                              <div className={styles.commentHeader}>
                                <Avatar
                                  username={comment.author.username}
                                  avatarUrl={comment.author.avatarUrl}
                                  size={28}
                                />
                                <strong>@{comment.author.username}</strong>
                                <span className={styles.commentDate}>
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <div className={styles.commentContent}>
                                <MentionText content={comment.content} />
                              </div>
                            </div>
                          ))}

                          {(comments[post.id] || []).length === 0 && (
                            <div className={styles.noComments}>
                              No comments yet.
                            </div>
                          )}
                        </div>
                      )}

                      {user && church.isJoined && (
                        <form
                          onSubmit={(e) => handleCreateComment(e, post.id)}
                          className={styles.commentForm}
                        >
                          <MentionTextarea
                            placeholder="Write a comment... (type @ to mention someone)"
                            value={newComment[post.id] || ""}
                            onChange={(content) =>
                              setNewComment((prev) => ({
                                ...prev,
                                [post.id]: content,
                              }))
                            }
                            className={styles.commentTextarea}
                            rows={2}
                            required
                          />
                          <div className={styles.commentFormActions}>
                            <button
                              type="submit"
                              className={styles.commentSubmitButton}
                              disabled={!(newComment[post.id] || "").trim()}
                            >
                              Reply
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {posts.length === 0 && (
                <div className={styles.emptyPosts}>
                  <p>
                    No posts yet.{" "}
                    {church.isJoined
                      ? "Be the first to share something!"
                      : "Join the church to participate in discussions."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className={styles.membersTab}>
            <div className={styles.membersList}>
              {members.map((member) => (
                <div key={member.id} className={styles.memberCard}>
                  <Avatar
                    username={member.user.username}
                    avatarUrl={member.user.avatarUrl}
                    size={44}
                  />
                  <div>
                    <div className={styles.memberInfo}>
                      <strong>@{member.user.username}</strong>
                      {member.role !== "MEMBER" && (
                        <span className={styles.memberRole}>{member.role}</span>
                      )}
                    </div>
                    <div className={styles.memberDate}>
                      Joined {formatDate(member.joinedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
