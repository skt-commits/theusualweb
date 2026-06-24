import ClientPage from './ClientPage';

export function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientPage id={id} />;
}
