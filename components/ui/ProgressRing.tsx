interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  color = '#7c3aed',
  bgColor = '#ede9fe',
  children,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
