// import { redirect } from "next/navigation";

import PoemsSummary from "@/components/PoemsSummary";

export default async function Home() {
  // redirect("/select-language");

  return (
    <>
      <PoemsSummary />
    </>
  );
}
