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
  
  const getStandardSizes = (category: string) => {
    if (category === 'boys' || category === 'girls') {
      return ['18-24 Month', '2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years', '6-7 Years'];
    }
    if (category === 'fabric') {
      return ['10m', '20m', '30m', '40m', '50m', '60m', '70m', '80m', '90m', '100m'];
    }
    return ['S', 'M', 'L', 'XL', 'XXL'];
  };

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    offerPrice: '',
    description: '',
    category: 'boys',
    sizes: getStandardSizes('boys')
  });

  const [allSizes, setAllSizes] = useState<string[]>(getStandardSizes('boys'));
  const [customSize, setCustomSize] = useState('');
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({});

  const handleSizePriceChange = (size: string, price: string) => {
    setSizePrices(prev => ({ ...prev, [size]: price }));
  };

  const handleAddCustomSize = (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmed = customSize.trim();
    if (trimmed && !allSizes.includes(trimmed)) {
      setAllSizes([...allSizes, trimmed]);
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, trimmed] }));
      setCustomSize('');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const standardSizesForCategory = getStandardSizes(data.category);
          setFormData({
            name: data.name,
            price: data.price ? data.price.replace('₹ ', '') : '',
            offerPrice: data.offerPrice ? data.offerPrice.replace('₹ ', '') : '',
            description: data.description || '',
            category: data.category,
            sizes: data.sizes || standardSizesForCategory
          });
          
          let fetchedAllSizes = data.allSizes;
          if (!fetchedAllSizes) {
            const currentSizes = data.sizes || [];
            fetchedAllSizes = Array.from(new Set([...standardSizesForCategory, ...currentSizes]));
          }
          setAllSizes(fetchedAllSizes);
          setSizePrices(data.sizePrices || {});
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setFetching(false);
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const oldStandard = getStandardSizes(formData.category);
      const newStandard = getStandardSizes(value);
      
      const customAdded = allSizes.filter(s => !oldStandard.includes(s));
      const customSelected = formData.sizes.filter(s => !oldStandard.includes(s));
      
      setAllSizes([...newStandard, ...customAdded]);
      setFormData(prev => ({ 
        ...prev, 
        category: value, 
        sizes: [...newStandard, ...customSelected] 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
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
      if (!formData.name || (formData.category !== 'fabric' && !formData.price)) {
        alert("Please fill all required fields.");
        setLoading(false);
        return;
      }

      const normalizedSizePrices: Record<string, string> = {};
      if (formData.category === 'fabric') {
        Object.entries(sizePrices).forEach(([sz, p]) => {
          if (p.trim()) {
            normalizedSizePrices[sz] = p.startsWith('₹') ? p : `₹ ${p}`;
          }
        });
      }

      let updateData: any = {
        name: formData.name,
        price: formData.category !== 'fabric' ? (formData.price.startsWith('₹') ? formData.price : `₹ ${formData.price}`) : '',
        offerPrice: formData.category !== 'fabric' && formData.offerPrice ? (formData.offerPrice.startsWith('₹') ? formData.offerPrice : `₹ ${formData.offerPrice}`) : '',
        description: formData.description,
        sizes: formData.sizes,
        allSizes: allSizes,
        sizePrices: normalizedSizePrices,
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
          <label className="form-label">Product Description</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input" 
            placeholder="Experience the ultimate in comfort and style..." 
            rows={4}
            required
          />
        </div>

        {formData.category !== 'fabric' && (
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Actual Price</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Offer Price (Optional)</label>
              <input type="text" name="offerPrice" value={formData.offerPrice} onChange={handleChange} className="form-input" />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Available Sizes</label>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem', marginBottom: '1rem' }}>
            {allSizes.map(sz => (
              <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.sizes.includes(sz)} 
                    onChange={() => handleSizeToggle(sz)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  {sz}
                </label>
                {formData.category === 'fabric' && formData.sizes.includes(sz) && (
                  <input 
                    type="text" 
                    value={sizePrices[sz] || ''}
                    onChange={(e) => handleSizePriceChange(sz, e.target.value)}
                    placeholder="Price ₹"
                    className="form-input"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem', width: '80px', height: '30px' }}
                    required
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              className="form-input" 
              placeholder="Add custom size (e.g. 32, 6 Months)" 
              style={{ maxWidth: '300px' }}
            />
            <button onClick={handleAddCustomSize} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>+</button>
          </div>
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
            <option value="boys">Boys Fashion</option>
            <option value="girls">Girls Fashion</option>
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
