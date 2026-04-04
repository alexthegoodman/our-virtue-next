// // import fs from 'fs';
// // import path from 'path';
// import SwipeInterface from "@/components/SwipeInterface";
// import stanzaData from "../content/stanzas.json";
// import Link from "next/link";
// import { Suspense } from "react";

// export default async function Home() {
//   // const filePath = path.join(process.cwd(), 'content', 'stanzas.json');
//   // const fileContents = fs.readFileSync(filePath, 'utf8');
//   // const stanzaData = JSON.parse(fileContents);

//   return (
//     <>
//       <main style={{ height: '100%', minHeight: "76vh", width: '100%', overflow: 'hidden', position: 'relative' }}>
//         <Suspense fallback={<div>Loading poems...</div>}>
//           <SwipeInterface data={stanzaData} />
//         </Suspense>
//       </main>
//       <div style={{ margin: "20px auto", width: "300px", display: "flex", flexDirection: "column", gap: "12px" }}>
//         <Link href="/summary" style={{ color: "#666" }}>Summary and Explore by Category</Link>
//         <Link href="/free-book" style={{ color: "#666" }}>Request a free physical copy</Link>
//       </div>
//     </>
//   );
// }

import CategoryLayout from "@/components/CategoryLayout";
import PoemsSummary from "@/components/PoemsSummary";

export default function Home() {
  return (
    <>
      <CategoryLayout>
        <PoemsSummary />
      </CategoryLayout>
    </>
  );
}
