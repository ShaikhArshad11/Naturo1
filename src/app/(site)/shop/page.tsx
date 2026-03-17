import Shop from '@/pages/Shop';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <Shop />
    </Suspense>
  );
}
