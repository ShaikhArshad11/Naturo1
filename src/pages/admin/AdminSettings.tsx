'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Announcement = { enabled: boolean; text: string };

export default function AdminSettings() {
  const [announcement, setAnnouncement] = useState<Announcement>({ enabled: false, text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch('/api/admin/site-settings/announcement', { cache: 'no-store' });
    if (!res.ok) throw new Error('Request failed');
    const data = (await res.json()) as Partial<Announcement>;
    setAnnouncement({ enabled: Boolean(data.enabled), text: typeof data.text === 'string' ? data.text : '' });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/site-settings/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      if (!res.ok) throw new Error('Request failed');
      toast.success('Announcement updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-serif text-foreground mb-6">Settings</h1>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif text-foreground">Announcement Bar</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This message appears at the very top of the website above the navbar.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={announcement.enabled}
              onChange={(e) => setAnnouncement((p) => ({ ...p, enabled: e.target.checked }))}
              className="accent-primary"
              disabled={loading}
            />
            <span className="text-foreground">Enabled</span>
          </label>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-foreground mb-2">Text</label>
          <textarea
            value={announcement.text}
            onChange={(e) => setAnnouncement((p) => ({ ...p, text: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="e.g. Free Shipping On Orders Above ₹1499/-"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">Tip: keep it short (1 line).</p>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving}
              className="btn-primary px-6 py-2.5 text-sm rounded-xl disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
