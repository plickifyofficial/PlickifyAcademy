"use client";

import { useState } from "react";
import type {
  Course,
  CourseSection,
  Lesson,
  QuizQuestion,
  Announcement,
  LiveClass,
} from "@/lib/types";
import {
  createSection,
  updateSection,
  deleteSection,
  moveSection,
  createTopic,
  updateTopic,
  deleteTopic,
  moveTopic,
  createAnnouncement,
  deleteAnnouncement,
  createLiveClass,
  deleteLiveClass,
} from "@/lib/actions/admin";
import { useToast } from "@/components/ui/toaster";
import { QuestionsEditor } from "@/components/admin/questions-editor";
import { VideoSourceFields } from "@/components/admin/video-source-fields";

const TOPIC_TYPES: { value: Lesson["type"]; label: string; icon: string }[] = [
  { value: "lesson", label: "লেসন", icon: "fa-solid fa-book-open" },
  { value: "video", label: "ভিডিও", icon: "fa-solid fa-video" },
  { value: "quiz", label: "কুইজ", icon: "fa-solid fa-circle-question" },
  { value: "assignment", label: "অ্যাসাইনমেন্ট", icon: "fa-solid fa-clipboard-check" },
];

const TYPE_META: Record<Lesson["type"], { label: string; icon: string; color: string }> = {
  lesson: { label: "লেসন", icon: "fa-solid fa-book-open", color: "bg-[#e5f1fb] text-[#2271b1]" },
  video: { label: "ভিডিও", icon: "fa-solid fa-video", color: "bg-[#e7f6ef] text-[#008a20]" },
  quiz: { label: "কুইজ", icon: "fa-solid fa-circle-question", color: "bg-[#fdeeea] text-[#b32d2e]" },
  assignment: { label: "অ্যাসাইনমেন্ট", icon: "fa-solid fa-clipboard-check", color: "bg-[#f6f3e8] text-[#996800]" },
};

export function CurriculumBuilder({
  course,
  sections,
  topics,
  questionsByLesson,
  announcements,
  liveClasses,
}: {
  course: Course;
  sections: CourseSection[];
  topics: Record<string, Lesson[]>;
  questionsByLesson: Record<string, QuizQuestion[]>;
  announcements: Announcement[];
  liveClasses: LiveClass[];
}) {
  const [pending, setPending] = useState(false);
  const [renamingSection, setRenamingSection] = useState<string | null>(null);
  const [addingSection, setAddingSection] = useState(false);
  const [addingTopicSection, setAddingTopicSection] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const { showToast } = useToast();

  async function run(action: () => Promise<void>, success: string) {
    setPending(true);
    try {
      await action();
      showToast(success);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে", "error");
    } finally {
      setPending(false);
    }
  }

  const totalTopics = sections.reduce((n, s) => n + (topics[s.id]?.length ?? 0), 0);

  function sortedTopicsFor(sectionId: string): Lesson[] {
    return [...(topics[sectionId] ?? [])].sort((a, b) => a.order - b.order);
  }

  return (
    <div className="space-y-4">
      <div className="wp-panel">
        <div className="wp-panel-header">
          <span>
            কারিকুলাম — {course.title}{" "}
            <span className="rounded bg-[#f0f6fc] px-2 py-0.5 text-xs font-semibold text-[#2271b1]">
              {sections.length} সেকশন · {totalTopics} টপিক
            </span>
          </span>
        </div>
        <div className="wp-panel-body space-y-4">
          {sections.length === 0 && (
            <p className="text-sm text-[#646970]">
              এখনো কোনো সেকশন নেই। নিচ থেকে সেকশন যোগ করুন।
            </p>
          )}

          {sections.map((section, sIdx) => {
            const sectionTopics = sortedTopicsFor(section.id);
            return (
              <div key={section.id} className="rounded-lg border border-[#dcdcde] bg-white">
                <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-[#dcdcde] bg-[#f0f6fc] px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#2271b1] text-xs font-bold text-white">
                    {sIdx + 1}
                  </span>
                  {renamingSection === section.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await run(async () => {
                          await updateSection(new FormData(e.currentTarget));
                          setRenamingSection(null);
                        }, "সেকশন আপডেট হয়েছে");
                      }}
                      className="flex flex-1 items-center gap-2"
                    >
                      <input type="hidden" name="id" value={section.id} />
                      <input
                        name="title"
                        defaultValue={section.title}
                        required
                        className="wp-input flex-1"
                      />
                      <button type="submit" className="wp-btn" disabled={pending}>
                        <i className="fa-solid fa-check" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingSection(null)}
                        className="wp-btn"
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </form>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1d2327]">
                      {section.title}
                      <span className="ml-2 text-xs font-normal text-[#646970]">
                        ({sectionTopics.length} টপিক)
                      </span>
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => run(() => moveSection(fdFor(section.id, course.id, -1)), "সেকশন সরে গেছে")}
                      disabled={sIdx === 0 || pending}
                      className="wp-btn !px-2"
                      aria-label="উপরে"
                    >
                      <i className="fa-solid fa-arrow-up text-xs" />
                    </button>
                    <button
                      onClick={() => run(() => moveSection(fdFor(section.id, course.id, 1)), "সেকশন সরে গেছে")}
                      disabled={sIdx === sections.length - 1 || pending}
                      className="wp-btn !px-2"
                      aria-label="নিচে"
                    >
                      <i className="fa-solid fa-arrow-down text-xs" />
                    </button>
                    <button
                      onClick={() => setRenamingSection(section.id)}
                      className="wp-btn !px-2"
                      aria-label="নাম পরিবর্তন"
                    >
                      <i className="fa-solid fa-pen text-xs" />
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`"${section.title}" এবং এর সব টপিক মুছবেন?`)) return;
                        run(() => deleteSection(fdOnlyId(section.id)), "সেকশন মুছে ফেলা হয়েছে");
                      }}
                      className="wp-btn wp-btn-danger !px-2"
                      aria-label="মুছুন"
                    >
                      <i className="fa-solid fa-trash text-xs" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 p-3">
                  {sectionTopics.map((topic, tIdx) => (
                    <div key={topic.id} className="flex items-center gap-2 rounded-md border border-[#e2e2e2] bg-[#fafafa] px-3 py-2">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${TYPE_META[topic.type].color}`}>
                        <i className={`${TYPE_META[topic.type].icon} text-[11px]`} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#3c434a]">
                        {topic.title}
                      </span>
                      {topic.duration_minutes > 0 && (
                        <span className="hidden text-xs text-[#646970] sm:inline">
                          {topic.duration_minutes} মিনিট
                        </span>
                      )}
                      {topic.is_free && (
                        <span className="wp-tag wp-tag-green">ফ্রি</span>
                      )}
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#2271b1]">
                        {TYPE_META[topic.type].label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => run(() => moveTopic(fdFor(topic.id, section.id, -1)), "টপিক সরে গেছে")}
                          disabled={tIdx === 0 || pending}
                          className="wp-btn !px-2"
                          aria-label="উপরে"
                        >
                          <i className="fa-solid fa-arrow-up text-xs" />
                        </button>
                        <button
                          onClick={() => run(() => moveTopic(fdFor(topic.id, section.id, 1)), "টপিক সরে গেছে")}
                          disabled={tIdx === sectionTopics.length - 1 || pending}
                          className="wp-btn !px-2"
                          aria-label="নিচে"
                        >
                          <i className="fa-solid fa-arrow-down text-xs" />
                        </button>
                        <button
                          onClick={() => setEditingTopic(editingTopic === topic.id ? null : topic.id)}
                          className="wp-btn !px-2"
                          aria-label="এডিট"
                        >
                          <i className="fa-solid fa-pen text-xs" />
                        </button>
                        <button
                          onClick={() => {
                            if (!confirm(`"${topic.title}" মুছবেন?`)) return;
                            run(() => deleteTopic(fdOnlyId(topic.id)), "টপিক মুছে ফেলা হয়েছে");
                          }}
                          className="wp-btn wp-btn-danger !px-2"
                          aria-label="মুছুন"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {editingTopic && sectionTopics.some((t) => t.id === editingTopic) && (
                    <TopicForm
                      key={editingTopic}
                      course={course}
                      sectionId={section.id}
                      topic={sectionTopics.find((t) => t.id === editingTopic)}
                      questions={questionsByLesson[editingTopic] ?? []}
                      onDone={() => setEditingTopic(null)}
                    />
                  )}

                  {addingTopicSection === section.id ? (
                    <TopicForm
                      key={`add-${section.id}`}
                      course={course}
                      sectionId={section.id}
                      onDone={() => setAddingTopicSection(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setAddingTopicSection(section.id)}
                      className="text-xs font-semibold text-[#2271b1] hover:text-[#135e96] hover:underline"
                    >
                      <i className="fa-solid fa-plus" /> টপিক যোগ করুন
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {addingSection ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await run(async () => {
                  await createSection(new FormData(e.currentTarget));
                  e.currentTarget.reset();
                  setAddingSection(false);
                }, "সেকশন যোগ হয়েছে");
              }}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-[#b5bcc2] bg-white p-3"
            >
              <input type="hidden" name="course_id" value={course.id} />
              <div className="flex-1">
                <label className="wp-label">সেকশনের নাম</label>
                <input name="title" required placeholder="যেমন: ভূমিকা" className="wp-input" />
              </div>
              <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
                <i className="fa-solid fa-plus" /> সেকশন যোগ করুন
              </button>
              <button type="button" onClick={() => setAddingSection(false)} className="wp-btn">
                বাতিল
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              className="w-full rounded-lg border border-dashed border-[#b5bcc2] px-3 py-2 text-sm font-semibold text-[#2271b1] hover:bg-[#f0f6fc]"
            >
              <i className="fa-solid fa-plus" /> নতুন সেকশন
            </button>
          )}
        </div>
      </div>

      <div className="wp-panel">
        <div className="wp-panel-header">
          <span>
            <i className="fa-solid fa-video mr-1 text-[#2271b1]" />
            লাইভ ক্লাস ({liveClasses.length})
          </span>
        </div>
        <div className="wp-panel-body space-y-3">
          {liveClasses.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg border border-[#e2e2e2] bg-[#fafafa] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1d2327]">
                  {c.title}
                </p>
                <p className="truncate text-xs text-[#646970]">
                  {c.scheduled_at
                    ? new Date(c.scheduled_at).toLocaleString("bn-BD", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "তারিখ নির্ধারিত নয়"}
                  {c.duration_minutes > 0
                    ? ` • ${c.duration_minutes} মিনিট`
                    : ""}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!confirm("লাইভ ক্লাসটি মুছবেন?")) return;
                  const fd = new FormData();
                  fd.set("id", c.id);
                  run(() => deleteLiveClass(fd), "লাইভ ক্লাস মুছে ফেলা হয়েছে");
                }}
                className="wp-btn wp-btn-danger !px-2"
                aria-label="মুছুন"
              >
                <i className="fa-solid fa-trash text-xs" />
              </button>
            </div>
          ))}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await run(async () => {
                await createLiveClass(new FormData(e.currentTarget));
                e.currentTarget.reset();
              }, "লাইভ ক্লাস যোগ হয়েছে");
            }}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <input type="hidden" name="course_id" value={course.id} />
            <input name="title" required placeholder="ক্লাস শিরোনাম" className="wp-input" />
            <input name="scheduled_at" type="datetime-local" className="wp-input" />
            <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
              <i className="fa-solid fa-plus" /> যোগ করুন
            </button>
            <input name="description" placeholder="বর্ণনা (ঐচ্ছিক)" className="wp-input sm:col-span-2" />
            <input name="meeting_url" placeholder="Zoom/Meet লিংক (ঐচ্ছিক)" className="wp-input" />
            <input name="duration_minutes" type="number" min={1} defaultValue={60} placeholder="সময় (মিনিট)" className="wp-input" />
          </form>
        </div>
      </div>

      <div className="wp-panel">
        <div className="wp-panel-header">
          <span>
            <i className="fa-solid fa-bullhorn mr-1 text-[#2271b1]" />
            নোটিশ ({announcements.length})
          </span>
        </div>
        <div className="wp-panel-body space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-[#e2e2e2] bg-[#fafafa] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1d2327]">
                  {a.title}
                </p>
                {a.body && (
                  <p className="truncate text-xs text-[#646970]">{a.body}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-[#646970]">
                {new Date(a.created_at).toLocaleDateString("bn-BD")}
              </span>
              <button
                onClick={() => {
                  if (!confirm("নোটিশটি মুছবেন?")) return;
                  const fd = new FormData();
                  fd.set("id", a.id);
                  run(() => deleteAnnouncement(fd), "নোটিশ মুছে ফেলা হয়েছে");
                }}
                className="wp-btn wp-btn-danger !px-2"
                aria-label="মুছুন"
              >
                <i className="fa-solid fa-trash text-xs" />
              </button>
            </div>
          ))}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await run(async () => {
                await createAnnouncement(new FormData(e.currentTarget));
                e.currentTarget.reset();
              }, "নোটিশ যোগ হয়েছে");
            }}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto]"
          >
            <input type="hidden" name="course_id" value={course.id} />
            <input name="title" required placeholder="নোটিশ শিরোনাম" className="wp-input" />
            <input name="body" placeholder="বিস্তারিত (ঐচ্ছিক)" className="wp-input" />
            <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
              <i className="fa-solid fa-plus" /> যোগ করুন
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  function fdOnlyId(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    return fd;
  }

  function fdFor(id: string, parentId: string, direction: number) {
    const fd = fdOnlyId(id);
    fd.set("course_id", course.id);
    fd.set("section_id", parentId);
    fd.set("direction", String(direction));
    return fd;
  }
}

function TopicForm({
  course,
  sectionId,
  topic,
  questions,
  onDone,
}: {
  course: Course;
  sectionId: string;
  topic?: Lesson;
  questions?: QuizQuestion[];
  onDone: () => void;
}) {
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();
  const isEdit = !!topic;
  const isQuiz = (topic?.type ?? "lesson") === "quiz";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      if (topic) {
        await updateTopic(new FormData(e.currentTarget));
        showToast("টপিক আপডেট হয়েছে");
      } else {
        await createTopic(new FormData(e.currentTarget));
        e.currentTarget.reset();
        showToast("টপিক যোগ হয়েছে");
      }
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে", "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-[#e2e2e2] bg-[#f0f6fc] p-3">
      <input type="hidden" name="course_id" value={course.id} />
      <input type="hidden" name="section_id" value={sectionId} />
      {topic && <input type="hidden" name="id" value={topic.id} />}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <label className="wp-label">টপিক টাইপ</label>
          <select name="type" className="wp-input" defaultValue={topic?.type ?? "lesson"}>
            {TOPIC_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="wp-label">শিরোনাম</label>
          <input name="title" required defaultValue={topic?.title} placeholder="যেমন: ক্লাস ১" className="wp-input" />
        </div>
        <div>
          <label className="wp-label">Slug</label>
          <input name="slug" required defaultValue={topic?.slug} placeholder="class-1" className="wp-input" />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <VideoSourceFields
          prefix="video"
          initialUrl={topic?.video_url ?? ""}
          initialEmbed={topic?.video_embed ?? ""}
          className="sm:col-span-2"
        />
        <div>
          <label className="wp-label">সময় (মিনিট)</label>
          <input name="duration_minutes" type="number" defaultValue={topic?.duration_minutes ?? 0} className="wp-input" />
        </div>
      </div>
      <div className="mt-2">
        <label className="wp-label">বর্ণনা</label>
        <input name="description" defaultValue={topic?.description ?? ""} className="wp-input" />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="wp-label">কুইজ পাস % (কুইজের জন্য)</label>
          <input name="pass_percent" type="number" min={0} max={100} defaultValue={topic?.pass_percent ?? 60} className="wp-input" />
        </div>
        <div>
          <label className="wp-label">ড্রিপ রিলিজ (এনরোলের পরে দিন)</label>
          <input name="release_days" type="number" min={0} defaultValue={topic?.release_days ?? 0} className="wp-input" />
        </div>
      </div>
      <div className="mt-2">
        <label className="wp-label">কনটেন্ট (লেসন/অ্যাসাইনমেন্টের জন্য)</label>
        <textarea name="content" rows={2} defaultValue={topic?.content ?? ""} className="wp-input" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-[#3c434a]">
          <input type="checkbox" name="is_free" defaultChecked={topic?.is_free ?? false} className="h-3.5 w-3.5" />
          ফ্রি প্রিভিউ
        </label>
        <div className="ml-auto flex gap-2">
          <button type="submit" className="wp-btn wp-btn-primary" disabled={pending}>
            <i className="fa-solid fa-floppy-disk" /> {pending ? "সেভ হচ্ছে..." : isEdit ? "আপডেট" : "যোগ করুন"}
          </button>
          <button type="button" onClick={onDone} className="wp-btn">
            বাতিল
          </button>
        </div>
      </div>

      {isEdit && isQuiz && (
        <QuestionsEditor lessonId={topic!.id} questions={questions ?? []} />
      )}
    </form>
  );
}