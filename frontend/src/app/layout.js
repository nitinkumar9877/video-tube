import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/common/app-shell";
import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PlayTube",
  description: "Watch and share videos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <AppShell>{children}</AppShell>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}