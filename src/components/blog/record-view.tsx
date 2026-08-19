"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/actions/blog";

export function RecordView({ postId }: { postId: string }) {
  useEffect(() => {
    recordView(postId).catch(() => {
      // view counting is non-critical
    });
  }, [postId]);

  return null;
}