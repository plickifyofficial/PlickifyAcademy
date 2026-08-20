"use client";

import { useState } from "react";
import type { BlogComment } from "@/lib/types";
import { addBlogComment, likeBlogComment, reportBlogComment } from "@/lib/actions/blog";
import { useToast } from "@/components/ui/toaster";
import { formatBlogDateLong } from "@/lib/blog-utils";

export function Comments({
  postId,
  comments,
  likedIds,
  loggedInName,
  enabled,
}: {
  postId: string;
  comments: BlogComment[];
  likedIds: string[];
  loggedInName: string | null;
  enabled: boolean;
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState(comments);
  const [liked, setLiked] = useState<Set<string>>(new Set(likedIds));
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const topLevel = items.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => items.filter((c) => c.parent_id === id);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("post_id", postId);
    fd.set("body", e.currentTarget.body.value);
    if (replyingTo) fd.set("parent_id", replyingTo);
    if (!loggedInName) {
      const nameInput = e.currentTarget.elements.namedItem("name") as HTMLInputElement | null;
      const emailInput = e.currentTarget.elements.namedItem("email") as HTMLInputElement | null;
      fd.set("name", nameInput?.value ?? "");
      fd.set("email", emailInput?.value ?? "");
    }
    setPending(true);
    const res = await addBlogComment(fd);
    setPending(false);
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    showToast("Comment submitted for moderation.");
    e.currentTarget.reset();
    setReplyingTo(null);
  }

  async function toggleLike(id: string) {
    const isLiked = liked.has(id);
    setLiked((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, likes: c.likes + (isLiked ? -1 : 1) } : c,
      ),
    );
    const res = await likeBlogComment(id, !isLiked);
    if (res?.error) {
      showToast(res.error, "error");
      setLiked((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(id);
        else next.delete(id);
        return next;
      });
      setItems((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, likes: c.likes + (isLiked ? 1 : -1) } : c,
        ),
      );
    }
  }

  async function report(id: string) {
    const res = await reportBlogComment(id);
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    showToast("Comment reported.");
  }

  function CommentItem({ comment, depth }: { comment: BlogComment; depth: number }) {
    return (
      <div className={depth > 0 ? "ml-6 mt-4 sm:ml-10" : "mt-5"}>
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white">
              {(comment.name || "P").slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-zinc-900">
                  {comment.name || "Anonymous"}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatBlogDateLong(comment.created_at)}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {comment.body}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => toggleLike(comment.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    liked.has(comment.id)
                      ? "font-semibold text-brand-600"
                      : "hover:text-brand-600"
                  }`}
                >
                  <i
                    className={`${liked.has(comment.id) ? "fa-solid" : "fa-regular"} fa-thumbs-up`}
                  />
                  {comment.likes}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 hover:text-brand-600"
                >
                  <i className="fa-regular fa-comment-dots" /> Reply
                </button>
                <button
                  type="button"
                  onClick={() => report(comment.id)}
                  className="ml-auto flex items-center gap-1 hover:text-red-600"
                >
                  <i className="fa-regular fa-flag" /> Report
                </button>
              </div>

              {replyingTo === comment.id && (
                <form
                  onSubmit={(e) => submit(e)}
                  className="mt-3 flex flex-col gap-2"
                >
                  <textarea
                    name="body"
                    required
                    rows={2}
                    placeholder="Write your reply..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      {pending ? "Posting..." : "Post Reply"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
        {repliesOf(comment.id).map((r) => (
          <CommentItem key={r.id} comment={r} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (!enabled) return null;

  return (
    <div className="mt-12">
      <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900">
        <i className="fa-regular fa-comments text-brand-600" /> Comments
        <span className="text-sm font-semibold text-zinc-400">
          ({comments.length})
        </span>
      </h2>

      {topLevel.length > 0 && (
        <div className="mt-2">
          {topLevel.map((c) => (
            <CommentItem key={c.id} comment={c} depth={0} />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="text-sm font-bold text-zinc-900">Leave a Comment</h3>
        <form onSubmit={(e) => submit(e)} className="mt-3 flex flex-col gap-3">
          {!loggedInName && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="name"
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              <input
                name="email"
                type="email"
                placeholder="Email (not published)"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
          )}
          <textarea
            name="body"
            required
            rows={4}
            placeholder="Share your thoughts..."
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Comments are moderated before publishing.
            </p>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              {pending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}