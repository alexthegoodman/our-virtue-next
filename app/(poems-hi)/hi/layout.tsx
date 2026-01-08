import CategoryLayout from "@/components/CategoryLayout";

export default function PoemsLayout({ children = null }) {
  return (
    <>
      <CategoryLayout>
        {children}
      </CategoryLayout>
    </>
  );
}