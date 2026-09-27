import { useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { userService } from '@/services';

/** Profile picture picker with preview. `value` is a data URL or ''. */
export function AvatarUpload({ name, value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setReading(true);
    setError('');
    try {
      onChange(await userService.readAvatar(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative w-fit">
        <Avatar name={name} src={value || undefined} size="xl" className="[&>span]:size-24 [&>span]:text-3xl" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-soft hover:text-ink"
          aria-label="Upload a new profile picture"
        >
          <Camera className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">Profile picture</p>
        <p className="mt-0.5 text-[13px] text-muted">JPG, PNG or WebP, up to 1 MB. Shown in the sidebar and account menu.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" leftIcon={Upload} onClick={() => inputRef.current?.click()} loading={reading}>
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button variant="danger-ghost" size="sm" leftIcon={Trash2} onClick={() => onChange('')}>
              Remove
            </Button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-[13px] text-danger-ink" role="alert">
            {error}
          </p>
        )}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={pick} />
      </div>
    </div>
  );
}
