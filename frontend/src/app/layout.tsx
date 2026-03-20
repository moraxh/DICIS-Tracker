import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AnimatePresence } from "motion/react";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import NavBar from "@/components/common/NavBar";
import ScheduleModal from "@/components/common/ScheduleModal";
import TopBanner from "@/components/common/TopBanner";
import { ProfessorsProvider } from "@/context/Professor/ProfessorsProvider";
import { RoomsProvider } from "@/context/Rooms/RoomsProvider";
import { ThemeProvider } from "@/context/ThemeProvider";

const interSans = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DICIS Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interSans} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`antialiased font-sans`}>
        <Analytics />
        <ThemeProvider>
          <RoomsProvider>
            <ProfessorsProvider>
              <div className="min-h-screen flex flex-col">
                <TopBanner />
                <Header />
                <main className="max-w-6xl w-full mx-auto px-6 flex-1">
                  <AnimatePresence mode="wait">{children}</AnimatePresence>
                </main>
                <Footer />
                <NavBar />
                <ScheduleModal />
              </div>
            </ProfessorsProvider>
          </RoomsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
