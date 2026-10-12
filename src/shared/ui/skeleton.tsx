import * as React from 'react';
import { cn } from '@/shared/lib/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shimmer rounded-xl', className)} {...props} />;
}

export { Skeleton };
