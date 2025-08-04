"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
}

export default function ChurchesPage() {
  const { user } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [userChurchCount, setUserChurchCount] = useState(0);

  useEffect(() => {
    fetchChurches();
  }, [user]);

  const fetchChurches = async () => {
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem("auth-token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/churches", { headers });
      if (response.ok) {
        const data = await response.json();
        setChurches(data.churches);
        setUserChurchCount(data.userChurchCount || 0);
      }
    } catch (error) {
      console.error("Error fetching churches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChurch = async (churchSlug: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/churches/${churchSlug}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        // Update the specific church's joined status immediately
        setChurches(prevChurches => 
          prevChurches.map(church => 
            church.slug === churchSlug 
              ? { ...church, isJoined: true, memberCount: church.memberCount + 1 }
              : church
          )
        );
      }
    } catch (error) {
      console.error("Error joining church:", error);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading churches...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Digital Churches</h1>
        <p>
          Join communities of faith and connect with others on similar journeys.
        </p>

        {user && (
          <div className={styles.createChurchSection}>
            {userChurchCount === 0 ? (
              <Link href="/churches/create" className={styles.createButton}>
                Create Your Church
              </Link>
            ) : (
              <p className={styles.limitMessage}>
                You have created your church. Each user can create up to 1
                church.
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.churchesGrid}>
        {churches.map((church) => (
          <div key={church.id} className={styles.churchCard}>
            {church.imageUrl && (
              <div className={styles.churchImage}>
                <img src={church.imageUrl} alt={church.name} />
              </div>
            )}

            <div className={styles.churchContent}>
              <div className={styles.churchCategory}>
                {getCategoryDisplayName(church.category)}
              </div>

              <h2>{church.name}</h2>
              <p className={styles.description}>{church.description}</p>

              <div className={styles.churchMeta}>
                <span className={styles.memberCount}>
                  {church.memberCount}{" "}
                  {church.memberCount === 1 ? "member" : "members"}
                </span>
              </div>
            </div>

            <div className={styles.churchActions}>
              <Link
                href={`/churches/${church.slug}`}
                className={styles.viewButton}
              >
                View Church
              </Link>

              {user && !church.isJoined && (
                <button
                  onClick={() => handleJoinChurch(church.slug)}
                  className={styles.joinButton}
                >
                  Join
                </button>
              )}

              {church.isJoined && (
                <span className={styles.joinedBadge}>Joined</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {churches.length === 0 && (
        <div className={styles.emptyState}>
          <p>No churches available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
