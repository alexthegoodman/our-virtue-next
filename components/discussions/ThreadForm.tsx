'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './ThreadForm.module.css';

interface ThreadFormProps {
  stanzaPath: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const THREAD_TYPES = [
  { value: 'DISCUSSION', label: 'General Discussion' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'REFLECTION', label: 'Personal Reflection' },
  { value: 'PRAYER_REQUEST', label: 'Prayer Request' },
  { value: 'TESTIMONY', label: 'Testimony' },
];

export default function ThreadForm({ stanzaPath, onSubmit, onCancel }: ThreadFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'DISCUSSION',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const encodedPath = encodeURIComponent(stanzaPath.substring(1)); // Remove leading slash
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const response = await fetch(`/api/discussions/${encodedPath}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create thread');
      }

      onSubmit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h4 className={styles.formTitle}>Start a New Discussion</h4>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={styles.select}
          >
            {THREAD_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={100}
            placeholder="What would you like to discuss?"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="content">Message</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={4}
            maxLength={1000}
            placeholder="Share your thoughts..."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="tags">Tags (optional)</label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="faith, hope, love (comma-separated)"
          />
          <small className={styles.fieldHelp}>
            Add tags to help others find your discussion
          </small>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Creating...' : 'Create Discussion'}
          </button>
        </div>
      </form>
    </div>
  );
}