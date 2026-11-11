import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";
import { StoreProvider } from "@/store/provider";
import "./globals.css";
import "./ami.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Àmì · License videos from creators you love", template: "%s · Àmì" },
  description: "Use their clips in your own content, legally. They get paid every time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full">
        <div className="root flex min-h-dvh flex-col">
          <StoreProvider>
            <Suspense fallback={<SiteHeaderFallback />}>
              <SiteHeader />
            </Suspense>
            <main className="app-main">{children}</main>
            <Suspense fallback={null}>
              <SiteFooter />
            </Suspense>
          </StoreProvider>
        </div>
      </body>
    </html>
  );
}
