import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTurfBySlug, DEMO_TURFS } from '@/lib/data/turfs';
import BookTurfClient from '@/components/book-turf-client';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_TURFS.map((t) => ({ slug: t.slug }));
}

async function BookTurfContent({ params }: BookPageProps) {
  const { slug } = await params;
  const turf = getTurfBySlug(slug);

  if (!turf) {
    notFound();
  }

  return <BookTurfClient turf={turf} />;
}

export default function BookTurfPage({ params }: BookPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center text-xs">
          Loading live slot grid...
        </div>
      }
    >
      <BookTurfContent params={params} />
    </Suspense>
  );
}

