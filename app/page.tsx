"use client";
import { useEffect, useMemo, useState } from "react";
import { Submission, SubmissionStatus } from "@/lib/types";
import { statusStyles } from "@/lib/status";
import { sealDocument, verifyDocument } from "@/lib/crypto";
import Modal from "@/components/Modal";
import CreateForm from "@/components/CreateForm";
import StatusChart from "@/components/StatusChart";

type SortKey = "title" | "authors" | "submittedAt" | "status";

interface IntegrityReport {
  originalityScore: number;
  readability: string;
  checks: { label: string; passed: boolean; note: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SubmissionStatus>("All");
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [creating, setCreating] = useState(false);
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [checking, setChecking] = useState(false);
  const [sealInfo, setSealInfo] = useState<{ hash: string; sealedAt: string } | null>(null);
  const [verifyResult, setVerifyResult] = useState<null | boolean>(null);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((d: Submission[]) => setData(d))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  function openDetail(s: Submission) {
    setSelected(s);
    setReport(null);
    setSealInfo(null);
    setVerifyResult(null);
  }

  async function runIntegrityCheck() {
    if (!selected) return;
    setChecking(true);
    setReport(null);
    try {
      const res = await fetch("/api/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abstract: selected.abstract }),
      });
      const data = await res.json();
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setChecking(false);
    }
  }

  async function handleSeal() {
    if (!selected) return;
    const info = await sealDocument(selected.abstract);
    setSealInfo(info);
    setVerifyResult(null);
  }

  async function handleVerify() {
    if (!selected || !sealInfo) return;
    const ok = await verifyDocument(selected.abstract, sealInfo.hash);
    setVerifyResult(ok);
  }

  function handleCreate(s: Submission) {
    setData((prev) => [s, ...prev]);
  }

  const stats = useMemo(() => ({
    total: data.length,
    review: data.filter((d) => d.status === "Under Review").length,
    cleared: data.filter((d) => d.status === "Cleared").length,
    rejected: data.filter((d) => d.status === "Rejected").length,
  }), [data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) => r.title.toLowerCase().includes(q) || r.authors.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
  }, [data, search, statusFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  const statCards = [
    { label: "Total Submissions", value: stats.total },
    { label: "Under Review", value: stats.review },
    { label: "Cleared", value: stats.cleared },
    { label: "Rejected", value: stats.rejected },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of academic submissions.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New Submission
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="mt-1 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <StatusChart data={data} />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "All" | SubmissionStatus)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="All">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Under Review">Under Review</option>
          <option value="Cleared">Cleared</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <Th label="Title" onClick={() => toggleSort("title")} />
              <Th label="Authors" onClick={() => toggleSort("authors")} />
              <Th label="Submitted" onClick={() => toggleSort("submittedAt")} />
              <Th label="Status" onClick={() => toggleSort("status")} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">No submissions match.</td></tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => openDetail(s)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{s.title}</td>
                  <td className="px-4 py-3 text-slate-600">{s.authors}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ""}>
        {selected && (
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <span className="font-medium text-slate-700">ID: </span>
              <span className="text-slate-600">{selected.id}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Authors: </span>
              <span className="text-slate-600">{selected.authors}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Submitted: </span>
              <span className="text-slate-600">{new Date(selected.submittedAt).toLocaleString()}</span>
            </div>
            <div>
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[selected.status]}`}>
                {selected.status}
              </span>
            </div>
            <div>
              <div className="font-medium text-slate-700">Abstract</div>
              <p className="mt-1 leading-relaxed text-slate-600">{selected.abstract}</p>
            </div>

            <div className="mt-2 border-t border-slate-100 pt-3">
              <button
                onClick={runIntegrityCheck}
                disabled={checking}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {checking ? "Checking..." : "Run Integrity Check"}
              </button>

              {report && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Integrity Report</span>
                    <span className="text-sm text-slate-500">
                      Originality {report.originalityScore}/100 · {report.readability}
                    </span>
                  </div>
                  <ul className="mt-3 flex flex-col gap-2">
                    {report.checks.map((c) => (
                      <li key={c.label} className="flex items-start gap-2">
                        <span className={c.passed ? "text-green-600" : "text-red-500"}>
                          {c.passed ? "✓" : "✗"}
                        </span>
                        <span className="text-slate-700">
                          <span className="font-medium">{c.label}.</span>{" "}
                          <span className="text-slate-500">{c.note}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-slate-400">
                    Rule-based integrity heuristics. Not a substitute for full peer review.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-1 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSeal}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Seal Document
                </button>
                {sealInfo && (
                  <button
                    onClick={handleVerify}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Verify Seal
                  </button>
                )}
              </div>

              {sealInfo && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-medium text-emerald-800">SHA-256 Seal</div>
                  <div className="mt-1 break-all font-mono text-xs text-slate-700">{sealInfo.hash}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Sealed at {new Date(sealInfo.sealedAt).toLocaleString()}
                  </div>
                  {verifyResult !== null && (
                    <div className={`mt-2 text-xs font-medium ${verifyResult ? "text-green-700" : "text-red-600"}`}>
                      {verifyResult
                        ? "✓ Verified: content matches the seal."
                        : "✗ Mismatch: content has changed since sealing."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="New Submission">
        <CreateForm onCreate={handleCreate} onClose={() => setCreating(false)} />
      </Modal>
    </div>
  );
}

function Th({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th
      onClick={onClick}
      className="cursor-pointer select-none px-4 py-3 font-semibold hover:text-slate-900"
    >
      {label} <span className="text-slate-300">↕</span>
    </th>
  );
}