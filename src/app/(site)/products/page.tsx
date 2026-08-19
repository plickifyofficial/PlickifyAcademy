import { redirect } from "next/navigation";

export const metadata = {
  title: "Digital Products | Plickify Academy",
};

export const revalidate = 60;

export default async function ProductsPage() {
  redirect("/digital-products");
}