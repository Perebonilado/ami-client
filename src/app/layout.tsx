import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";
import { Suspense } from "react";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Àmì · License Nigerian creator videos", template: "%s · Àmì" },
  description: "Creators list their videos. Pages and brands pay in naira for a licence, a clean file and a certificate anyone can check.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="root flex min-h-dvh flex-col">
          <AuthProvider>
            <Suspense fallback={<SiteHeaderFallback />}>
              <SiteHeader />
            </Suspense>
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
