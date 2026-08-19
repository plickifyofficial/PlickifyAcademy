"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "0").trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function revalidateProducts() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/digital-products");
  revalidatePath("/admin/products");
}

function readTags(formData: FormData) {
  return readString(formData, "tags")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function readBool(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

const MAX_IMAGE = 5 * 1024 * 1024;
const ALLOWED_IMAGE = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE = 200 * 1024 * 1024;

export async function uploadProductFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { error: "Please select a file" };
  if (file.size > MAX_FILE)
    return { error: "File must be within 200MB" };

  const ext = (file.name.split(".").pop() || "zip").toLowerCase();
  const path = `product-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-files")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  const sizeMB = (file.size / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
  return {
    success: true,
    path,
    format: ext.toUpperCase(),
    size: `${sizeMB} MB`,
  };
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { error: "Please select a file" };
  if (file.size > MAX_IMAGE) return { error: "Image must be within 5MB" };
  if (!ALLOWED_IMAGE.includes(file.type))
    return { error: "Please provide a PNG/JPG/WebP/SVG image" };

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `product-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("course-images")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("course-images").getPublicUrl(path);
  return { success: true, url: publicUrl };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = readString(formData, "name");
  if (!name) return { error: "Product name is required" };

  const baseSlug = readString(formData, "slug") || slugify(name);
  if (!baseSlug) return { error: "Could not create a slug" };

  const { data: existing, error: checkErr } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", baseSlug)
    .maybeSingle();
  if (checkErr) return { error: checkErr.message };
  const slug = existing
    ? `${baseSlug}-${Date.now().toString(36)}`
    : baseSlug;

  const price = readNumber(formData, "price");
  const oldPrice = readNumber(formData, "old_price");
  const icon = readString(formData, "icon") || "fa-solid fa-file";
  const gradient =
    readString(formData, "gradient") || "from-blue-600 to-indigo-600";

  const { error } = await supabase.from("products").insert({
    name,
    slug,
    description: readString(formData, "description"),
    price,
    old_price: oldPrice > price ? oldPrice : 0,
    tag: readString(formData, "tag"),
    category: readString(formData, "category"),
    product_type: readString(formData, "product_type"),
    tags: readTags(formData),
    icon,
    gradient,
    cover_image: readString(formData, "cover_image"),
    file_url: readString(formData, "file_url"),
    file_format: readString(formData, "file_format"),
    file_size: readString(formData, "file_size"),
    file_count: Math.floor(readNumber(formData, "file_count")),
    rating_avg: readNumber(formData, "rating_avg"),
    review_count: Math.floor(readNumber(formData, "review_count")),
    download_count: Math.floor(readNumber(formData, "download_count")),
    is_featured: readBool(formData, "is_featured"),
    is_bestseller: readBool(formData, "is_bestseller"),
    is_published: readBool(formData, "is_published"),
  });

  if (error) return { error: error.message };
  revalidateProducts();
  return { success: true };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = readString(formData, "name");
  if (!name) return { error: "Product name is required" };

  const price = readNumber(formData, "price");
  const oldPrice = readNumber(formData, "old_price");
  const icon = readString(formData, "icon") || "fa-solid fa-file";
  const gradient =
    readString(formData, "gradient") || "from-blue-600 to-indigo-600";

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: readString(formData, "description"),
      price,
      old_price: oldPrice > price ? oldPrice : 0,
      tag: readString(formData, "tag"),
      category: readString(formData, "category"),
      product_type: readString(formData, "product_type"),
      tags: readTags(formData),
      icon,
      gradient,
      cover_image: readString(formData, "cover_image"),
      file_url: readString(formData, "file_url"),
      file_format: readString(formData, "file_format"),
      file_size: readString(formData, "file_size"),
      file_count: Math.floor(readNumber(formData, "file_count")),
      rating_avg: readNumber(formData, "rating_avg"),
      review_count: Math.floor(readNumber(formData, "review_count")),
      download_count: Math.floor(readNumber(formData, "download_count")),
      is_featured: readBool(formData, "is_featured"),
      is_bestseller: readBool(formData, "is_bestseller"),
      is_published: readBool(formData, "is_published"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { error: error.message };
  revalidateProducts();
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidateProducts();
  return { success: true };
}

export async function toggleProductPublish(productId: string, published: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("products")
    .update({ is_published: published })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidateProducts();
  return { success: true };
}