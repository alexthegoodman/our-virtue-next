export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
  }
}

export const pageview = () => {
  if (!FB_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "PageView");
};

export const event = (
  name: string,
  options: Record<string, unknown> = {}
) => {
  if (!FB_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", name, options);
};
