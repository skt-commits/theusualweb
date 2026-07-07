import ClientPage from './ClientPage';
import { Suspense } from 'react';

export function generateStaticParams() {
  return [
    { slug: 'mens' },
    { slug: 'womens' },
    { slug: 'children' },
    { slug: 'boys' },
    { slug: 'girls' },
    { slug: 'toddlers' },
    { slug: 'new-arrivals' },
    { slug: 'fabric' },
    { slug: 'accessories' },
    { slug: 'offer-zone' },
    { slug: 'search' }
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading Category...</div>}>
      <ClientPage slug={slug} />
    </Suspense>
  );
}
