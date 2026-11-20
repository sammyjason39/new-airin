export function DesignFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" fill="#60a5fa" r="4.2" />
      <circle cx="16" cy="6.5" fill="#93c5fd" r="4" />
      <circle cx="16" cy="25.5" fill="#93c5fd" r="4" />
      <circle cx="6.5" cy="16" fill="#93c5fd" r="4" />
      <circle cx="25.5" cy="16" fill="#93c5fd" r="4" />
      <circle cx="9.2" cy="9.2" fill="#bfdbfe" r="3.4" />
      <circle cx="22.8" cy="9.2" fill="#bfdbfe" r="3.4" />
      <circle cx="9.2" cy="22.8" fill="#bfdbfe" r="3.4" />
      <circle cx="22.8" cy="22.8" fill="#bfdbfe" r="3.4" />
      <circle cx="16" cy="16" fill="#eff6ff" r="2.1" />
    </svg>
  );
}

export function DesignMascot({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 120 140"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#1f2937" height="54" rx="8" width="46" x="37" y="62" />
      <rect fill="#111827" height="18" rx="4" width="34" x="43" y="78" />
      <rect fill="#f9a8d4" height="28" rx="10" width="40" x="40" y="34" />
      <rect fill="#f472b6" height="10" rx="4" width="46" x="37" y="28" />
      <circle cx="52" cy="48" fill="#111827" r="3" />
      <circle cx="68" cy="48" fill="#111827" r="3" />
      <rect fill="#e5e7eb" height="8" rx="2" width="22" x="49" y="54" />
      <rect fill="#d1d5db" height="26" rx="4" width="22" x="72" y="70" />
      <rect fill="#9ca3af" height="4" rx="1" width="14" x="76" y="76" />
      <rect fill="#9ca3af" height="4" rx="1" width="14" x="76" y="83" />
      <rect fill="#374151" height="16" rx="4" width="14" x="42" y="112" />
      <rect fill="#374151" height="16" rx="4" width="14" x="64" y="112" />
      <rect fill="#60a5fa" height="8" rx="2" width="10" x="79" y="92" />
    </svg>
  );
}
