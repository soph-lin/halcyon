import type { Metadata } from "next";
import { EB_Garamond, Playfair_Display } from "next/font/google";

import { EditorProvider } from "@/components/editor/admin/EditorContext";
import { isAdmin } from "@/lib/admin";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await isAdmin();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full font-body">
        <EditorProvider isAdmin={admin}>{children}</EditorProvider>
      </body>
    </html>
  );
}
