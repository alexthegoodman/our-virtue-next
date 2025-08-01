"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import DiscussionPanel from "./discussions/DiscussionPanel";
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
        <Suspense fallback={<div>Loading discussions...</div>}>
          <DiscussionPanel stanzaPath={stanzaPath} />
        </Suspense>

        {/* <div>
          <Link href="/poverty-data/">
            Visit Poverty Data Repository <ArrowRight />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
