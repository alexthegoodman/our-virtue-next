'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ThreadList.module.css';

interface Thread {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  voteScore: number;
  _count: {
    comments: number;
  };
}

interface ThreadListProps {
  stanzaPath: string;
  refreshTrigger: number;
}

export default function ThreadList({ stanzaPath, refreshTrigger }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchThreads();
  }, [stanzaPath, refreshTrigger]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const encodedPath = encodeURIComponent(stanzaPath.substring(1)); // Remove leading slash
      const url = `/api/discussions/${encodedPath}/threads`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch threads');
      }

      setThreads(data.threads);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'QUESTION': return '#ff6b6b';
      case 'REFLECTION': return '#4ecdc4';
      case 'PRAYER_REQUEST': return '#45b7d1';
      case 'TESTIMONY': return '#f9ca24';
      default: return '#6c757d';
    }
  };

  const handleThreadClick = (threadId: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('thread', threadId);
    router.push(currentUrl.toString());
  };

  if (loading) {
    return <div className={styles.loading}>Loading discussions...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (threads.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No discussions yet for this poem.</p>
        <p>Be the first to start a conversation!</p>
      </div>
    );
  }

  return (
    <div className={styles.threadList}>
      {threads.map((thread) => (
        <div 
          key={thread.id} 
          className={styles.threadCard}
          onClick={() => handleThreadClick(thread.id)}
        >
          <div className={styles.threadHeader}>
            <span 
              className={styles.threadType}
              style={{ backgroundColor: getTypeColor(thread.type) }}
            >
              {thread.type.replace('_', ' ')}
            </span>
            <span className={styles.voteScore}>
              {thread.voteScore > 0 ? '+' : ''}{thread.voteScore}
            </span>
          </div>
          
          <h4 className={styles.threadTitle}>{thread.title}</h4>
          
          <p className={styles.threadPreview}>
            {thread.content.length > 100 
              ? thread.content.substring(0, 100) + '...' 
              : thread.content
            }
          </p>

          {thread.tags.length > 0 && (
            <div className={styles.tags}>
              {thread.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className={styles.threadMeta}>
            <span className={styles.author}>@{thread.author.username}</span>
            <span className={styles.date}>{formatDate(thread.createdAt)}</span>
            <span className={styles.comments}>
              {thread._count.comments} comment{thread._count.comments !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}