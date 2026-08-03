import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

export function generateSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except space and hyphen
    .replace(/[\s_-]+/g, '-') // replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // trim hyphens from ends
}

export async function getUniqueSlug(name: string, docId?: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug || 'product';
  let counter = 1;
  let exists = true;
  
  while (exists) {
    const q = query(
      collection(db, 'products'),
      where('slug', '==', slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      exists = false;
    } else {
      // If the found document matches the current product we are editing, we can reuse its slug
      if (docId && snap.docs[0].id === docId) {
        exists = false;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
  }
  
  return slug;
}
