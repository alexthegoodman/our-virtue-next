"use client";

import { useEffect, useState } from "react";
import { PovertyDataSource } from "@prisma/client";
import PrimaryLayout from "@/components/PrimaryLayout";
import PovertyMap from "@/components/poverty-data/PovertyMap";
import Link from "next/link";
import { ArrowLeft, Database, MapPin } from "@phosphor-icons/react";
import styles from "./page.module.css";

interface PovertyDataWithSubmitter extends PovertyDataSource {
  submitter: {
    username: string;
    email: string;
  } | null;
}

export default function PovertyMapPage() {
  const [povertyData, setPovertyData] = useState<PovertyDataWithSubmitter[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "/api/poverty-data?includeSubmitter=true&noPagination=true"
        );
        if (response.ok) {
          const data = await response.json();
          setPovertyData(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching poverty data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalDataSources = povertyData.length;
  const verifiedSources = povertyData.filter(
    (source) => source.isVerified
  ).length;
  const uniqueRegions = new Set(
    povertyData.map((source) => source.geographicScope)
  ).size;

  return (
    <div className={styles.container}>
      {/* Header */}
      {/* <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/poverty-data" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Poverty Data
          </Link>
        </div>

        <div className={styles.hero}>
          <h1 className={styles.title}>Interactive Poverty Map</h1>
          <p className={styles.description}>
            Explore regional poverty data and agricultural insights across the
            globe. Each circle represents a geographic region with available
            data sources.
          </p>
        </div>
      </div> */}

      {/* Map Section */}
      <div className={styles.mapSection}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <p>Loading poverty data...</p>
          </div>
        ) : povertyData.length > 0 ? (
          <PovertyMap data={povertyData} />
        ) : (
          <div className={styles.noData}>
            <h3>No Data Available</h3>
            <p>No poverty data sources found. Be the first to contribute!</p>
            <Link href="/poverty-data" className={styles.contributeButton}>
              Contribute Data Source
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Database size={24} />
          <div>
            <div className={styles.statNumber}>{totalDataSources}</div>
            <div className={styles.statLabel}>Data Sources</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <MapPin size={24} />
          <div>
            <div className={styles.statNumber}>{uniqueRegions}</div>
            <div className={styles.statLabel}>Regions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.verifiedIcon}>✓</div>
          <div>
            <div className={styles.statNumber}>{verifiedSources}</div>
            <div className={styles.statLabel}>Verified</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <h2>How to Use the Map</h2>
        <div className={styles.instructionGrid}>
          <div className={styles.instructionItem}>
            <div className={styles.instructionIcon}>1</div>
            <div>
              <h3>Explore Regions</h3>
              <p>
                Click on circles to view detailed poverty data for each region.
                Circle size indicates the number of data sources available.
              </p>
            </div>
          </div>
          <div className={styles.instructionItem}>
            <div className={styles.instructionIcon}>2</div>
            <div>
              <h3>Filter by Data Type</h3>
              <p>
                Use the filter controls to focus on specific types of poverty
                indicators like income distribution or food insecurity.
              </p>
            </div>
          </div>
          <div className={styles.instructionItem}>
            <div className={styles.instructionIcon}>3</div>
            <div>
              <h3>View Data Details</h3>
              <p>
                Pop-up windows show data source titles, verification status, and
                quick summaries for each region.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className={styles.cta}>
        <h2>Contribute to the Map</h2>
        <p>
          Help expand our poverty data repository by contributing verified data
          sources from your region.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/poverty-data" className={styles.primaryButton}>
            Add Data Source
          </Link>
          <Link href="/poverty-data" className={styles.secondaryButton}>
            View All Data
          </Link>
        </div>
      </div>
    </div>
  );
}
