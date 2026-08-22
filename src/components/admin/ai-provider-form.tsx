"use client";

import { useState } from "react";
import { saveAiProviderConfig, testAiProviderConnection } from "@/lib/actions/ai";
import type { AiStatus } from "@/lib/ai/provider";

type Props = {
  initial: AiStatus;
};

export function AiProviderForm({ initial }: Props) {
  const [label, setLabel] = useState(initial.providerLabel || "Mistral AI");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(initial.model || "mistral-small-latest");
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl || "https://api.mistral.ai/v1");
  const [pending, setPending] = useState(false);
  const [testState, setTestState] = useState<{ ok: boolean; message: string } | null>(null);
  const [testPending, setTestPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      await saveAiProviderConfig({ providerLabel: label, apiKey, model, baseUrl });
      setApiKey(""); // clear so it isn't re-sent; existing key retained server-side
      setMessage("Provider configuration saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setPending(false);
    }
  }

  async function handleTest() {
    setTestPending(true);
    setTestState(null);
    try {
      const res = await testAiProviderConnection();
      setTestState(res);
    } catch (err) {
      setTestState({
        ok: false,
        message: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setTestPending(false);
    }
  }

  return (
    <div className="wp-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-900">AI Provider (API)</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Any OpenAI-compatible provider — Mistral, OpenAI, Groq, OpenRouter, etc.
            The key is stored in a secure admin-only table and is never sent to the
            browser.
          </p>
        </div>
        {initial.configured && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <i className="fa-solid fa-plug-circle-check mr-1" />
            {initial.source === "panel" ? "Configured via panel" : "From env vars"} ·{" "}
            {initial.keyHint}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            Provider Name
          </span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className="wp-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            Model
          </span>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="mistral-small-latest"
            className="wp-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            API Key {initial.configured ? "(leave blank to keep current)" : ""}
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={initial.configured ? "•••• saved" : "sk-... or your provider key"}
            className="wp-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            API Base URL
          </span>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.mistral.ai/v1"
            className="wp-input font-mono"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={handleSave} disabled={pending} className="wp-btn wp-btn-primary">
          <i className={pending ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-cloud-arrow-up"} />
          Save Provider
        </button>
        <button onClick={handleTest} disabled={testPending} className="wp-btn">
          <i className={testPending ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-flask"} />
          Test Connection
        </button>
        {message && <span className="text-sm text-zinc-600">{message}</span>}
      </div>

      {testState && (
        <p
          className={
            testState.ok
              ? "mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
              : "mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600"
          }
        >
          <i
            className={testState.ok ? "fa-solid fa-circle-check mr-1.5" : "fa-solid fa-triangle-exclamation mr-1.5"}
          />
          {testState.message}
        </p>
      )}
    </div>
  );
}
