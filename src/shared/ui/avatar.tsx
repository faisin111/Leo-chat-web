import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback: React.ReactNode;
  imageClassName?: string;
}

export function Avatar({
  src,
  alt = '',
  fallback,
  className,
  imageClassName,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full select-none',
        className,
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className={cn('h-full w-full object-cover', imageClassName)}
          onError={() => setHasError(true)}
        />
      ) : (
        fallback
      )}
    </div>
  );
}
