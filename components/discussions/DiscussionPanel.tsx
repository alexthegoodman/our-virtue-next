"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ThreadList from "./ThreadList";
import ThreadForm from "./ThreadForm";
import ThreadView from "./ThreadView";
import AuthModal from "../auth/AuthModal";
import styles from "./DiscussionPanel.module.css";

interface DiscussionPanelProps {
  stanzaPath: string;
}

export default function DiscussionPanel({ stanzaPath }: DiscussionPanelProps) {
  const { user, login, logout } = useAuth();
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  const handleNewThread = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowThreadForm(true);
  };

  const handleThreadCreated = () => {
    setShowThreadForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseThread = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("thread");
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Discussion</h3>
      </div>

      <div className={styles.controls}>
        <button
          onClick={handleNewThread}
          className={styles.newThreadButton}
          // disabled={!user}
        >
          {user ? "New Discussion" : "Sign in to start a discussion"}
        </button>
      </div>

      {showThreadForm && (
        <ThreadForm
          stanzaPath={stanzaPath}
          onSubmit={handleThreadCreated}
          onCancel={() => setShowThreadForm(false)}
        />
      )}

      <ThreadList stanzaPath={stanzaPath} refreshTrigger={refreshTrigger} />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
      />

      {threadId && (
        <ThreadView threadId={threadId} onClose={handleCloseThread} />
      )}
    </div>
  );
}
