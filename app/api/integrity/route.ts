import { NextResponse } from "next/server";

interface IntegrityReport {
  originalityScore: number;
  readability: string;
  checks: { label: string; passed: boolean; note: string }[];
}

export async function POST(request: Request) {
  const { abstract } = await request.json();

  if (!abstract || typeof abstract !== "string") {
    return NextResponse.json({ error: "Abstract is required." }, { status: 400 });
  }

  const words = abstract.trim().split(/\s+/);
  const wordCount = words.length;
  const sentences = abstract.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  const lower = abstract.toLowerCase();

  const mentionsMethod = /method|approach|propose|design|framework|protocol|model/.test(lower);
  const mentionsResult = /result|achiev|reduc|improv|%|accuracy|auc|outperform/.test(lower);

  // Deterministic pseudo-score derived from the text, so the same abstract always scores the same.
  let hash = 0;
  for (let i = 0; i < abstract.length; i++) hash = (hash * 31 + abstract.charCodeAt(i)) % 1000;
  const originalityScore = 70 + (hash % 30); // 70–99

  const readability =
    avgWordsPerSentence > 30 ? "Dense" : avgWordsPerSentence > 20 ? "Moderate" : "Clear";

  const checks = [
    {
      label: "Sufficient length",
      passed: wordCount >= 20,
      note: `${wordCount} words${wordCount < 20 ? " (abstracts under 20 words are often too thin)" : ""}`,
    },
    {
      label: "States a method or approach",
      passed: mentionsMethod,
      note: mentionsMethod ? "Methodology language detected" : "No clear method described",
    },
    {
      label: "Reports results or outcomes",
      passed: mentionsResult,
      note: mentionsResult ? "Outcome language detected" : "No quantified results found",
    },
    {
      label: "Readable sentence structure",
      passed: avgWordsPerSentence <= 30,
      note: `~${avgWordsPerSentence.toFixed(0)} words per sentence (${readability})`,
    },
  ];

  const report: IntegrityReport = { originalityScore, readability, checks };

  // Simulate processing latency so the loading state is visible.
  await new Promise((r) => setTimeout(r, 700));

  return NextResponse.json(report);
}