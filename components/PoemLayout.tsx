"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import DiscussionPanel from "./discussions/DiscussionPanel";
import OurChurchCTA from "./OurChurchCTA";
import styles from "./PoemLayout.module.css";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

interface PoemLayoutProps {
  children: ReactNode;
}

export default function PoemLayout({ children }: PoemLayoutProps) {
  const pathname = usePathname();

  // clean this path to remove /??/ (language) from the pathname
  const cleanedPath = pathname.replace(/\/\w{2}\//, "/"); // e.g., /en/poems/1 becomes /poems/1
  const stanzaPath = cleanedPath.split("/").slice(0, 3).join("/"); // e.g., /poems/1

  return (
    <div className={styles.poemLayout}>
      <div className={styles.poemContent}>{children}</div>
      <div className={styles.discussionSidebar}>
        {/* <OurChurchCTA /> */}
        <Suspense fallback={<div>Loading discussions...</div>}>
          <DiscussionPanel stanzaPath={stanzaPath} />
        </Suspense>

        <div>
          <Link href="/poverty-data/">Poverty Data</Link>
          <Link href="/free-book/">Free Book</Link>
          <Link href="/privacy-policy/">Privacy Policy</Link>
          <Link href="/terms-conditions/">Terms & Conditions</Link>
        </div>
      </div>
    </div>
  );
}
