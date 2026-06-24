import ClientPage from './ClientPage';

export function generateStaticParams() {
  const slugs = ['mens', 'womens', 'children', 'new-arrivals', 'accessories', 'offer-zone'];
  const ids: { id: string }[] = [];
  slugs.forEach(slug => {
    for (let i = 0; i < 8; i++) {
      ids.push({ id: `${slug}-${i}` });
    }
  });
  ids.push({ id: 'na1' }, { id: 'na2' }, { id: 'na3' });
  return ids;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientPage id={id} />;
}
