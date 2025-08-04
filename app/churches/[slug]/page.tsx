"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Link } from "react-aria-components";
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
  };
  _count: {
    comments: number;
  };
}

interface Member {
  id: string;
  user: {
    id: string;
    username: string;
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
      const response = await fetch(`/api/churches/${church.id}/posts`, {
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
                    <textarea
                      placeholder="What's on your mind?"
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          content: e.target.value,
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
                  className={`${styles.postCard} ${
                    post.isPinned ? styles.pinnedPost : ""
                  }`}
                >
                  {post.isPinned && (
                    <div className={styles.pinnedBadge}>📌 Pinned</div>
                  )}

                  <div className={styles.postHeader}>
                    <div className={styles.postAuthor}>
                      <strong>@{post.author.username}</strong>
                      <span className={styles.postDate}>
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {post.title && (
                    <h3 className={styles.postTitle}>{post.title}</h3>
                  )}

                  <div className={styles.postContent}>
                    {post.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  {post.imageUrl && (
                    <div className={styles.postImage}>
                      <img src={post.imageUrl} alt="Post attachment" />
                    </div>
                  )}

                  <div className={styles.postFooter}>
                    <span className={styles.commentCount}>
                      {post._count.comments}{" "}
                      {post._count.comments === 1 ? "comment" : "comments"}
                    </span>
                  </div>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
