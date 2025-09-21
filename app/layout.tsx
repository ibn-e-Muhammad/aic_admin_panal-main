import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIC DASHBOARD",
  description: "This is admin panal of aic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
