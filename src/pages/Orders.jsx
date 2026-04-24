import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SearchInput } from '@/components/SearchInput'
import { useQuoteFlowStore } from '@/store'
import { QUOTE_STATUSES, PAYMENT_STATUSES } from '@/data'
import { exportQuotesToExcel } from '@/lib/excel'
import { useToast } from '@/components/ToastProvider'
import { useI18n } from '@/lib/i18n'
import {
  FileSpreadsheet, Copy, MessageCircle,
  FileEdit, Send, Check, Receipt, Banknote, XCircle,
} from 'lucide-react'

export function Orders() {
  const { quotes, updateQuoteStatus, generateInvoice, recordPayment, duplicateQuote } = useQuoteFlowStore()
  const { addToast, showChain } = useToast()
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [paymentDialogQuote, setPaymentDialogQuote] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const statusFilters = [
    { key: 'all', labelKey: 'orders.all' },
    { key: 'draft', labelKey: 'orders.draft' },
    { key: 'sent', labelKey: 'orders.sent' },
    { key: 'accepted', labelKey: 'orders.accepted' },
    { key: 'invoiced', labelKey: 'orders.invoiced' },
    { key: 'rejected', labelKey: 'orders.rejected' },
  ]

  const paymentFilters = [
    { key: 'all', labelKey: 'orders.allPayment', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { key: 'unpaid', labelKey: 'orders.unpaid', color: 'bg-red-600 hover:bg-red-700 text-white' },
    { key: 'partial', labelKey: 'orders.partial', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
    { key: 'paid', labelKey: 'orders.paid', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  ]

  const filtered = quotes.filter(q => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false
    if (paymentFilter !== 'all' && q.paymentStatus !== paymentFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return q.num.toLowerCase().includes(s) ||
        (q.client?.company || '').toLowerCase().includes(s) ||
        (q.invoiceNum || '').toLowerCase().includes(s)
    }
    return true
  })

  const handleGenerateInvoice = (quoteId) => {
    const inv = generateInvoice(quoteId)
    if (inv) {
      showChain([
        { text: `✅ ${t('orders.invoice')} ${inv}`, type: 'success' },
        { text: `💰 ${t('orders.dueDate')}: 30d`, type: 'info' },
      ])
      setSelectedQuote(useQuoteFlowStore.getState().quotes.find(q => q.id === quoteId))
    }
  }

  const handleRecordPayment = () => {
    if (!paymentDialogQuote || !paymentAmount) return
    const amount = Number(paymentAmount)
    if (amount <= 0) return
    recordPayment(paymentDialogQuote.id, amount)
    addToast(`✅ RM ${amount.toLocaleString()}`, 'success')
    setPaymentDialogQuote(null)
    setPaymentAmount('')
    if (selectedQuote?.id === paymentDialogQuote.id) {
      setSelectedQuote(useQuoteFlowStore.getState().quotes.find(q => q.id === paymentDialogQuote.id))
    }
  }

  const handleDuplicate = (quoteId) => {
    const newId = duplicateQuote(quoteId)
    if (newId) addToast(`✅ QT-2026-${String(newId).padStart(3, '0')}`, 'success')
  }

  const handleWhatsApp = (quote) => {
    const lines = [
      `📋 ${quote.num}`,
      `${quote.client?.company || '—'}`,
      `${quote.date}`,
      '',
      ...(quote.items || []).map((item, i) => `${i + 1}. ${item.desc} × ${item.qty} = RM ${(item.qty * item.price).toLocaleString()}`),
      '',
      `Total: RM ${quote.total.toFixed(2)}`,
      '',
      'Thank you for your business!',
    ]
    const text = encodeURIComponent(lines.join('\n'))
    const phone = (quote.client?.tel || '').replace(/[\s-]/g, '').replace(/^0/, '60')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  return (
    <div className="page-enter">
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {statusFilters.map(s => (
          <Button key={s.key} variant={statusFilter === s.key ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s.key)}>
            {t(s.labelKey)}
          </Button>
        ))}
        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
        {paymentFilters.map(pf => (
          <Button
            key={pf.key}
            size="sm"
            className={paymentFilter === pf.key ? pf.color : ''}
            variant={paymentFilter === pf.key ? 'default' : 'outline'}
            onClick={() => setPaymentFilter(pf.key)}
          >
            {t(pf.labelKey)}
          </Button>
        ))}
        <div className="w-full sm:w-auto sm:ml-auto flex gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder={t('orders.searchPlaceholder')} />
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => exportQuotesToExcel(quotes)}>
            <FileSpreadsheet size={14} className="mr-1.5" />{t('common.exportExcel')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <MiniStat label={t('orders.totalQuotes')} value={quotes.length} />
        <MiniStat label={t('orders.pending')} value={quotes.filter(q => q.status === 'draft' || q.status === 'sent').length} color="blue" />
        <MiniStat label={t('orders.unpaid')} value={`RM ${quotes.filter(q => q.paymentStatus !== 'paid' && q.status === 'invoiced').reduce((s, q) => s + q.total - (q.paidAmount || 0), 0).toLocaleString()}`} color="red" />
        <MiniStat label={t('orders.paid')} value={`RM ${quotes.filter(q => q.status === 'invoiced').reduce((s, q) => s + (q.paidAmount || 0), 0).toLocaleString()}`} color="green" />
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-border overflow-x-auto card-hover">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-semibold">{t('orders.quoteNum')}</th>
              <th className="text-left p-3 font-semibold">{t('orders.date')}</th>
              <th className="text-left p-3 font-semibold">{t('orders.client')}</th>
              <th className="text-right p-3 font-semibold">{t('orders.amount')}</th>
              <th className="text-center p-3 font-semibold">{t('orders.status')}</th>
              <th className="text-center p-3 font-semibold">{t('orders.payment')}</th>
              <th className="text-center p-3 font-semibold">{t('orders.invoice')}</th>
              <th className="text-right p-3 font-semibold">{t('orders.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">{t('orders.noRecords')}</td></tr>
            )}
            {filtered.map(q => (
              <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedQuote(q)}>
                <td className="p-3 font-mono font-medium">{q.num}</td>
                <td className="p-3 text-muted-foreground">{q.date}</td>
                <td className="p-3">{q.client?.company || '—'}</td>
                <td className="p-3 text-right tabular-nums font-semibold">{q.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="p-3 text-center">
                  <Badge variant="outline" className={QUOTE_STATUSES[q.status]?.color || ''}>
                    {t(`status.${q.status}`)}
                  </Badge>
                </td>
                <td className="p-3 text-center">
                  {q.status === 'invoiced' && (
                    <Badge variant="outline" className={PAYMENT_STATUSES[q.paymentStatus]?.color || ''}>
                      {t(`pay.${q.paymentStatus}`)}
                    </Badge>
                  )}
                </td>
                <td className="p-3 text-center font-mono text-xs text-muted-foreground">{q.invoiceNum || '—'}</td>
                <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleWhatsApp(q)}><MessageCircle size={13} /></Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleDuplicate(q.id)}><Copy size={13} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedQuote && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedQuote.num}
                  <Badge variant="outline" className={QUOTE_STATUSES[selectedQuote.status]?.color || ''}>
                    {t(`status.${selectedQuote.status}`)}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{selectedQuote.client?.company || '—'}</p>
                  <p className="text-muted-foreground">{selectedQuote.client?.contact} · {selectedQuote.client?.tel}</p>
                  <p className="text-muted-foreground">{selectedQuote.client?.email}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{t('orders.quoteItems')}</p>
                  {(selectedQuote.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{item.desc} × {item.qty}</span>
                      <span className="tabular-nums">RM {(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>{t('orders.total')}</span>
                    <span className="tabular-nums">RM {selectedQuote.total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedQuote.invoiceNum && (
                  <>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">{t('orders.invoiceInfo')}</p>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.invoiceNum')}</span><span className="font-mono">{selectedQuote.invoiceNum}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.invoiceDate')}</span><span>{selectedQuote.invoiceDate}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.dueDate')}</span><span>{selectedQuote.dueDate}</span></div>
                    </div>
                  </>
                )}

                {selectedQuote.status === 'invoiced' && (
                  <>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">{t('orders.paymentRecord')}</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('orders.paidAmount')}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">RM {(selectedQuote.paidAmount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('orders.unpaidAmount')}</span>
                        <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">RM {(selectedQuote.total - (selectedQuote.paidAmount || 0)).toLocaleString()}</span>
                      </div>
                      <Badge variant="outline" className={PAYMENT_STATUSES[selectedQuote.paymentStatus]?.color || ''}>
                        {t(`pay.${selectedQuote.paymentStatus}`)}
                      </Badge>
                    </div>
                  </>
                )}

                <Separator />
                <div className="flex flex-wrap gap-2">
                  {selectedQuote.status === 'draft' && (
                    <Button size="sm" onClick={() => { updateQuoteStatus(selectedQuote.id, 'sent'); setSelectedQuote({ ...selectedQuote, status: 'sent' }); addToast('✅', 'success') }}>
                      {t('orders.markSent')}
                    </Button>
                  )}
                  {selectedQuote.status === 'sent' && (
                    <>
                      <Button size="sm" onClick={() => { updateQuoteStatus(selectedQuote.id, 'accepted'); setSelectedQuote({ ...selectedQuote, status: 'accepted' }); addToast('✅', 'success') }}>
                        {t('orders.clientAccepted')}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { updateQuoteStatus(selectedQuote.id, 'rejected'); setSelectedQuote({ ...selectedQuote, status: 'rejected' }); addToast('❌', 'warning') }}>
                        {t('orders.clientRejected')}
                      </Button>
                    </>
                  )}
                  {selectedQuote.status === 'accepted' && (
                    <Button size="sm" onClick={() => handleGenerateInvoice(selectedQuote.id)}>
                      {t('orders.generateInvoice')}
                    </Button>
                  )}
                  {selectedQuote.status === 'invoiced' && selectedQuote.paymentStatus !== 'paid' && (
                    <Button size="sm" onClick={() => { setPaymentDialogQuote(selectedQuote); setPaymentAmount('') }}>
                      {t('orders.recordPayment')}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleWhatsApp(selectedQuote)}>
                    <MessageCircle size={14} className="mr-1.5" />WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicate(selectedQuote.id)}>
                    <Copy size={14} className="mr-1.5" />{t('orders.duplicateQuote')}
                  </Button>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">{t('orders.lifecycle')}</p>
                  <QuoteLifecycle quote={selectedQuote} t={t} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialogQuote} onOpenChange={() => setPaymentDialogQuote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('orders.recordPayment')} — {paymentDialogQuote?.invoiceNum}</DialogTitle>
          </DialogHeader>
          {paymentDialogQuote && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.total')}</span><span className="tabular-nums">RM {paymentDialogQuote.total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('orders.paidAmount')}</span><span className="tabular-nums">RM {(paymentDialogQuote.paidAmount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold"><span>{t('orders.balance')}</span><span className="tabular-nums text-red-600">RM {(paymentDialogQuote.total - (paymentDialogQuote.paidAmount || 0)).toFixed(2)}</span></div>
              </div>
              <div>
                <Label>{t('orders.paymentAmount')}</Label>
                <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} autoFocus />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRecordPayment}>{t('orders.confirmPayment')}</Button>
                <Button variant="outline" onClick={() => setPaymentAmount(String(paymentDialogQuote.total - (paymentDialogQuote.paidAmount || 0)))}>{t('orders.payFullAmount')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MiniStat({ label, value, color = 'default' }) {
  const colorMap = {
    default: 'text-foreground',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    green: 'text-emerald-600 dark:text-emerald-400',
  }
  return (
    <Card className="card-hover">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums heading-font ${colorMap[color]}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function QuoteLifecycle({ quote, t }) {
  const steps = [
    { key: 'draft', labelKey: 'orders.draft', icon: FileEdit },
    { key: 'sent', labelKey: 'orders.sent', icon: Send },
    { key: 'accepted', labelKey: 'orders.accepted', icon: Check },
    { key: 'invoiced', labelKey: 'orders.invoiced', icon: Receipt },
    { key: 'paid', labelKey: 'orders.paid', icon: Banknote },
  ]

  const statusOrder = { draft: 0, sent: 1, accepted: 2, rejected: 2, invoiced: 3 }
  const currentStep = quote.paymentStatus === 'paid' ? 4 : (statusOrder[quote.status] ?? 0)

  if (quote.status === 'rejected') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <XCircle size={16} /> {t('orders.rejectedMsg')}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={`flex flex-col items-center ${i <= currentStep ? 'opacity-100' : 'opacity-25'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${i <= currentStep ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Icon size={14} strokeWidth={2} />
              </div>
              <span className="text-[10px] mt-1 text-muted-foreground">{t(step.labelKey)}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-5 h-0.5 -mt-3.5 rounded-full ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
