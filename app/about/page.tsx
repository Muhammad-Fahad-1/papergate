export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">About PaperGate</h1>
      <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
        PaperGate is a demo academic pre-submission dashboard. It lets you browse research
        submissions, inspect each one, run a rule-based integrity check on the abstract, and
        generate a SHA-256 seal that makes any later tampering detectable.
      </p>
      <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
        Built with Next.js, React, and Tailwind CSS. Submission data is served from a Next.js
        API route, and new submissions are held in client state for the length of the session.
      </p>
      <p className="mt-3 text-sm text-slate-400">
        This is a portfolio project and not affiliated with any organization.
      </p>
    </div>
  );
}