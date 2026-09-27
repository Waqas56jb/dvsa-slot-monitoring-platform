import { useState } from 'react';
import { cn } from '@/utils/cn';
import { initials } from '@/utils/format';

const palette = [
  'bg-[#e8edff] text-[#2238c4]',
  'bg-[#e6f6ef] text-[#067a55]',
  'bg-[#fdf0e1] text-[#9a5208]',
  'bg-[#f3e9fd] text-[#6b2bb3]',
  'bg-[#e4f4fb] text-[#0a6690]',
  'bg-[#fde8ee] text-[#a8264e]',
];

function hashIndex(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % palette.length;
}

const sizes = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-20 text-2xl',
};

/** Photo avatar with a deterministic coloured-initials fallback. */
export function Avatar({ name = '', src, size = 'md', className, status }) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full font-semibold ring-2 ring-surface',
          sizes[size],
          !showImg && palette[hashIndex(name)],
        )}
        aria-hidden={name ? undefined : true}
        title={name || undefined}
      >
        {showImg ? <img src={src} alt={name} className="size-full object-cover" onError={() => setFailed(true)} /> : initials(name) || '?'}
      </span>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block size-2.5 rounded-full ring-2 ring-surface',
            status === 'online' ? 'bg-success' : status === 'busy' ? 'bg-warning' : 'bg-subtle',
          )}
        />
      )}
    </span>
  );
}

export function AvatarGroup({ names = [], max = 4, size = 'sm' }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {extra > 0 && (
        <span className={cn('inline-flex items-center justify-center rounded-full bg-surface-sunken font-semibold text-muted ring-2 ring-surface', sizes[size])}>
          +{extra}
        </span>
      )}
    </div>
  );
}
