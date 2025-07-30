'use client';

import { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import DiscussionPanel from './discussions/DiscussionPanel';
import styles from './PoemLayout.module.css';

interface PoemLayoutProps {
  children: ReactNode;
}

export default function PoemLayout({ children }: PoemLayoutProps) {
  const pathname = usePathname();

  return (
    <div className={styles.poemLayout}>
      <div className={styles.poemContent}>
        {children}
      </div>
      <div className={styles.discussionSidebar}>
        <Suspense fallback={<div>Loading discussions...</div>}>
          <DiscussionPanel stanzaPath={pathname} />
        </Suspense>
      </div>
    </div>
  );
}