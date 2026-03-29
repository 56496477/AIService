import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: 'sans-serif', margin: 0, padding: '16px' }}>{children}</body>
    </html>
  );
}
