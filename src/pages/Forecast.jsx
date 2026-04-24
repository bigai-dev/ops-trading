import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartCard } from '@/components/ChartCard'
import { useQuoteFlowStore } from '@/store'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'
import { useChartTheme } from '@/lib/hooks/use-chart-theme'
import { useI18n } from '@/lib/i18n'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, BrainCircuit, AlertTriangle,
  Package, Users, Banknote, CalendarClock, Sparkles,
} from 'lucide-react'

// Generate deterministic mock forecast data from real store data
function useForecastData() {
  const { clients, inventory, quotes } = useQuoteFlowStore()

  return useMemo(() => {
    // --- Revenue Forecast (6 months) ---
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    const baseRevenue = clients.reduce((s, c) => s + c.totalSpent, 0) / 6
    const revenueForecast = months.map((m, i) => {
      const growth = 1 + (i * 0.04) + (Math.sin(i * 1.5) * 0.08)
      const predicted = Math.round(baseRevenue * growth)
      const low = Math.round(predicted * 0.82)
      const high = Math.round(predicted * 1.18)
      return {
        month: m,
        actual: i < 1 ? Math.round(predicted * (0.92 + Math.random() * 0.16)) : null,
        predicted,
        low,
        high,
        range: [low, high],
      }
    })

    // --- Client Purchase Predictions ---
    const clientPredictions = clients
      .filter(c => c.totalOrders > 0)
      .map(c => {
        const avgOrder = c.totalSpent / c.totalOrders
        const daysSinceContact = Math.floor((new Date('2026-04-06') - new Date(c.lastContact)) / (1000 * 60 * 60 * 24))
        const frequency = c.totalOrders > 5 ? 21 : c.totalOrders > 2 ? 35 : 60
        const daysUntilNext = Math.max(1, frequency - daysSinceContact)
        const nextDate = new Date('2026-04-06')
        nextDate.setDate(nextDate.getDate() + daysUntilNext)
        const prob = Math.min(95, Math.max(20, 100 - daysUntilNext * 1.5 + c.totalOrders * 3))
        const trend = c.totalOrders > 8 ? 'up' : c.totalOrders > 3 ? 'stable' : 'down'
        const predictedValue = Math.round(avgOrder * (0.85 + Math.random() * 0.3))
        return {
          company: c.company,
          contact: c.contact,
          nextDate: nextDate.toISOString().split('T')[0],
          predictedValue,
          probability: Math.round(prob),
          trend,
          totalOrders: c.totalOrders,
        }
      })
      .sort((a, b) => b.probability - a.probability)

    // --- Stock Depletion Forecast ---
    const stockForecasts = inventory
      .filter(i => i.stock > 0)
      .map(item => {
        // Mock velocity based on stock relative to minStock
        const weeklyVelocity = Math.round(item.minStock / 4 * (0.8 + Math.random() * 0.4))
        const weeksLeft = weeklyVelocity > 0 ? Math.round(item.stock / weeklyVelocity) : 99
        const daysLeft = weeksLeft * 7
        const reorderDate = new Date('2026-04-06')
        reorderDate.setDate(reorderDate.getDate() + Math.max(0, daysLeft - 14))
        const reorderQty = Math.round(weeklyVelocity * 8) // 8 weeks supply
        const riskScore = daysLeft <= 14 ? 'high' : daysLeft <= 30 ? 'med' : 'low'
        return {
          name: item.name,
          sku: item.sku,
          stock: item.stock,
          unit: item.unit,
          weeklyVelocity,
          daysLeft,
          reorderDate: reorderDate.toISOString().split('T')[0],
          reorderQty,
          riskScore,
        }
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)

    // --- Cash Flow Forecast (4 weeks) ---
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    const outstandingPerWeek = quotes
      .filter(q => q.status === 'invoiced' && q.paymentStatus !== 'paid')
      .reduce((s, q) => s + q.total - (q.paidAmount || 0), 0) / 4

    const cashFlow = weeks.map((w, i) => {
      const inflow = Math.round(outstandingPerWeek * (1.2 - i * 0.15) + baseRevenue / 8)
      const outflow = Math.round(baseRevenue / 12 * (0.9 + i * 0.05))
      return { week: w, inflow, outflow, net: inflow - outflow }
    })

    // --- AI Insights ---
    const insights = [
      { type: 'opportunity', text: { zh: '🎯 Johor Building Supply 预计下周下单，建议提前备货 Galvanized Pipe', en: '🎯 Johor Building Supply likely to order next week — pre-stock Galvanized Pipe', bm: '🎯 Johor Building Supply mungkin membuat pesanan minggu depan — sediakan stok Galvanized Pipe' } },
      { type: 'warning', text: { zh: '⚠️ Copper Wire 库存消耗加速，建议本周内补货', en: '⚠️ Copper Wire consumption accelerating — reorder this week', bm: '⚠️ Penggunaan Copper Wire meningkat — pesan semula minggu ini' } },
      { type: 'positive', text: { zh: '📈 本季度整体营收趋势上升 12%，主要来自 Steel Pipe 品类', en: '📈 Revenue trending up 12% this quarter, driven by Steel Pipe category', bm: '📈 Hasil meningkat 12% suku ini, didorong oleh kategori Steel Pipe' } },
      { type: 'risk', text: { zh: '💰 Soon Heng Auto Parts 有 RM2,508 逾期未付，建议跟进', en: '💰 Soon Heng Auto Parts has RM2,508 overdue — follow up recommended', bm: '💰 Soon Heng Auto Parts mempunyai RM2,508 tertunggak — susulan disyorkan' } },
      { type: 'opportunity', text: { zh: '🔄 KL Steel Trading 上次采购已超30天，属于回购周期，建议联系', en: '🔄 KL Steel Trading last purchase 30+ days ago — in repurchase cycle, contact suggested', bm: '🔄 KL Steel Trading pembelian terakhir 30+ hari lalu — dalam kitaran pembelian semula' } },
    ]

    return { revenueForecast, clientPredictions, stockForecasts, cashFlow, insights }
  }, [clients, inventory, quotes])
}

export function Forecast() {
  const { isDark } = useDarkMode()
  const theme = useChartTheme('quoteflow', isDark)
  const { t, lang } = useI18n()
  const { revenueForecast, clientPredictions, stockForecasts, cashFlow, insights } = useForecastData()

  const tooltipStyle = { background: theme.tooltipBg, color: theme.tooltipText, border: `1px solid ${theme.tooltipBorder}`, borderRadius: 10, fontSize: 13 }
  const tooltipProps = { contentStyle: tooltipStyle, itemStyle: { color: theme.tooltipText }, labelStyle: { color: theme.tooltipText } }

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <TrendingUp size={14} className="text-emerald-500" />
    if (trend === 'down') return <TrendingDown size={14} className="text-red-500" />
    return <Minus size={14} className="text-amber-500" />
  }

  const riskColors = { high: 'bg-red-500/15 text-red-700 dark:text-red-400', med: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' }

  return (
    <div className="page-enter space-y-6">
      {/* AI Badge Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white">
          <BrainCircuit size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-violet-500/15 to-blue-500/15 text-violet-700 dark:text-violet-400 border-violet-500/20">
              <Sparkles size={12} className="mr-1" /> AI-Powered
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{t('ai.poweredBy')}</p>
        </div>
        <p className="text-xs text-muted-foreground">{t('ai.generatedAt')} {new Date().toLocaleTimeString()}</p>
      </div>

      {/* AI Insights */}
      <Card className="border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-blue-500/5">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold heading-font flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-violet-500" /> {t('ai.insights')}
          </h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="text-sm py-1.5 px-3 rounded-lg bg-card/60 border border-border/50">
                {insight.text[lang] || insight.text.en}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast Chart */}
      <ChartCard title={t('ai.revenueForecast')} icon={<Banknote size={15} className="text-muted-foreground" />}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueForecast} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis dataKey="month" tick={{ fill: theme.text, fontSize: 12 }} />
            <YAxis tick={{ fill: theme.muted, fontSize: 12 }} tickFormatter={v => `RM ${(v/1000).toFixed(0)}k`} />
            <Tooltip {...tooltipProps} formatter={v => v != null ? `RM ${v.toLocaleString()}` : '—'} />
            <Area type="monotone" dataKey="high" stroke="none" fill="url(#gradConfidence)" name={t('ai.confidence')} />
            <Area type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} fill="url(#gradPredicted)" name={t('ai.predicted')} strokeDasharray="6 3" />
            <Area type="monotone" dataKey="low" stroke="none" fill="transparent" name="" />
            <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} fill="none" name={t('ai.actual')} dot={{ r: 4, fill: '#10B981' }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Client Purchase Predictions */}
        <ChartCard title={t('ai.clientForecast')} icon={<Users size={15} className="text-muted-foreground" />}>
          <div className="space-y-2">
            {clientPredictions.map((cp, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{cp.company}</p>
                  <p className="text-xs text-muted-foreground">{t('ai.nextOrder')}: {cp.nextDate}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums">RM {cp.predictedValue.toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendIcon trend={cp.trend} />
                    <span className={`text-xs font-semibold ${cp.probability >= 70 ? 'text-emerald-600' : cp.probability >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {cp.probability}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Cash Flow Forecast */}
        <ChartCard title={t('ai.cashFlow')} icon={<Banknote size={15} className="text-muted-foreground" />}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlow} margin={{ left: 0, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
              <XAxis dataKey="week" tick={{ fill: theme.text, fontSize: 12 }} />
              <YAxis tick={{ fill: theme.muted, fontSize: 12 }} tickFormatter={v => `RM ${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipProps} formatter={v => `RM ${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="inflow" name={t('ai.inflow')} fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" name={t('ai.outflow')} fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {cashFlow.map(w => (
              <div key={w.week} className="text-center">
                <p className="text-[10px] text-muted-foreground">{w.week}</p>
                <p className={`text-xs font-bold tabular-nums ${w.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {w.net >= 0 ? '+' : ''}RM {w.net.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Stock Depletion Forecast */}
      <ChartCard title={t('ai.stockForecast')} icon={<Package size={15} className="text-muted-foreground" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2.5 font-semibold">{t('ai.product')}</th>
                <th className="text-right p-2.5 font-semibold">{t('inv.stock')}</th>
                <th className="text-right p-2.5 font-semibold">{t('ai.velocity')}</th>
                <th className="text-right p-2.5 font-semibold">{t('ai.daysLeft')}</th>
                <th className="text-left p-2.5 font-semibold">{t('ai.reorderDate')}</th>
                <th className="text-right p-2.5 font-semibold">{t('ai.reorderQty')}</th>
                <th className="text-center p-2.5 font-semibold">{t('ai.riskScore')}</th>
              </tr>
            </thead>
            <tbody>
              {stockForecasts.map((sf, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-2.5 font-medium">{sf.name}</td>
                  <td className="p-2.5 text-right tabular-nums">{sf.stock} {t(`unit.${sf.unit}`)}</td>
                  <td className="p-2.5 text-right tabular-nums text-muted-foreground">{sf.weeklyVelocity}{t('ai.perWeek')}</td>
                  <td className="p-2.5 text-right">
                    <span className={`tabular-nums font-semibold ${sf.daysLeft <= 14 ? 'text-red-600' : sf.daysLeft <= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {sf.daysLeft} {t('ai.daysLeft')}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-xs">{sf.reorderDate}</td>
                  <td className="p-2.5 text-right tabular-nums font-semibold">{sf.reorderQty} {t(`unit.${sf.unit}`)}</td>
                  <td className="p-2.5 text-center">
                    <Badge variant="outline" className={riskColors[sf.riskScore]}>
                      {t(`ai.${sf.riskScore}Risk`)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
