// Tempo logo — a stylized "T" inside a rounded gradient square
// The horizontal stroke is slightly offset right to suggest forward motion

interface LogoProps {
  size?: number
  showName?: boolean
  className?: string
}

export function Logo({ size = 32, showName = false, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="40" height="40" rx="11" fill="url(#tempoGrad)" />
        {/* Vertical stroke */}
        <rect x="18" y="9" width="5" height="22" rx="2.5" fill="white" />
        {/* Horizontal stroke — slightly right-offset for dynamism */}
        <rect x="9" y="14" width="22" height="5" rx="2.5" fill="white" opacity="0.9" />
        {/* Small accent dot bottom-right */}
        <circle cx="30" cy="30" r="3" fill="url(#accentGrad)" />
        <defs>
          <linearGradient id="tempoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3BFF" />
            <stop offset="1" stopColor="#9B27AF" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="6" y2="6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0DD9B8" />
            <stop offset="1" stopColor="#06C5A6" />
          </linearGradient>
        </defs>
      </svg>
      {showName && (
        <span
          className="font-black text-xl tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text)' }}
        >
          Tempo
        </span>
      )}
    </div>
  )
}

export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="11" fill="url(#lmGrad)" />
      <rect x="18" y="9" width="5" height="22" rx="2.5" fill="white" />
      <rect x="9" y="14" width="22" height="5" rx="2.5" fill="white" opacity="0.9" />
      <circle cx="30" cy="30" r="3" fill="#0DD9B8" />
      <defs>
        <linearGradient id="lmGrad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#7C3BFF" />
          <stop offset="1" stopColor="#9B27AF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
