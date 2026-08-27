'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface VariantStats {
  variant: 'A' | 'B' | 'C';
  question: string;
  views: number;
  submissions: number;
  conversionRate: number;
  progressToTarget: number;
  distribution: { option: string; count: number }[];
}

interface StatsResponse {
  variants: VariantStats[];
  config: {
    sampleSizePerVariant: number;
    startDate: string;
    endDate: string;
  };
}

export default function AdminSignupTestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!user.isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/admin/signup-variant-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch signup test stats');
      }

      const stats: StatsResponse = await response.json();
      setData(stats);
    } catch (err) {
      console.error('Error fetching signup test stats:', err);
      setError('Failed to load signup test stats');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    const response = await fetch('/api/admin/signup-variant-stats/export', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signup-variant-test.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (loading) {
    return <div className={styles.loading}>Loading signup test results...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!data) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Signup Form A/B Test</h1>
        <button className={styles.exportButton} onClick={handleExport}>
          Export CSV
        </button>
      </div>

      <p className={styles.testMeta}>
        Target: {data.config.sampleSizePerVariant} submissions per variant, or
        by {formatDate(data.config.endDate)} — whichever comes first.
      </p>

      <div className={styles.grid}>
        {data.variants.map((v) => {
          const maxCount = Math.max(1, ...v.distribution.map((d) => d.count));
          return (
            <div className={styles.card} key={v.variant}>
              <div className={styles.cardHeader}>
                <span className={styles.variantLabel}>Variant {v.variant}</span>
              </div>
              <p className={styles.question}>{v.question}</p>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricNumber}>{v.views}</span>
                  <span className={styles.metricLabel}>Views</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricNumber}>{v.submissions}</span>
                  <span className={styles.metricLabel}>Submissions</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricNumber}>
                    {formatPercent(v.conversionRate)}
                  </span>
                  <span className={styles.metricLabel}>Conversion</span>
                </div>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${v.progressToTarget * 100}%` }}
                />
              </div>
              <p className={styles.progressLabel}>
                {v.submissions} / {data.config.sampleSizePerVariant} toward sample size
              </p>

              <div className={styles.distribution}>
                {v.distribution.map((d) => (
                  <div className={styles.distRow} key={d.option}>
                    <span className={styles.distOption}>{d.option}</span>
                    <span className={styles.distCount}>{d.count}</span>
                    <div className={styles.distBarTrack}>
                      <div
                        className={styles.distBarFill}
                        style={{ width: `${(d.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
