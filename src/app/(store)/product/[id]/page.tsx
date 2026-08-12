import ClientPage from './ClientPage';
import { collection, getDocs, doc, getDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Metadata } from 'next';

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
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.slug) {
        if (!ids.find(i => i.id === data.slug)) {
          ids.push({ id: data.slug });
        }
      }
      if (!ids.find(i => i.id === docSnap.id)) {
        ids.push({ id: docSnap.id });
      }
    });
  } catch (error) {
    console.error("Error fetching products during build:", error);
  }

  return ids;
}

// Helper to fetch product data on the server for SEO tags
async function getProductServerSide(id: string) {
  let actualId = id;
  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '18-24 Month', '2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years', '6-7 Years', '10m', '20m', '30m', '40m', '50m', '60m', '70m', '80m', '90m', '100m'];
  for (const s of sizes) {
    if (id.endsWith(`-${s}`)) {
      actualId = id.substring(0, id.length - s.length - 1);
      break;
    }
  }

  if (actualId === 'na1') return { id: actualId, name: "Sparkle Princess Dress", price: "₹ 1,299", image: "/images/girls_vibrant.png", description: "A beautifully crafted dress for your little princess.", category: "girls" };
  if (actualId === 'na2') return { id: actualId, name: "Urban Streetwear Jacket", price: "₹ 1,499", image: "/images/boys_vibrant.png", description: "Keep them warm and stylish with this modern jacket.", category: "boys" };
  if (actualId === 'na3') return { id: actualId, name: "Cozy Bear Onesie", price: "₹ 899", image: "/images/toddlers_vibrant.png", description: "The softest, most adorable onesie for your toddler.", category: "toddlers" };

  try {
    const q = query(collection(db, 'products'), where('slug', '==', actualId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as any;
    }
    const docRef = doc(db, 'products', actualId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    }
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductServerSide(id);

  if (!product) {
    return { title: 'Product Not Found | The Usuals' };
  }

  const title = `${product.name} | The Usuals`;
  const description = product.description || `Buy ${product.name} at the best price from The Usuals.`;
  const image = product.images?.[0] || product.image || '/logo.jpeg';
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://theusuals.in'}/product/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductServerSide(id);

  let jsonLd = null;
  if (product) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://theusuals.in';
    const image = product.images?.[0] || product.image || '/logo.jpeg';
    const priceStr = product.price ? String(product.price).replace(/[^0-9.]/g, '') : '0';
    
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || `Buy ${product.name} from The Usuals.`,
      image: [image.startsWith('http') ? image : `${baseUrl}${image}`],
      sku: product.id,
      brand: { '@type': 'Brand', name: 'The Usuals' },
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/product/${id}`,
        priceCurrency: 'INR',
        price: priceStr || '0',
        availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'The Usuals' }
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ClientPage id={id} />
    </>
  );
}
