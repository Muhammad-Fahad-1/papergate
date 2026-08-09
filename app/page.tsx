"use client";
import { useEffect, useMemo, useState } from "react";
import { Submission, SubmissionStatus } from "@/lib/types";
import { statusStyles } from "@/lib/status";

type SortKey = "title" | "authors" | "submittedAt" | "status";

export default function DashboardPage() {
  const [data, setData] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SubmissionStatus>("All");
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((d: Submission[]) => setData(d))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    return {
      total: data.length,
      review: data.filter((d) => d.status === "Under Review").length,
      cleared: data.filter((d) => d.status === "Cleared").length,
      rejected: data.filter((d) => d.status === "Rejected").length,
    };
  }, [data]);

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
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const statCards = [
    { label: "Total Submissions", value: stats.total },
    { label: "Under Review", value: stats.review },
    { label: "Cleared", value: stats.cleared },
    { label: "Rejected", value: stats.rejected },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview of academic submissions.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">{c.label}</div>
            <div className="mt-1 text-3xl font-bold">{c.value}</div>
          </div>
        ))}
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
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
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