import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Product } from '@/types';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, Upload } from 'lucide-react';

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  name: '', description: '', price: 0, originalPrice: 0, category: '', image: '',
  benefits: [''], ingredients: [''], usage: '', rating: 4.5, reviews: 0, inStock: true, featured: false, bestSeller: false,
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products', { cache: 'no-store' });
  if (!res.ok) throw new Error('Request failed');
  const data = (await res.json()) as { products?: Product[] };
  return data.products ?? [];
}

async function createProduct(product: Product): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error('Request failed');
  const data = (await res.json()) as { product?: Product };
  if (!data.product) throw new Error('Missing response');
  return data.product;
}

async function patchProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Request failed');
  const data = (await res.json()) as { product?: Product };
  if (!data.product) throw new Error('Missing response');
  return data.product;
}

async function removeProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Request failed');
}

async function getCloudinarySignature(folder = 'products') {
  const res = await fetch('/api/cloudinary/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  if (!res.ok) throw new Error('Request failed');
  return (await res.json()) as {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    folder: string;
  };
}

async function uploadToCloudinary(file: File, folder = 'products'): Promise<string> {
  const sig = await getCloudinarySignature(folder);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) throw new Error('Upload failed');
  const uploadData = (await uploadRes.json()) as { secure_url?: string };
  if (!uploadData.secure_url) throw new Error('Upload response missing url');
  return uploadData.secure_url;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Partial<Product> & { benefits: string[]; ingredients: string[]; image2?: string }>(emptyProduct);

  const refresh = async () => {
    const list = await fetchProducts();
    setProducts(list);
  };

  useEffect(() => {
    refresh().catch(() => {
      toast.error('Failed to load products');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setForm({ ...emptyProduct, benefits: [''], ingredients: [''] });
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (p: Product) => {
    setForm({ ...p });
    setEditing(p);
    setIsNew(false);
  };

  const close = () => { setEditing(null); setIsNew(false); };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'image' | 'image2') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    try {
      const url = await uploadToCloudinary(file, 'products');
      setForm({ ...form, [field]: url });
    } catch {
      const dataUrl = await fileToDataUrl(file);
      setForm({ ...form, [field]: dataUrl });
      toast.error('Image upload failed. Using local preview only. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.price) { toast.error('Name and price are required'); return; }
    if (!form.category?.trim()) { toast.error('Category is required'); return; }
    const benefits = (form.benefits || []).filter((b) => b.trim());
    const ingredients = (form.ingredients || []).filter((i) => i.trim());

    try {
      if (!form.image?.trim()) {
        toast.error('Primary image is required');
        return;
      }

      if (isNew) {
        const product: Product = { ...(form as Product), id: crypto.randomUUID(), benefits, ingredients, createdAt: new Date().toISOString() };
        await createProduct(product);
        toast.success('Product added');
      } else if (editing) {
        await patchProduct(editing.id, { ...(form as Product), benefits, ingredients });
        toast.success('Product updated');
      }

      await refresh();
      close();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await removeProduct(id);
      await refresh();
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const showForm = isNew || editing;

  const previewProduct: Product = {
    id: editing?.id ?? 'preview',
    name: form.name ?? '',
    description: form.description ?? '',
    price: typeof form.price === 'number' ? form.price : 0,
    originalPrice: typeof form.originalPrice === 'number' && form.originalPrice > 0 ? form.originalPrice : undefined,
    category: form.category ?? '',
    image: form.image ?? '',
    image2: form.image2,
    benefits: form.benefits ?? [],
    ingredients: form.ingredients ?? [],
    usage: form.usage ?? '',
    rating: typeof form.rating === 'number' ? form.rating : 4.5,
    reviews: typeof form.reviews === 'number' ? form.reviews : 0,
    inStock: typeof form.inStock === 'boolean' ? form.inStock : true,
    featured: typeof form.featured === 'boolean' ? form.featured : false,
    bestSeller: typeof form.bestSeller === 'boolean' ? form.bestSeller : false,
    createdAt: editing?.createdAt ?? new Date().toISOString(),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-foreground">Products</h1>
        <button onClick={openNew} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl text-foreground">{isNew ? 'New Product' : 'Edit Product'}</h3>
            <button onClick={close} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Herbal Juices, Natural Supplements..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Original Price (₹)</label>
              <input type="number" value={form.originalPrice || ''} onChange={e => setForm({ ...form, originalPrice: +e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            </div>

            {/* Image 1 Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Primary Image</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-background cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Choose file</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'image')} className="hidden" />
                </label>
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-border" />
                )}
              </div>
            </div>

            {/* Image 2 Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Secondary Image (optional)</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-background cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Choose file</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'image2')} className="hidden" />
                </label>
                {form.image2 && (
                  <img src={form.image2} alt="Preview 2" className="w-20 h-20 rounded-lg object-cover border border-border" />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Card Preview</label>
              <div className="max-w-xs">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-muted">
                    {previewProduct.image ? (
                      <img src={previewProduct.image} alt={previewProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                      {previewProduct.name || 'Product Name'}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {previewProduct.description || 'Product description will appear here.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">₹{previewProduct.price || 0}</span>
                        {previewProduct.originalPrice && (
                          <span className="text-muted-foreground text-sm line-through">₹{previewProduct.originalPrice}</span>
                        )}
                      </div>
                      <div className="btn-primary px-4 py-2 text-sm select-none">Add to Cart</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Benefits (one per line)</label>
              <textarea value={(form.benefits || []).join('\n')} onChange={e => setForm({ ...form, benefits: e.target.value.split('\n') })} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Ingredients (one per line)</label>
              <textarea value={(form.ingredients || []).join('\n')} onChange={e => setForm({ ...form, ingredients: e.target.value.split('\n') })} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Usage Instructions</label>
              <input value={form.usage} onChange={e => setForm({ ...form, usage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
            </div>
            <div className="flex gap-6 items-center md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} className="accent-primary" /> In Stock
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-primary" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.bestSeller} onChange={e => setForm({ ...form, bestSeller: e.target.checked })} className="accent-primary" /> Best Seller
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="btn-primary px-6 py-2 text-sm">Save</button>
            <button onClick={close} className="btn-outline-primary px-6 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-foreground">Product</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    <span className="text-foreground font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 text-foreground">₹{p.price}</td>
                <td className="px-4 py-3">
                  <span className={p.inStock ? 'text-primary' : 'text-destructive'}>{p.inStock ? 'In Stock' : 'Out'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-primary hover:text-primary/80"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
