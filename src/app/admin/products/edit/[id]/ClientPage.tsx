'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

export default function ClientPage({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'children'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name,
            price: data.price.replace('₹ ', ''),
            category: data.category
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setFetching(false);
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert("You can only upload a maximum of 5 images.");
        setImageFiles(files.slice(0, 5));
      } else {
        setImageFiles(files);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.price) {
        alert("Please fill all required fields.");
        setLoading(false);
        return;
      }

      let updateData: any = {
        name: formData.name,
        price: formData.price.startsWith('₹') ? formData.price : `₹ ${formData.price}`,
        category: formData.category,
        updatedAt: new Date().toISOString()
      };

      if (imageFiles.length > 0) {
        const downloadURLs: string[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];

          if (!file.type.startsWith('image/')) {
            alert(`File "${file.name}" is not an image! Only image files are allowed.`);
            setLoading(false);
            return;
          }
          
          const compressionOptions = {
            maxSizeMB: 0.09,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            initialQuality: 0.6
          };
          const compressedFile = await imageCompression(file, compressionOptions);

          const storageRef = ref(storage, `products/${Date.now()}_${compressedFile.name}`);
          const uploadTask = uploadBytesResumable(storageRef, compressedFile);

          await new Promise<void>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(((i * 100) + progress) / imageFiles.length);
              },
              (error) => reject(error),
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                downloadURLs.push(downloadURL);
                resolve();
              }
            );
          });
        }
        
        updateData.image = downloadURLs[0];
        updateData.images = downloadURLs;
      }

      await updateDoc(doc(db, 'products', id), updateData);
      router.push('/admin/products');

    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
    setLoading(false);
  };

  if (fetching) return <div style={{ padding: '2rem' }}>Loading product details...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Edit Product</h1>
        <Link href="/admin/products" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">Price</label>
          <input type="text" name="price" value={formData.price} onChange={handleChange} className="form-input" required />
        </div>

        <div className="form-group">
          <label className="form-label">Update Images (Max 5) - Leave empty to keep existing images</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="form-input" />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginTop: '0.5rem', width: '100%', background: '#eee', borderRadius: '4px' }}>
              <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '8px', borderRadius: '4px' }}></div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select name="category" value={formData.category} onChange={handleChange} className="form-input" required>
            <option value="children">Children's Fashion</option>
            <option value="mens">Men's Fashion</option>
            <option value="womens">Women's Fashion</option>
            <option value="fabric">Premium Fabrics</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? (uploadProgress > 0 && uploadProgress < 100 ? `Uploading (${Math.round(uploadProgress)}%)` : 'Saving Changes...') : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
