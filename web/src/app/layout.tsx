// web/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppChrome } from "@/components/layout/app-chrome";
import { NavigationLoadingProvider } from "@/components/layout/navigation-loading-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true
});

export const metadata: Metadata = {
  title: "IRÍS Admin",
  description: "Painel administrativo do ecossistema IRÍS."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <NavigationLoadingProvider>
            <AppChrome>{children}</AppChrome>
          </NavigationLoadingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
