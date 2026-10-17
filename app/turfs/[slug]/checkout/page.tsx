import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchTurfBySlug, DEMO_TURFS } from '@/lib/data/turfs';
import CheckoutClient from '@/components/checkout-client';

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_TURFS.map((t) => ({ slug: t.slug }));
}

async function CheckoutContent({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const turf = await fetchTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return <CheckoutClient turf={turf} />;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#82eda6] text-[#03594d] flex items-center justify-center text-sm font-black">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent params={params} />
    </Suspense>
  );
}

