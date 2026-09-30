import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

const paths = [
  "/",
  "/about",
  "/features",
  "/attendance",
  "/leave-management",
  "/payroll",
  "/employee-management",
  "/employee-app",
  "/how-it-works",
  "/pricing",
  "/faq",
  "/contact",
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/support",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: new URL(path, publicEnv.siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
