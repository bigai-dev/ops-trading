import { Card, CardContent } from '@/components/ui/card'
import { useCountUp } from '@/lib/hooks/use-count-up'

export function KpiCard({ title, value, prefix = '', suffix = '', icon, color = 'primary', trend, hero = false }) {
  const animatedValue = useCountUp(value)

  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', heroBg: 'bg-primary' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', heroBg: 'bg-emerald-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', heroBg: 'bg-amber-600' },
    red: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', heroBg: 'bg-red-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', heroBg: 'bg-purple-600' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', heroBg: 'bg-blue-600' },
  }

  const c = colorMap[color] || colorMap.primary

  if (hero) {
    return (
      <Card className={`${c.heroBg} text-white border-0`} style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1)' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label" style={{ color: 'rgba(255,255,255,0.7)' }}>{title}</p>
              <p className="kpi-value mt-1" style={{ color: '#fff' }}>
                {prefix}{typeof value === 'number' ? animatedValue.toLocaleString() : value}{suffix}
              </p>
              {trend !== undefined && (
                <p className="text-sm mt-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 较昨日
                </p>
              )}
            </div>
            {icon && (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover">
      <CardContent className="flex items-center gap-4" style={{ padding: '20px' }}>
        {icon && (
          <div className={`kpi-icon ${c.bg} ${c.text}`}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="kpi-label truncate">{title}</p>
          <p className="kpi-value">
            {prefix}{typeof value === 'number' ? animatedValue.toLocaleString() : value}{suffix}
          </p>
          {trend !== undefined && (
            <p className={`text-xs mt-0.5 font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
