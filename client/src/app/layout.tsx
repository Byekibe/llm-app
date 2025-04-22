import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/app/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from '@/components/theme-provider';
import Providers  from '@/app/StoreProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Q&A Assistant",
  description: "Interactive Q&A system using LLM integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StoreProvider>
            <Providers>{children}</Providers>
          </StoreProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}