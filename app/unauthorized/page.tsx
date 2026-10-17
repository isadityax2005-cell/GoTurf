'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const isAdminRequired = reason === 'admin_required';
  const isOwnerRequired = reason === 'owner_required';

  return (
    <div className="max-w-md w-full p-8 sm:p-10 rounded-[32px] bg-white border-2 border-[#03594d] text-center shadow-maggie-lg">
      <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-[#ffff94] border-2 border-[#03594d] text-[#03594d] flex items-center justify-center text-3xl shadow-maggie-sm">
        {isAdminRequired ? '👑' : isOwnerRequired ? '🏟️' : '🛡️'}
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight text-[#03594d] mb-2">
        {isAdminRequired
          ? 'Admin Access Required'
          : isOwnerRequired
          ? 'Owner Portal Access'
          : 'Access Restricted'}
      </h1>

      <p className="text-xs text-[#03594d]/80 font-bold mb-6 leading-relaxed">
        {isAdminRequired ? (
          <>
            This control suite is strictly reserved for the Platform Admin (
            <strong>isadityax2005@gmail.com</strong>). Please sign in using your Admin credentials to proceed.
          </>
        ) : isOwnerRequired ? (
          <>
            This portal is reserved for registered turf owners and venue managers. Please sign in with an owner account.
          </>
        ) : (
          <>
            You do not have the required permissions to view this section. This portal is strictly protected by role-based access rules.
          </>
        )}
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href={
            isAdminRequired
              ? '/login?redirect=%2Fadmin'
              : isOwnerRequired
              ? '/login?redirect=%2Fowner'
              : '/login'
          }
          className="w-full py-3.5 px-4 rounded-full bg-[#03594d] text-[#82eda6] font-black uppercase text-xs tracking-wider border-2 border-[#03594d] shadow-maggie hover:bg-[#02463c] transition-all"
        >
          {isAdminRequired ? 'Sign In as Admin →' : 'Switch Account or Sign In'}
        </Link>
        <Link
          href="/"
          className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-[#ffff94] text-[#03594d] font-black uppercase text-xs tracking-wider border-2 border-[#03594d] shadow-maggie-sm transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#82eda6] text-[#03594d] flex flex-col items-center justify-center px-6 selection:bg-[#ffff94] selection:text-[#03594d]">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-8 rounded-[32px] bg-white border-2 border-[#03594d] text-center text-xs font-bold text-[#03594d]">
            Verifying permissions...
          </div>
        }
      >
        <UnauthorizedContent />
      </Suspense>
    </main>
  );
}
