import { useMemo } from 'react'

const THEMES = {
  quoteflow: {
    light: {
      primary: '#2563EB',
      accent: '#047857',
      danger: '#B91C1C',
      gold: '#B45309',
      colors: ['#2563EB', '#047857', '#B45309', '#3B82F6', '#059669'],
      bg: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
      grid: '#E2E8F0',
      tooltipBg: '#1E293B',
      tooltipText: '#F8FAFC',
      tooltipBorder: '#334155',
    },
    dark: {
      primary: '#60A5FA',
      accent: '#34D399',
      danger: '#F87171',
      gold: '#FBBF24',
      colors: ['#60A5FA', '#34D399', '#FBBF24', '#93C5FD', '#6EE7B7'],
      bg: '#1E293B',
      text: '#FFFFFF',
      muted: '#CBD5E1',
      grid: '#1E293B',
      tooltipBg: '#0F172A',
      tooltipText: '#F8FAFC',
      tooltipBorder: '#475569',
    },
  },
}

export function useChartTheme(demo, isDark) {
  return useMemo(() => {
    const theme = THEMES[demo] || THEMES.quoteflow
    return isDark ? theme.dark : theme.light
  }, [demo, isDark])
}
