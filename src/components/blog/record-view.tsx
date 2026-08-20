"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/lib/actions/blog";

const STORAGE_KEY = "plickify-blog-views";

export function RecordView({ postId }: { postId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    let viewed: string[] = [];
    try {
      viewed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]") as string[];
    } catch {
      viewed = [];
    }
    if (viewed.includes(postId)) return;
    viewed.push(postId);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
    } catch {
      // storage may be unavailable; still record
    }
    recordView(postId).catch(() => {
      // view counting is non-critical
    });
  }, [postId]);

  return null;
}