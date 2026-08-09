"use client";
import { useState } from "react";
import { Submission, SubmissionStatus } from "@/lib/types";

export default function CreateForm({
  onCreate,
  onClose,
}: {
  onCreate: (s: Submission) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [abstract, setAbstract] = useState("");
  const [status, setStatus] = useState<SubmissionStatus>("Draft");
  const [error, setError] = useState("");

  function submit() {
    if (!title.trim() || !authors.trim() || !abstract.trim()) {
      setError("Please fill in title, authors, and abstract.");
      return;
    }
    const now = new Date();
    const newSub: Submission = {
      id: "SM-" + Math.floor(1000 + Math.random() * 9000),
      title: title.trim(),
      authors: authors.trim(),
      abstract: abstract.trim(),
      status,
      submittedAt: now.toISOString(),
    };
    onCreate(newSub);
    onClose();
  }

  const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Authors</label>
        <input className={field} value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="A. Author, B. Author" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Abstract</label>
        <textarea className={field} rows={4} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value as SubmissionStatus)}>
          <option value="Draft">Draft</option>
          <option value="Under Review">Under Review</option>
          <option value="Cleared">Cleared</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button onClick={submit} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Create
        </button>
      </div>
    </div>
  );
}