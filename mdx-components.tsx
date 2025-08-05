import type { MDXComponents } from "mdx/types";
import PoemLayout from "@/components/PoemLayout";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    wrapper: ({ children }) => <PoemLayout>{children}</PoemLayout>,
  };
}
