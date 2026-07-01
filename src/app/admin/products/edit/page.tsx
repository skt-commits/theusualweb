import { Suspense } from 'react';
import ClientPage from './ClientPage';

export default function EditProductPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading Editor...</div>}>
      <ClientPage />
    </Suspense>
  );
}
