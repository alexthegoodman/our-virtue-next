'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PovertyDataForm from '@/components/poverty-data/PovertyDataForm';
import PovertyDataList from '@/components/poverty-data/PovertyDataList';
import AuthModal from '@/components/auth/AuthModal';
import styles from './page.module.css';

export default function PovertyDataPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  const handleSubmitClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowForm(true);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setRefreshList(prev => prev + 1);
  };

  const handleAuthSuccess = (token: string, user: any) => {
    setShowAuthModal(false);
    setShowForm(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Poverty Data Repository</h1>
        <p className={styles.heroDescription}>
          A crowdsourced collection of poverty data sources that will power our interactive 
          poverty map. Help us build a comprehensive view of poverty patterns worldwide by 
          contributing verified data sources with proper attribution.
        </p>
        
        <div className={styles.heroActions}>
          <div className={styles.actionButtons}>
            <Link href="/poverty-data/map" className={styles.mapButton}>
              View Interactive Map
            </Link>
            <button 
              onClick={handleSubmitClick}
              className={styles.submitButton}
            >
              Contribute Data Source
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>Community-Driven</span>
              <span className={styles.statLabel}>Crowdsourced approach ensures diverse data sources</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>Verified Sources</span>
              <span className={styles.statLabel}>All submissions include proper attribution links</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>Interactive Map</span>
              <span className={styles.statLabel}>Data will be integrated into a visual poverty map</span>
            </div>
          </div>
        </div>
      </div>

      {showForm && user && (
        <PovertyDataForm 
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <PovertyDataList key={refreshList} />

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleAuthSuccess}
        />
      )}
    </div>
  );
}