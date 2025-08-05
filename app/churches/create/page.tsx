"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Link } from "react-aria-components";
import { upload } from '@vercel/blob/client';
import styles from "./page.module.css";

interface FormData {
  name: string;
  description: string;
  category: string;
  image: File | null;
}

export default function CreateChurchPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.notAuthorized}>
          <h1>Authentication Required</h1>
          <p>You must be signed in to create a church.</p>
          <Link href="/churches" className={styles.backLink}>← Back to Churches</Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Church name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Church description is required');
      }
      if (!formData.category) {
        throw new Error('Please select a category');
      }

      let imageUrl: string | undefined;

      // Upload image if provided
      if (formData.image) {
        try {
          const blob = await upload(formData.image.name, formData.image, {
            access: 'public',
            handleUploadUrl: '/api/upload'
          });
          imageUrl = blob.url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      // Create church
      const response = await fetch('/api/churches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          slug: generateSlug(formData.name.trim()),
          imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create church');
      }

      const church = await response.json();
      
      // Redirect to the new church
      router.push(`/churches/${church.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "PARENTS":
        return "A community for parents to share wisdom and support each other";
      case "YOUNG_PEOPLE":
        return "A space for young people to explore faith and build connections";
      case "WORKERS":
        return "For hardworking individuals seeking purpose and balance";
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/churches" className={styles.backButton}>
          ← Back to Churches
        </Link>
        <h1>Create Your Church</h1>
        <p>Start a new community and connect with others on similar journeys.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Church Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Church Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={styles.input}
            placeholder="Enter your church name"
            maxLength={100}
            required
          />
        </div>

        {/* Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select a category</option>
            <option value="PARENTS">For Parents</option>
            <option value="YOUNG_PEOPLE">For Young People</option>
            <option value="WORKERS">For Hard Workers</option>
          </select>
          {formData.category && (
            <p className={styles.categoryDescription}>
              {getCategoryDescription(formData.category)}
            </p>
          )}
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={styles.textarea}
            placeholder="Describe your church and what makes it special..."
            rows={5}
            maxLength={500}
            required
          />
          <div className={styles.charCount}>
            {formData.description.length}/500 characters
          </div>
        </div>

        {/* Church Image */}
        <div className={styles.formGroup}>
          <label htmlFor="image" className={styles.label}>
            Church Image (Optional)
          </label>
          <div className={styles.imageUpload}>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <label htmlFor="image" className={styles.fileLabel}>
              {imagePreview ? 'Change Image' : 'Choose Image'}
            </label>
            <p className={styles.fileHint}>
              Max 5MB. Supports JPG, PNG, GIF, WebP
            </p>
          </div>
          
          {imagePreview && (
            <div className={styles.imagePreview}>
              <img src={imagePreview} alt="Church preview" />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Creating Church...' : 'Create Church'}
          </button>
        </div>

        <div className={styles.notice}>
          <p><strong>Note:</strong> Each user can create up to 1 church. Choose wisely!</p>
        </div>
      </form>
    </div>
  );
}