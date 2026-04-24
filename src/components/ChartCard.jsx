import { Card, CardContent } from '@/components/ui/card'

export function ChartCard({ title, icon, children, className = '' }) {
  return (
    <Card className={`card-hover ${className}`}>
      {title && (
        <div style={{ padding: '16px 20px 0' }}>
          <h3 className="chart-title flex items-center gap-2">
            {icon}
            {title}
          </h3>
        </div>
      )}
      <CardContent style={{ padding: '12px 20px 20px' }}>
        {children}
      </CardContent>
    </Card>
  )
}
