'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'children'
  });

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
      if (!formData.name || !formData.price || imageFiles.length === 0) {
        alert("Please fill all fields and select at least one image.");
        setLoading(false);
        return;
      }

      const downloadURLs: string[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        // Strict client-side check to ensure ONLY images are allowed
        if (!file.type.startsWith('image/')) {
          alert(`File "${file.name}" is not an image! Only image files are allowed.`);
          setLoading(false);
          return;
        }
        
        // 1. Aggressive Compression (Targeting ~70-100KB)
        const compressionOptions = {
          maxSizeMB: 0.09, // Compress to strictly under 90-100KB
          maxWidthOrHeight: 800, // Reduced resolution to ensure small file size
          useWebWorker: true,
          initialQuality: 0.6 // Aggressive compression quality
        };
        const compressedFile = await imageCompression(file, compressionOptions);

        // 2. Upload to Firebase Storage
        const storageRef = ref(storage, `products/${Date.now()}_${compressedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(((i * 100) + progress) / imageFiles.length);
            },
            (error) => {
              console.error("Upload failed", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              downloadURLs.push(downloadURL);
              resolve();
            }
          );
        });
      }

      // 3. Save to Firestore
      await addDoc(collection(db, 'products'), {
        ...formData,
        image: downloadURLs[0], // Keep backward compatibility for single-image usages
        images: downloadURLs, // Save all up to 5 images
        price: formData.price.startsWith('₹') ? formData.price : `₹ ${formData.price}`,
        createdAt: new Date().toISOString()
      });
      
      router.push('/admin/products');

    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Check console.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Add New Product</h1>
        <Link href="/admin/products" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input" 
            placeholder="e.g. Graphic Tee" 
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Price</label>
          <input 
            type="text" 
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-input" 
            placeholder="e.g. 1599" 
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Product Images (Max 5)</label>
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="form-input" 
            required
          />
          <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
            Images will be automatically compressed to save storage space.
          </small>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginTop: '0.5rem', width: '100%', background: '#eee', borderRadius: '4px' }}>
              <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '8px', borderRadius: '4px' }}></div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="children">Children's Fashion</option>
            <option value="mens">Men's Fashion</option>
            <option value="womens">Women's Fashion</option>
            <option value="fabric">Premium Fabrics</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? (uploadProgress > 0 && uploadProgress < 100 ? `Compressing & Uploading (${Math.round(uploadProgress)}%)` : 'Processing...') : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
