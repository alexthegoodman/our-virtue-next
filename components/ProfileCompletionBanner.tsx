"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-aria-components";
import styles from "./ProfileCompletionBanner.module.css";

const DISMISS_KEY = "profile-banner-dismissed";

export default function ProfileCompletionBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!user || dismissed) return null;

  const isIncomplete = !user.avatarUrl || !user.bio;
  if (!isIncomplete) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className={styles.banner}>
      <span className={styles.text}>
        Add a profile picture and bio so other members can get to know you
        before you meet.
      </span>
      <div className={styles.actions}>
        <Link href="/profile/edit" className={styles.completeButton}>
          Complete Profile
        </Link>
        <button
          onClick={handleDismiss}
          className={styles.dismissButton}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
