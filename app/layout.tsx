import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "foodmenia - Culinary Artistry, Pure Flavors",
  description: "Easy Ordering. Fast Delivery. Delicious food delivered straight to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#FCBA08] text-[#2B1B0E] antialiased selection:bg-[#2B1B0E] selection:text-[#FCBA08]">
        <QueryProvider>
          <AuthGuard>{children}</AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}




