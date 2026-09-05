"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Link } from "react-aria-components";
import { upload } from "@vercel/blob/client";
import styles from "./page.module.css";

const MAX_BIO_LENGTH = 500;

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // AuthContext loads the user asynchronously, so on first render `user` is
  // often still null — sync the fields in once the fetched data arrives.
  const initialized = useRef(false);
  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;
    setBio(user.bio || "");
    setAvatarPreview(user.avatarUrl || null);
  }, [user]);

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuthorized}>
          <h1>Authentication Required</h1>
          <p>You must be signed in to edit your profile.</p>
          <Link href="/" className={styles.backLink}>
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setAvatarFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        try {
          const blob = await upload(avatarFile.name, avatarFile, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          avatarUrl = blob.url;
        } catch (uploadError) {
          console.error("Avatar upload error:", uploadError);
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          bio: bio.trim(),
          ...(avatarUrl ? { avatarUrl } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      updateUser(data.user);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set password");
      }

      updateUser({ hasPassword: true });
      setPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Complete Your Profile</h1>
        <p>
          Add a photo and a short bio so other members can get to know you
          before you meet.
        </p>
      </div>

      {user.hasPassword === false && (
        <form onSubmit={handleSetPassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Set a Password</label>
            <p className={styles.fileHint} style={{ marginBottom: 15 }}>
              Your account was created from your email signup, so it doesn&apos;t
              have a password yet. Set one now so you can sign back in later.
            </p>
          </div>

          {passwordError && <div className={styles.error}>{passwordError}</div>}
          {passwordSuccess && (
            <div className={styles.success}>Password set!</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.textarea}
              minLength={6}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.textarea}
              minLength={6}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={passwordLoading}
              className={styles.submitButton}
            >
              {passwordLoading ? "Saving..." : "Set Password"}
            </button>
          </div>
        </form>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>Profile updated!</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="avatar" className={styles.label}>
            Profile Picture
          </label>
          <div className={styles.avatarUpload}>
            {avatarPreview && (
              <div className={styles.avatarPreview}>
                <img src={avatarPreview} alt="Avatar preview" />
              </div>
            )}
            <div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.fileInput}
              />
              <label htmlFor="avatar" className={styles.fileLabel}>
                {avatarPreview ? "Change Photo" : "Choose Photo"}
              </label>
              <p className={styles.fileHint}>
                Max 5MB. Supports JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.label}>
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles.textarea}
            placeholder="Tell the community a bit about yourself..."
            rows={5}
            maxLength={MAX_BIO_LENGTH}
          />
          <div className={styles.charCount}>
            {bio.length}/{MAX_BIO_LENGTH} characters
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
