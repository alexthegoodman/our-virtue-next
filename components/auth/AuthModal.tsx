'use client';

import { useState } from 'react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    emailOrUsername: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const body = isLoginMode 
        ? { emailOrUsername: formData.emailOrUsername, password: formData.password }
        : { email: formData.email, username: formData.username, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data.token, data.user);
      onClose();
      setFormData({ email: '', username: '', password: '', emailOrUsername: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {isLoginMode ? (
            <div className={styles.field}>
              <label htmlFor="emailOrUsername">Email or Username</label>
              <input
                id="emailOrUsername"
                type="text"
                value={formData.emailOrUsername}
                onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                required
              />
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>

          <button
            type="button"
            className={styles.switchButton}
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setFormData({ email: '', username: '', password: '', emailOrUsername: '' });
            }}
          >
            {isLoginMode 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </form>
      </div>
    </div>
  );
}