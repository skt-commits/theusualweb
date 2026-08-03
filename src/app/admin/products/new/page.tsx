'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';
import { getUniqueSlug } from '@/lib/slug';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingSubcategories, setExistingSubcategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const q = collection(db, 'products');
        const querySnapshot = await getDocs(q);
        const subcategories = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.subcategory) {
            subcategories.add(data.subcategory);
          }
        });
        setExistingSubcategories(Array.from(subcategories));
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);
  
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
    subcategory: '',
    stock: '',
    sizes: getStandardSizes('boys')
  });

  const [inStock, setInStock] = useState(true);
  const [colors, setColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('#000000');

  const [colorOptions, setColorOptions] = useState<{name: string, price: string, offerPrice: string, imageFile: File | null}[]>([]);

  const addColorOption = (e: React.MouseEvent) => {
    e.preventDefault();
    setColorOptions([...colorOptions, { name: '', price: '', offerPrice: '', imageFile: null }]);
  };

  const updateColorOption = (index: number, field: string, value: any) => {
    const newOpts = [...colorOptions];
    newOpts[index] = { ...newOpts[index], [field]: value };
    setColorOptions(newOpts);
  };

  const removeColorOption = (index: number) => {
    setColorOptions(colorOptions.filter((_, i) => i !== index));
  };

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

  const handleAddColor = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!colors.includes(customColor)) {
      setColors([...colors, customColor]);
    }
  };

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

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
    } else if (name === 'subcategorySelect') {
      if (value !== 'custom') {
        setFormData(prev => ({ ...prev, subcategory: value }));
      }
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
      if (!formData.name || !formData.price || imageFiles.length === 0) {
        alert("Please fill all required fields and select at least one image.");
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
        
        // 2. Upload raw file to Firebase Storage to keep 100% original quality (no compression)
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);


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

      const finalColorOptions: any[] = [];
      for (let i = 0; i < colorOptions.length; i++) {
        const opt = colorOptions[i];
        if (!opt.name) continue;
        let imgUrl = "";
        if (opt.imageFile) {
          const storageRef = ref(storage, `products/color_${Date.now()}_${opt.imageFile.name}`);
          const uploadTask = uploadBytesResumable(storageRef, opt.imageFile);
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed', null, reject, async () => {
              imgUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            });
          });
        }
        finalColorOptions.push({
          name: opt.name,
          price: opt.price ? (opt.price.startsWith('₹') ? opt.price : `₹ ${opt.price}`) : '',
          offerPrice: opt.offerPrice ? (opt.offerPrice.startsWith('₹') ? opt.offerPrice : `₹ ${opt.offerPrice}`) : '',
          image: imgUrl
        });
      }

      const normalizedSizePrices: Record<string, string> = {};
      Object.entries(sizePrices).forEach(([sz, p]) => {
        if (p.trim()) {
          normalizedSizePrices[sz] = p.startsWith('₹') ? p : `₹ ${p}`;
        }
      });

      const slug = await getUniqueSlug(formData.name);

      // 3. Save to Firestore
      await addDoc(collection(db, 'products'), {
        ...formData,
        slug: slug,
        allSizes: allSizes,
        sizePrices: normalizedSizePrices,
        inStock: inStock,
        colors: colors,
        colorOptions: finalColorOptions,
        image: downloadURLs[0], // Keep backward compatibility for single-image usages
        images: downloadURLs, // Save all up to 5 images
        price: formData.price.startsWith('₹') ? formData.price : `₹ ${formData.price}`,
        offerPrice: formData.offerPrice ? (formData.offerPrice.startsWith('₹') ? formData.offerPrice : `₹ ${formData.offerPrice}`) : '',
        subcategory: formData.subcategory,
        stock: Number(formData.stock) || 0,
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

        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Actual Price</label>
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
            <div>
              <label className="form-label">Offer Price (Optional)</label>
              <input 
                type="text" 
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleChange}
                className="form-input" 
                placeholder="e.g. 1299" 
              />
            </div>
        </div>

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
                {formData.sizes.includes(sz) && (
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
          <label className="form-label">Available Colors</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {colors.map(color => (
              <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color, border: '1px solid #ccc' }} />
                <span style={{ fontSize: '0.8rem' }}>{color}</span>
                <button type="button" onClick={() => handleRemoveColor(color)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>&times;</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="color" 
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              style={{ width: '50px', height: '40px', padding: '0', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button onClick={handleAddColor} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Add Color</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Color Variants (with Images/Prices)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            {colorOptions.map((opt, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Variant #{idx + 1}</strong>
                  <button type="button" onClick={() => removeColorOption(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Color Name (e.g. Green)" className="form-input" value={opt.name} onChange={(e) => updateColorOption(idx, 'name', e.target.value)} required />
                  <input type="file" accept="image/*" className="form-input" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) updateColorOption(idx, 'imageFile', e.target.files[0]);
                  }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Actual Price (e.g. 999)" className="form-input" value={opt.price} onChange={(e) => updateColorOption(idx, 'price', e.target.value)} />
                  <input type="text" placeholder="Offer Price (e.g. 301)" className="form-input" value={opt.offerPrice} onChange={(e) => updateColorOption(idx, 'offerPrice', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={addColorOption} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>+ Add Color Variant</button>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="inStock"
            checked={inStock} 
            onChange={(e) => setInStock(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label htmlFor="inStock" className="form-label" style={{ marginBottom: 0, cursor: 'pointer', color: inStock ? '#166534' : '#ef4444' }}>
            {inStock ? 'Product is IN STOCK' : 'Product is OUT OF STOCK'}
          </label>
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
            <option value="boys">Boys Fashion</option>
            <option value="girls">Girls Fashion</option>
            <option value="mens">Men's Fashion</option>
            <option value="womens">Women's Fashion</option>
            <option value="fabric">Premium Fabrics</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Subcategory</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {existingSubcategories.length > 0 && (
                <select
                  name="subcategorySelect"
                  className="form-input"
                  onChange={handleChange}
                  defaultValue=""
                >
                  <option value="" disabled>Select existing...</option>
                  {existingSubcategories.map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                  <option value="custom">-- Enter New Subcategory --</option>
                </select>
              )}
              <input 
                type="text" 
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="form-input" 
                placeholder={existingSubcategories.length > 0 ? "Or type new subcategory" : "e.g. shirt, pant"} 
                required
              />
            </div>
          </div>
          <div>
            <label className="form-label">Total Stock Available</label>
            <input 
              type="number" 
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-input" 
              placeholder="e.g. 50" 
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? (uploadProgress > 0 && uploadProgress < 100 ? `Compressing & Uploading (${Math.round(uploadProgress)}%)` : 'Processing...') : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
