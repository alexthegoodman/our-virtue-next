import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";
import PrimaryLayout from "@/components/PrimaryLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Our Virtue",
  description:
    "Our Virtue is an introduction to God, teaching love, peace, and forgiveness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <PrimaryLayout>{children}</PrimaryLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
