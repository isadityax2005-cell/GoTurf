import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTurfBySlug, DEMO_TURFS } from '@/lib/data/turfs';
import CheckoutClient from '@/components/checkout-client';

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_TURFS.map((t) => ({ slug: t.slug }));
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const turf = getTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center text-xs">
          Loading checkout...
        </div>
      }
    >
      <CheckoutClient turf={turf} />
    </Suspense>
  );
}
