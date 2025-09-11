import "./globals.css";
import type { Metadata } from "next";
import { Nunito, Pacifico } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-body" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-brand" });

export const metadata: Metadata = {
  title: "Itch To Stitch by Teresa",
  description: "Crochet notes, colors, and cozy experiments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans bg-[#faf7f2]`}>
        {children}
      </body>
    </html>
  );
}

