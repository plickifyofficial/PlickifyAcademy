import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/products", {
    title: "Digital Products | Plickify Academy",
  });
}

export const revalidate = 60;

export default async function ProductsPage() {
  redirect("/digital-products");
}
