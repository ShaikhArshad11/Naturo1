import { useEffect, useState } from 'react';
import { ContactMessage } from '@/types';
import { Mail, MailOpen } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch('/api/admin/contact');
    if (!res.ok) {
      throw new Error('Request failed');
    }
    const data = (await res.json()) as { messages: ContactMessage[] };
    setMessages(data.messages);
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await refresh();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleRead = async (id: string) => {
    const res = await fetch(`/api/admin/contact/${id}/read`, { method: 'PATCH' });
    if (!res.ok) {
      return;
    }
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, read: true } : m)));
  };

  const sorted = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <h1 className="text-2xl font-serif text-foreground mb-6">Messages ({messages.length})</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map(msg => (
            <div key={msg.id} className={`bg-card rounded-lg border p-4 ${msg.read ? 'border-border' : 'border-primary'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {msg.read ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}
                    <span className="font-medium text-foreground text-sm">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.email}</span>
                    {msg.phone && <span className="text-xs text-muted-foreground">· {msg.phone}</span>}
                  </div>
                  <p className="text-sm text-foreground mb-1">{msg.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                {!msg.read && (
                  <button onClick={() => handleRead(msg.id)} className="text-xs text-primary hover:text-primary/80 font-medium">Mark Read</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
