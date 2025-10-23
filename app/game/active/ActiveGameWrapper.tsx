'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

export default function ActiveGameWrapper({ children }: { children: (isPracticeMode: boolean) => ReactNode }) {
  const searchParams = useSearchParams();
  const isPracticeMode = searchParams?.get('mode') === 'practice';
  
  return <>{children(isPracticeMode)}</>;
}
