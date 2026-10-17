import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchTurfBySlug, DEMO_TURFS } from '@/lib/data/turfs';
import BookTurfClient from '@/components/book-turf-client';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_TURFS.map((t) => ({ slug: t.slug }));
}

async function BookTurfContent({ params }: BookPageProps) {
  const { slug } = await params;
  const turf = await fetchTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return <BookTurfClient turf={turf} />;
}

export default function BookTurfPage({ params }: BookPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#82eda6] text-[#03594d] flex items-center justify-center text-sm font-black">
          Loading live slot grid...
        </div>
      }
    >
      <BookTurfContent params={params} />
    </Suspense>
  );
}

