'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

// Maps each theme name → CSS custom property overrides applied to :root
// Each theme overrides every CSS custom property that drives color in the UI
const THEME_VARS: Record<string, Record<string, string>> = {
  default: {
    '--primary':      '#7C3BFF',
    '--primary-2':    '#9B6BFF',
    '--primary-dark': '#5B21B6',
    '--accent':       '#0DD9B8',
    '--primary-shadow': 'rgba(124,59,255,0.35)',
    '--primary-glow':   'rgba(124,59,255,0.18)',
  },
  ocean: {
    '--primary':      '#0EA5E9',
    '--primary-2':    '#38BDF8',
    '--primary-dark': '#0369A1',
    '--accent':       '#14B8A6',
    '--primary-shadow': 'rgba(14,165,233,0.35)',
    '--primary-glow':   'rgba(14,165,233,0.18)',
  },
  forest: {
    '--primary':      '#16A34A',
    '--primary-2':    '#22C55E',
    '--primary-dark': '#14532D',
    '--accent':       '#84CC16',
    '--primary-shadow': 'rgba(22,163,74,0.35)',
    '--primary-glow':   'rgba(22,163,74,0.18)',
  },
  sunset: {
    '--primary':      '#F97316',
    '--primary-2':    '#FB923C',
    '--primary-dark': '#C2410C',
    '--accent':       '#EC4899',
    '--primary-shadow': 'rgba(249,115,22,0.35)',
    '--primary-glow':   'rgba(249,115,22,0.18)',
  },
}

export function ThemeApplicator() {
  const theme = useAppStore((s) => s.settings.theme)

  useEffect(() => {
    const vars = THEME_VARS[theme] ?? THEME_VARS.default
    const root = document.documentElement
    Object.entries(vars).forEach(([prop, val]) => root.style.setProperty(prop, val))
  }, [theme])

  return null
}
