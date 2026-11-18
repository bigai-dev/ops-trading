import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { Button } from '@/components/ui/button'
import { useQuoteFlowStore } from '@/store'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'
import { useChartTheme } from '@/lib/hooks/use-chart-theme'
import { useI18n } from '@/lib/i18n'
import { exportAllToExcel } from '@/lib/excel'
import {
  DollarSign, FileText, Users, Activity,
  Banknote, CircleX, AlertTriangle,
  Building2, Package, CreditCard, CalendarClock, FileSpreadsheet,
} from 'lucide-react'

export function Dashboard() {
  const { clients, inventory, quotes, getRevenueSummary, getLowStockCount, getMarginSummary, getAgingReport } = useQuoteFlowStore()
  const { isDark } = useDarkMode()
  const theme = useChartTheme('quoteflow', isDark)
  const { t } = useI18n()
  const { totalRevenue, totalOrders, activeClients, totalOutstanding, totalCollected, overdueInvoices } = getRevenueSummary()
  const lowStockCount = getLowStockCount()
  const { avgMargin } = getMarginSummary()
  const aging = getAgingReport()

  const revenueData = clients
    .filter(c => c.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
    .map(c => ({ name: c.company.length > 15 ? c.company.slice(0, 15) + '...' : c.company, value: c.totalSpent }))

  const okCount = inventory.filter(i => i.stock > i.minStock * 1.2).length
  const lowCount = inventory.filter(i => i.stock > 0 && i.stock <= i.minStock * 1.2).length
  const outCount = inventory.filter(i => i.stock === 0).length
  const invData = [
    { name: t('dash.sufficient'), value: okCount, color: '#047857' },
    { name: t('dash.low'), value: lowCount, color: '#F59E0B' },
    { name: t('dash.outOfStock'), value: outCount, color: '#B91C1C' },
  ].filter(d => d.value > 0)

  const paymentData = [
    { name: t('dash.paid'), value: quotes.filter(q => q.status === 'invoiced' && q.paymentStatus === 'paid').length, color: '#047857' },
    { name: t('dash.partial'), value: quotes.filter(q => q.status === 'invoiced' && q.paymentStatus === 'partial').length, color: '#F59E0B' },
    { name: t('dash.unpaid'), value: quotes.filter(q => q.status === 'invoiced' && q.paymentStatus === 'unpaid').length, color: '#B91C1C' },
  ].filter(d => d.value > 0)

  const agingData = [
    { name: t('dash.current'), value: aging.current.reduce((s, q) => s + q.outstanding, 0), color: '#047857' },
    { name: t('dash.days30'), value: aging.days30.reduce((s, q) => s + q.outstanding, 0), color: '#F59E0B' },
    { name: t('dash.days60'), value: aging.days60.reduce((s, q) => s + q.outstanding, 0), color: '#EA580C' },
    { name: t('dash.days90'), value: aging.days90.reduce((s, q) => s + q.outstanding, 0), color: '#B91C1C' },
  ]

  const tooltipStyle = { background: theme.tooltipBg, color: theme.tooltipText, border: `1px solid ${theme.tooltipBorder}`, borderRadius: 10, fontSize: 13 }
  const tooltipProps = { contentStyle: tooltipStyle, itemStyle: { color: theme.tooltipText }, labelStyle: { color: theme.tooltipText }, cursor: { fill: theme.cursor } }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <Button variant="outline" size="sm" onClick={() => exportAllToExcel(clients, inventory, quotes)}>
          <FileSpreadsheet size={14} className="mr-1.5" />{t('dash.exportAll')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2 lg:col-span-1 stagger-item">
          <KpiCard title={t('dash.totalRevenue')} value={totalRevenue} prefix="RM " color="blue" hero icon={<DollarSign size={24} />} />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dash.totalOrders')} value={totalOrders} suffix={t('dash.orders') ? ` ${t('dash.orders')}` : ''} color="green" icon={<FileText size={20} />} />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dash.activeClients')} value={activeClients} suffix={t('dash.clients') ? ` ${t('dash.clients')}` : ''} color="purple" icon={<Users size={20} />} />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dash.avgMargin')} value={`${avgMargin.toFixed(1)}%`} color={avgMargin >= 20 ? 'green' : avgMargin >= 10 ? 'amber' : 'red'} icon={<Activity size={20} />} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stagger-item">
          <KpiCard title={t('dash.collected')} value={totalCollected} prefix="RM " color="green" icon={<Banknote size={20} />} />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dash.outstanding')} value={totalOutstanding} prefix="RM " color={totalOutstanding > 0 ? 'red' : 'green'} icon={<CircleX size={20} />} />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dash.overdueInvoices')} value={overdueInvoices} suffix={t('dash.invoices') ? ` ${t('dash.invoices')}` : ''} color={overdueInvoices > 0 ? 'red' : 'green'} icon={<AlertTriangle size={20} />} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard title={t('dash.clientRevenue')} icon={<Building2 size={15} className="text-muted-foreground" />} className="lg:col-span-3 stagger-item">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData} layout="vertical" margin={{ left: 10, right: 20, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: theme.muted, fontSize: 12 }} tickFormatter={v => `RM ${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: theme.text, fontSize: 11 }} />
              <Tooltip {...tooltipProps} formatter={v => `RM ${v.toLocaleString()}`} />
              <Bar dataKey="value" name={t('dash.revenue')} radius={[0, 6, 6, 0]} fill={theme.primary} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('dash.inventoryStatus')} icon={<Package size={15} className="text-muted-foreground" />} className="lg:col-span-2 stagger-item">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={invData} stroke={theme.surface} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" animationDuration={800}>
                {invData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 -mt-1">
            {invData.map(d => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={t('dash.paymentDist')} icon={<CreditCard size={15} className="text-muted-foreground" />} className="stagger-item">
          {paymentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentData} stroke={theme.surface} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" animationDuration={800}>
                    {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipProps} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 -mt-1">
                {paymentData.map(d => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">{t('common.noData')}</div>
          )}
        </ChartCard>

        <ChartCard title={t('dash.agingReport')} icon={<CalendarClock size={15} className="text-muted-foreground" />} className="stagger-item">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agingData} margin={{ left: 0, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
              <XAxis dataKey="name" tick={{ fill: theme.text, fontSize: 12 }} />
              <YAxis tick={{ fill: theme.muted, fontSize: 12 }} tickFormatter={v => `RM ${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipProps} formatter={v => `RM ${v.toLocaleString()}`} />
              <Bar dataKey="value" name={t('dash.unpaidAmount')} radius={[6, 6, 0, 0]} animationDuration={800}>
                {agingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
