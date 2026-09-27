import { useState } from 'react';
import { cn } from '@/utils/cn';
import { img, imgAlt, imgSrcSet } from '@/data/images';

/**
 * Remote image with lazy loading, blur-in and a graceful gradient fallback
 * if the CDN is unreachable. Pass `image` (a key from data/images) or `src`.
 */
export function SmartImage({ image, src, alt, className, imgClassName, sizes = '100vw', priority = false, width = 1600, overlay }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = src || img(image, width);
  const srcSet = image && !src ? imgSrcSet(image) : undefined;

  return (
    <div
      className={cn(
        // Default to `relative` unless the caller positions the wrapper itself.
        !/\b(absolute|fixed|sticky)\b/.test(className || '') && 'relative',
        'overflow-hidden bg-gradient-to-br from-night via-[#1a2748] to-[#24366b]',
        className,
      )}
    >
      {!failed && (
        <img
          src={url}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt ?? imgAlt(image)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('size-full object-cover transition-[opacity,filter,transform] duration-700', loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm scale-[1.02]', imgClassName)}
        />
      )}
      {overlay}
    </div>
  );
}
