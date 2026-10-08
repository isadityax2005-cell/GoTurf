import Link from 'next/link';

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center px-6 selection:bg-rose-500 selection:text-white">
      <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 text-center shadow-2xl">
        <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-3xl">
          🛡️
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Access Restricted
        </h1>

        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          You do not have the required permissions to view this section. This portal is strictly protected by role-based access rules.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors"
          >
            Switch Account or Sign In
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
