/** Horizontal rule with a centred label ("or"). */
export function Divider({ label = 'or' }) {
  return (
    <div className="my-6 flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
