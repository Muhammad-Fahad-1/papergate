"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Submission } from "@/lib/types";

const colors: Record<string, string> = {
  Draft: "#94a3b8",
  "Under Review": "#f59e0b",
  Cleared: "#22c55e",
  Rejected: "#ef4444",
};

export default function StatusChart({ data }: { data: Submission[] }) {
  const counts = ["Draft", "Under Review", "Cleared", "Rejected"].map((status) => ({
    status,
    count: data.filter((d) => d.status === status).length,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-200">
        Submissions by Status
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={counts}>
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {counts.map((c) => (
              <Cell key={c.status} fill={colors[c.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}