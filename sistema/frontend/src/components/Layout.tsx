import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main style={{ flex: 1, padding: '40px 20px', background: '#f5f5f5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
        {children}
      </div>
    </main>
  );
}
