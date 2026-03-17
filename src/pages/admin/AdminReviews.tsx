import { useEffect, useState } from 'react';
import type { Review } from '@/types';
import { Star, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

async function fetchReviews(): Promise<Review[]> {
  const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
  if (!res.ok) throw new Error('Request failed');
  const data = (await res.json()) as { reviews?: Review[] };
  return data.reviews ?? [];
}

async function approveReview(id: string): Promise<void> {
  const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Request failed');
}

async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Request failed');
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const refresh = async () => {
    const list = await fetchReviews();
    setReviews(list);
  };

  useEffect(() => {
    refresh().catch(() => {
      toast.error('Failed to load reviews');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveReview(id);
      await refresh();
      toast.success('Review approved');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
      await refresh();
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const pending = reviews.filter(r => !r.approved);
  const approved = reviews.filter(r => r.approved);

  return (
    <div>
      <h1 className="text-2xl font-serif text-foreground mb-6">Reviews</h1>

      <h2 className="text-lg font-serif text-foreground mb-3">Pending Approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-8">No pending reviews.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {pending.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-primary/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.email}</span>
                    <div className="flex gap-0.5 ml-2">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{r.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleApprove(r.id)} className="text-primary hover:text-primary/80" title="Approve">
                    <Check className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive/80" title="Delete">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-serif text-foreground mb-3">Approved ({approved.length})</h2>
      {approved.length === 0 ? (
        <p className="text-muted-foreground text-sm">No approved reviews.</p>
      ) : (
        <div className="space-y-3">
          {approved.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{r.name}</span>
                    <div className="flex gap-0.5 ml-2">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-gold text-gold" />)}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{r.text}</p>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive/80 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
