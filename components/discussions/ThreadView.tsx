'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './ThreadView.module.css';

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
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  voteScore: number;
  replies: Comment[];
}

interface ThreadViewProps {
  threadId: string;
  onClose: () => void;
}

export default function ThreadView({ threadId, onClose }: ThreadViewProps) {
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchThread();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/threads/${threadId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch thread');
      }

      setThread(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (targetId: string, isUpvote: boolean, isComment: boolean = false) => {
    if (!user) return;

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          [isComment ? 'commentId' : 'threadId']: targetId,
          isUpvote,
        }),
      });

      if (response.ok) {
        fetchThread(); // Refresh to get updated vote counts
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitLoading(true);
    try {
      const response = await fetch(`/api/threads/${threadId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          content: newComment,
          parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewComment('');
      setReplyingTo(null);
      fetchThread();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className={styles.loading}>Loading thread...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!thread) {
    return <div className={styles.error}>Thread not found</div>;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{thread.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.threadContent}>
            <div className={styles.threadMeta}>
              <span className={styles.threadType}>{thread.type.replace('_', ' ')}</span>
              <span className={styles.author}>@{thread.author.username}</span>
              <span className={styles.date}>{formatDate(thread.createdAt)}</span>
            </div>
            
            <p className={styles.threadText}>{thread.content}</p>
            
            {thread.tags.length > 0 && (
              <div className={styles.tags}>
                {thread.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}

            <div className={styles.voteControls}>
              <button 
                onClick={() => handleVote(thread.id, true)}
                className={styles.voteButton}
                disabled={!user}
              >
                ↑
              </button>
              <span className={styles.voteScore}>{thread.voteScore}</span>
              <button 
                onClick={() => handleVote(thread.id, false)}
                className={styles.voteButton}
                disabled={!user}
              >
                ↓
              </button>
            </div>
          </div>

          <div className={styles.comments}>
            <h3>Comments ({thread.comments.length})</h3>
            
            {user && (
              <form onSubmit={(e) => handleSubmitComment(e)} className={styles.commentForm}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                />
                <button type="submit" disabled={submitLoading || !newComment.trim()}>
                  {submitLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {thread.comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentMeta}>
                  <span className={styles.author}>@{comment.author.username}</span>
                  <span className={styles.date}>{formatDate(comment.createdAt)}</span>
                </div>
                <p className={styles.commentText}>{comment.content}</p>
                <div className={styles.commentActions}>
                  <div className={styles.voteControls}>
                    <button 
                      onClick={() => handleVote(comment.id, true, true)}
                      className={styles.voteButton}
                      disabled={!user}
                    >
                      ↑
                    </button>
                    <span className={styles.voteScore}>{comment.voteScore}</span>
                    <button 
                      onClick={() => handleVote(comment.id, false, true)}
                      className={styles.voteButton}
                      disabled={!user}
                    >
                      ↓
                    </button>
                  </div>
                  {user && (
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className={styles.replyButton}
                    >
                      Reply
                    </button>
                  )}
                </div>

                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className={styles.replyForm}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                    />
                    <div className={styles.replyActions}>
                      <button type="button" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </button>
                      <button type="submit" disabled={submitLoading || !newComment.trim()}>
                        Reply
                      </button>
                    </div>
                  </form>
                )}

                {comment.replies.map((reply) => (
                  <div key={reply.id} className={styles.reply}>
                    <div className={styles.commentMeta}>
                      <span className={styles.author}>@{reply.author.username}</span>
                      <span className={styles.date}>{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className={styles.commentText}>{reply.content}</p>
                    <div className={styles.voteControls}>
                      <button 
                        onClick={() => handleVote(reply.id, true, true)}
                        className={styles.voteButton}
                        disabled={!user}
                      >
                        ↑
                      </button>
                      <span className={styles.voteScore}>{reply.voteScore}</span>
                      <button 
                        onClick={() => handleVote(reply.id, false, true)}
                        className={styles.voteButton}
                        disabled={!user}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}