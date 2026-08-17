"use client";

import { useEffect } from "react";
import { updateCourseState } from "@/lib/actions/learning";

export function ResumeTracker({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  useEffect(() => {
    void updateCourseState(courseId, lessonId);
  }, [courseId, lessonId]);

  return null;
}