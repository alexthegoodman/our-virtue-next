// import fs from 'fs';
// import path from 'path';
import SwipeInterface from "@/components/SwipeInterface";
import stanzaData from "../content/stanzas.json";

export default async function Home() {
  // const filePath = path.join(process.cwd(), 'content', 'stanzas.json');
  // const fileContents = fs.readFileSync(filePath, 'utf8');
  // const stanzaData = JSON.parse(fileContents);

  return (
    <main style={{ height: '100%', minHeight: "76vh", width: '100%', overflow: 'hidden', position: 'relative' }}>
      <SwipeInterface data={stanzaData} />
    </main>
  );
}