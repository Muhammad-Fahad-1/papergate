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
          <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
            itemStyle={{ color: "#f1f5f9" }}
          />
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