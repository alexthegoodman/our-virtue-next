'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './PovertyDataList.module.css';

interface PovertyDataSource {
  id: string;
  title: string;
  description?: string;
  sourceUrl: string;
  sourceOrg?: string;
  geographicScope: string;
  timeRange?: string;
  dataType: string;
  isVerified: boolean;
  createdAt: string;
  submitter: {
    id: string;
    username: string;
  };
}

interface PovertyDataListProps {
  onEdit?: (source: PovertyDataSource) => void;
}

export default function PovertyDataList({ onEdit }: PovertyDataListProps) {
  const { user } = useAuth();
  const [dataSources, setDataSources] = useState<PovertyDataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    dataType: '',
    geographicScope: '',
    verified: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchDataSources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.dataType && { dataType: filters.dataType }),
        ...(filters.geographicScope && { geographicScope: filters.geographicScope }),
        ...(filters.verified && { verified: filters.verified }),
      });

      const response = await fetch(`/api/poverty-data?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data sources');
      }

      setDataSources(data.dataSources);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, [pagination.page, filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;

    try {
      const response = await fetch(`/api/poverty-data/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete data source');
      }

      fetchDataSources();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && dataSources.length === 0) {
    return <div className={styles.loading}>Loading poverty data sources...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Poverty Data Repository</h2>
          <p className={styles.subtitle}>
            A crowdsourced collection of poverty data from verified sources around the world. 
            This data will power our interactive poverty map to help visualize and understand poverty patterns.
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <input
            type="text"
            placeholder="Search data sources..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className={styles.searchInput}
          />
          
          <select
            value={filters.dataType}
            onChange={(e) => handleFilterChange({ dataType: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="">All Data Types</option>
            <option value="poverty_rate">Poverty Rate</option>
            <option value="income_distribution">Income Distribution</option>
            <option value="housing_cost">Housing Cost</option>
            <option value="food_insecurity">Food Insecurity</option>
            <option value="employment">Employment</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Geographic scope..."
            value={filters.geographicScope}
            onChange={(e) => handleFilterChange({ geographicScope: e.target.value })}
            className={styles.filterInput}
          />

          <select
            value={filters.verified}
            onChange={(e) => handleFilterChange({ verified: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="">All Sources</option>
            <option value="true">Verified Only</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {dataSources.length === 0 && !loading ? (
        <div className={styles.empty}>
          <h3>No data sources found</h3>
          <p>Be the first to contribute to our poverty data repository!</p>
        </div>
      ) : (
        <>
          <div className={styles.dataSourceList}>
            {dataSources.map((source) => (
              <div key={source.id} className={styles.dataSourceCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>
                    {source.title}
                    {source.isVerified && (
                      <span className={styles.verifiedBadge}>✓ Verified</span>
                    )}
                  </h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.dataType}>{source.dataType.replace('_', ' ')}</span>
                    <span className={styles.scope}>{source.geographicScope}</span>
                    {source.timeRange && <span className={styles.timeRange}>{source.timeRange}</span>}
                  </div>
                </div>

                {source.description && (
                  <p className={styles.description}>{source.description}</p>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.attribution}>
                    <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" 
                       className={styles.sourceLink}>
                      View Original Source
                    </a>
                    {source.sourceOrg && (
                      <span className={styles.sourceOrg}>from {source.sourceOrg}</span>
                    )}
                  </div>

                  <div className={styles.submissionInfo}>
                    <span className={styles.submitter}>by {source.submitter.username}</span>
                    <span className={styles.date}>{formatDate(source.createdAt)}</span>
                  </div>

                  {(user?.id === source.submitter.id || user?.isAdmin) && (
                    <div className={styles.actions}>
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(source)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(source.id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              
              <span className={styles.paginationInfo}>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}