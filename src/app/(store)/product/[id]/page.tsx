import ClientPage from './ClientPage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateStaticParams() {
  const ids: { id: string }[] = [];
  
  // Include mock IDs for placeholders
  const slugs = ['mens', 'womens', 'children', 'new-arrivals', 'accessories', 'offer-zone', 'boys', 'girls', 'toddlers', 'fabric'];
  slugs.forEach(slug => {
    for (let i = 0; i < 8; i++) {
      ids.push({ id: `${slug}-${i}` });
    }
  });
  ids.push({ id: 'na1' }, { id: 'na2' }, { id: 'na3' });

  // Fetch all real products from Firebase
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    snapshot.forEach(doc => {
      // Don't add duplicates if they somehow overlap
      if (!ids.find(i => i.id === doc.id)) {
        ids.push({ id: doc.id });
      }
    });
  } catch (error) {
    console.error("Error fetching products during build:", error);
  }

  return ids;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientPage id={id} />;
}
