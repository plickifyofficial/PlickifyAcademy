"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef, SectionDef } from "@/lib/content-schema";
import { saveSectionContent, uploadContentImage } from "@/lib/actions/content";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const COMMON_ICONS = [
  "fa-solid fa-brain",
  "fa-solid fa-briefcase",
  "fa-solid fa-chart-line",
  "fa-solid fa-palette",
  "fa-solid fa-bullhorn",
  "fa-solid fa-globe",
  "fa-solid fa-user-group",
  "fa-solid fa-book-open",
  "fa-solid fa-play",
  "fa-solid fa-trophy",
  "fa-solid fa-graduation-cap",
  "fa-solid fa-rocket",
  "fa-solid fa-dollar-sign",
  "fa-solid fa-user-plus",
  "fa-solid fa-book-open-reader",
  "fa-solid fa-keyboard",
  "fa-solid fa-diagram-project",
  "fa-solid fa-sack-dollar",
  "fa-solid fa-comment-dots",
  "fa-solid fa-wand-magic-sparkles",
  "fa-solid fa-gem",
  "fa-solid fa-robot",
  "fa-solid fa-bolt",
  "fa-solid fa-toolbox",
  "fa-solid fa-book",
  "fa-solid fa-calendar-days",
  "fa-solid fa-circle-info",
  "fa-solid fa-check",
  "fa-solid fa-star",
  "fa-solid fa-heart",
  "fa-solid fa-tag",
  "fa-solid fa-phone",
  "fa-solid fa-envelope",
  "fa-solid fa-location-dot",
  "fa-solid fa-link",
  "fa-solid fa-image",
  "fa-brands fa-facebook-f",
  "fa-brands fa-youtube",
  "fa-brands fa-linkedin-in",
  "fa-brands fa-instagram",
  "fa-brands fa-telegram",
  "fa-brands fa-whatsapp",
  "fa-brands fa-tiktok",
];

function getPath(obj: Record<string, unknown>, path: string[]) {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function setPath(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
  return clone;
}

function emptyItem(fields: FieldDef[]): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.kind === "list") item[f.key] = [];
    else if (f.kind === "stringlist") item[f.key] = [];
    else if (f.kind === "number") item[f.key] = 0;
    else item[f.key] = "";
  }
  return item;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string) {
  return v ? new Date(v).toISOString() : "";
}

type Path = (string | number)[];

export function ContentEditor({
  sections,
  initial,
}: {
  sections: SectionDef[];
  initial: Record<string, Record<string, unknown>>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [open, setOpen] = useState<string>(sections[0]?.key ?? "");

  function change(sectionKey: string, path: Path, value: unknown) {
    setValues((v) => ({
      ...v,
      [sectionKey]: setPath(v[sectionKey] ?? {}, path as string[], value),
    }));
  }

  async function save(section: SectionDef) {
    setPending(section.key);
    try {
      await saveSectionContent(section.key, values[section.key] ?? {});
      showToast(`${section.title} saved`);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setPending(null);
    }
  }

  async function reset(section: SectionDef) {
    setPending(section.key);
    try {
      await saveSectionContent(section.key, section.defaults);
      setValues((v) => ({ ...v, [section.key]: section.defaults }));
      showToast(`${section.title} reset to defaults`);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not reset", "error");
    } finally {
      setPending(null);
    }
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    sectionKey: string,
    path: Path,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await uploadContentImage(fd);
      change(sectionKey, path, res.url);
      showToast("Image uploaded");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Image upload failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const value = values[section.key] ?? {};
        const isOpen = open === section.key;

        return (
          <div key={section.key} className="wp-panel">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? "" : section.key)}
              className="wp-panel-header w-full cursor-pointer text-left"
            >
              <span className="flex items-center gap-2">
                <i
                  className={cn(
                    "fa-solid text-[#2271b1] transition-transform",
                    isOpen ? "fa-chevron-up" : "fa-chevron-down",
                  )}
                />
                {section.title}
              </span>
            </button>

            {isOpen && (
              <div className="wp-panel-body">
                {section.description && (
                  <p className="mb-5 rounded bg-[#f0f6fc] px-3 py-2 text-xs text-[#2271b1]">
                    {section.description}
                  </p>
                )}

                <div className="space-y-5">
                  {section.fields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={getPath(value, [field.key])}
                      sectionKey={section.key}
                      onChange={(path, v) =>
                        change(section.key, [field.key, ...path], v)
                      }
                      onImageUpload={(path, fileEvent) =>
                        handleImageUpload(
                          fileEvent,
                          section.key,
                          [field.key, ...path],
                        )
                      }
                    />
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#c3c4c7] pt-5">
                  <button
                    onClick={() => save(section)}
                    disabled={pending === section.key}
                    className="wp-btn wp-btn-primary"
                  >
                    <i className="fa-solid fa-floppy-disk" />
                    {pending === section.key ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => reset(section)}
                    disabled={pending === section.key}
                    className="wp-btn"
                  >
                    <i className="fa-solid fa-rotate-left" /> Reset to Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  sectionKey,
  onChange,
  onImageUpload,
}: {
  field: FieldDef;
  value: unknown;
  sectionKey: string;
  onChange: (path: Path, value: unknown) => void;
  onImageUpload: (path: Path, e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  switch (field.kind) {
    case "text":
    case "url":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <input
            type="text"
            className="wp-input"
            value={typeof value === "string" ? value : ""}
            placeholder={field.kind === "url" ? "https://..." : ""}
            onChange={(e) => onChange([], e.target.value)}
          />
        </FieldWrapper>
      );
    case "textarea":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <textarea
            className="wp-input min-h-[90px]"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange([], e.target.value)}
          />
        </FieldWrapper>
      );
    case "number":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <input
            type="number"
            className="wp-input"
            value={typeof value === "number" ? value : 0}
            onChange={(e) => onChange([], Number(e.target.value) || 0)}
          />
        </FieldWrapper>
      );
    case "datetime":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <input
            type="datetime-local"
            className="wp-input"
            value={toLocalInput(typeof value === "string" ? value : "")}
            onChange={(e) => onChange([], fromLocalInput(e.target.value))}
          />
        </FieldWrapper>
      );
    case "icon":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#c3c4c7] bg-[#f0f0f1] text-[#2271b1]">
              <i className={typeof value === "string" && value ? value : "fa-solid fa-star"} />
            </span>
            <input
              type="text"
              list="content-fa-icons"
              className="wp-input"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange([], e.target.value)}
            />
            <datalist id="content-fa-icons">
              {COMMON_ICONS.map((i) => (
                <option key={i} value={i} />
              ))}
            </datalist>
          </div>
        </FieldWrapper>
      );
    case "image":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <div className="flex items-start gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f0f0f1]">
              {typeof value === "string" && value ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" className="h-full w-full object-contain" />
              ) : (
                <i className="fa-solid fa-image text-xl text-[#8c8f94]" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                className="wp-input"
                value={typeof value === "string" ? value : ""}
                placeholder="Image URL or upload"
                onChange={(e) => onChange([], e.target.value)}
              />
              <label className="block cursor-pointer rounded border border-dashed border-[#8c8f94] px-3 py-2 text-center text-xs font-medium text-[#2271b1] hover:border-[#2271b1]">
                <i className="fa-solid fa-upload mr-1" /> Upload Image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  className="hidden"
                  onChange={(e) => onImageUpload([], e)}
                />
              </label>
            </div>
          </div>
        </FieldWrapper>
      );
    case "stringlist":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <div className="space-y-2">
            {(Array.isArray(value) ? value : []).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  className="wp-input"
                  value={typeof item === "string" ? item : ""}
                  placeholder={field.itemLabel ?? "Item"}
                  onChange={(e) => {
                    const next = [...((Array.isArray(value) ? value : []) as string[])];
                    next[i] = e.target.value;
                    onChange([], next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = [...((Array.isArray(value) ? value : []) as string[])];
                    next.splice(i, 1);
                    onChange([], next);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#c3c4c7] text-[#d63638] hover:bg-red-50"
                  aria-label="Delete"
                >
                  <i className="fa-solid fa-trash-can text-sm" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange([], [...((Array.isArray(value) ? value : []) as string[]), ""])
              }
              className="wp-btn"
            >
              <i className="fa-solid fa-plus" /> Add
            </button>
          </div>
        </FieldWrapper>
      );
    case "list":
      return (
        <FieldWrapper label={field.label} hint={field.hint}>
          <div className="space-y-3">
            {(Array.isArray(value) ? value : []).map((item, i) => (
              <div key={i} className="rounded border border-[#c3c4c7] bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-[#c3c4c7] bg-[#f6f7f7] px-3 py-2">
                  <span className="truncate text-xs font-semibold text-[#1d2327]">
                    {field.itemLabel} #{i + 1}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...(value as unknown[])];
                        const t = next[i - 1];
                        next[i - 1] = next[i];
                        next[i] = t;
                        onChange([], next);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#c3c4c7] text-[#2271b1] disabled:opacity-40"
                      aria-label="Move up"
                    >
                      <i className="fa-solid fa-arrow-up text-xs" />
                    </button>
                    <button
                      type="button"
                      disabled={i === (value as unknown[]).length - 1}
                      onClick={() => {
                        const next = [...(value as unknown[])];
                        const t = next[i + 1];
                        next[i + 1] = next[i];
                        next[i] = t;
                        onChange([], next);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#c3c4c7] text-[#2271b1] disabled:opacity-40"
                      aria-label="Move down"
                    >
                      <i className="fa-solid fa-arrow-down text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...(value as unknown[])];
                        next.splice(i, 1);
                        onChange([], next);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#c3c4c7] text-[#d63638] hover:bg-red-50"
aria-label="Delete"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4 p-3">
                  {field.fields.map((f) => (
                    <FieldRenderer
                      key={f.key}
                      field={f}
                      value={getPath(item as Record<string, unknown>, [f.key])}
                      sectionKey={sectionKey}
                      onChange={(path, v) =>
                        onChange([i, f.key, ...path], v)
                      }
                      onImageUpload={(path, e) =>
                        onImageUpload([i, f.key, ...path], e)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange([], [...((value as unknown[]) ?? []), emptyItem(field.fields)])
              }
              className="wp-btn"
            >
              <i className="fa-solid fa-plus" /> Add {field.itemLabel}
            </button>
          </div>
        </FieldWrapper>
      );
    default:
      return null;
  }
}

function FieldWrapper({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="wp-label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#646970]">{hint}</p>}
    </div>
  );
}
