import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";

import { AdminEditorProvider } from "@/components/admin/AdminEditorContext";

import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Halcyon",
  description: "Personal writing site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full font-body">
        <AdminEditorProvider>{children}</AdminEditorProvider>
      </body>
    </html>
  );
}
