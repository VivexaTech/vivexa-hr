import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { brand } from "@/constants/brand";
import { createMetadata, organizationSchema, softwareSchema, websiteSchema } from "@/lib/seo";
import { JsonLd } from "@/components/marketing/json-ld";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...createMetadata({
    title: brand.productName,
    description: brand.description,
    path: "/",
  }),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper font-sans text-ink">
        <JsonLd data={[organizationSchema(), softwareSchema(), websiteSchema()]} />
        {children}
      </body>
    </html>
  );
}
