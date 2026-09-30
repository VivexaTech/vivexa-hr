import type { Metadata } from "next";
import { brand } from "@/constants/brand";
import { publicEnv } from "@/lib/env";

export function absoluteUrl(path = "/") {
  return new URL(path, publicEnv.siteUrl).toString();
}

export function createMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title === brand.productName ? title : `${title} | ${brand.productName}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description,
      siteName: brand.productName,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.productName,
    legalName: brand.legalName,
    url: publicEnv.siteUrl,
    description: brand.description,
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: brand.productName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: brand.freePlanLabel,
    },
    description: brand.description,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.productName,
    url: publicEnv.siteUrl,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
