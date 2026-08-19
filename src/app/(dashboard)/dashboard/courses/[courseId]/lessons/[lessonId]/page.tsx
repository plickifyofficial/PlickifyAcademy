import { redirect } from "next/navigation";

export default async function OldLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  redirect(`/dashboard/learn/${courseId}/${lessonId}`);
}