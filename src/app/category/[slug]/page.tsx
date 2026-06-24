import ClientPage from './ClientPage';

export function generateStaticParams() {
  return [
    { slug: 'mens' },
    { slug: 'womens' },
    { slug: 'children' },
    { slug: 'new-arrivals' },
    { slug: 'accessories' },
    { slug: 'offer-zone' },
    { slug: 'search' }
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientPage slug={slug} />;
}
