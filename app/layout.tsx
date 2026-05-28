import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { DarkModeSync } from "@/components/common/DarkModeSync";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Contract Analyst — AI-Powered Contract Analysis",
  description:
    "Analyze any contract in seconds. Extract key terms, identify risks, check compliance, and get plain-English summaries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${notoSans.variable}`}>
      <body className="bg-bg text-near-black font-body antialiased">
        <DarkModeSync />
        {children}
      </body>
    </html>
  );
}
