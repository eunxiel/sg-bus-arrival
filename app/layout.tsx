import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Singapore Bus Arrival — Real-Time Bus Tracking",
  description:
    "Real-time Singapore bus arrival information powered by LTA DataMall. Track buses, view routes on an interactive map, and get live arrival predictions.",
  applicationName: "SG Bus Arrival",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={headingFont.variable}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
