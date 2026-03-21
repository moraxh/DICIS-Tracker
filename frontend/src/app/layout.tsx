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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "DICIS Tracker",
  description:
    "Esta herramienta te ayuda a encontrar salones vacíos o saber si un profesor está disponible en tiempo real.",
  openGraph: {
    title: "DICIS Tracker",
    description:
      "Encuentra salones vacíos y profesores disponibles en tiempo real.",
    siteName: "DICIS Tracker",
    images: [
      {
        url: "/showcase.png",
        width: 1200,
        height: 630,
        alt: "DICIS Tracker Preview",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DICIS Tracker",
    description:
      "Encuentra salones vacíos y profesores disponibles en tiempo real.",
    images: ["/showcase.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      className={`${interSans} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://github.com" />
      </head>
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
