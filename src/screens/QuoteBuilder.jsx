import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useQuoteFlowStore } from '@/store'
import { DEFAULT_ITEMS } from '@/data'
import { useToast } from '@/components/ToastProvider'
import { useI18n } from '@/lib/i18n'

export function QuoteBuilder() {
  const { addQuote, quoteCounter, clients, inventory } = useQuoteFlowStore()
  const { showChain, addToast } = useToast()
  const { t } = useI18n()
  const previewRef = useRef(null)

  const [company] = useState({ name: 'My Trading Sdn Bhd', tel: '03-1234 5678', email: 'info@mytrading.com', addr: 'No.10, Jalan Industri, 40000 Shah Alam', ssm: '202401012345' })
  const [client, setClient] = useState({ company: '', contact: '', tel: '', email: '', addr: '' })
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [items, setItems] = useState(structuredClone(DEFAULT_ITEMS))
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [sst, setSst] = useState(true)
  const [notes, setNotes] = useState('Payment: 30 days from invoice date\nDelivery: 7-14 working days\nValidity: 30 days')

  const quoteNum = `QT-2026-${String(quoteCounter + 1).padStart(3, '0')}`
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const discountAmt = subtotal * (discount / 100)
  const afterDiscount = subtotal - discountAmt
  const sstAmt = sst ? afterDiscount * 0.08 : 0
  const total = afterDiscount + sstAmt + shipping

  const totalCost = items.reduce((s, item) => {
    const cost = item.costPrice ?? inventory.find(i => i.name === item.desc)?.costPrice ?? 0
    return s + cost * item.qty
  }, 0)
  const margin = subtotal > 0 ? ((afterDiscount - totalCost) / afterDiscount * 100) : 0

  const addItem = () => setItems([...items, { desc: '', qty: 1, price: 0 }])
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i, field, value) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: field === 'desc' ? value : Number(value) || 0 }
    setItems(updated)
  }

  const handleSelectClient = (clientId) => {
    const c = clients.find(cl => cl.id === Number(clientId))
    if (c) {
      setSelectedClientId(c.id)
      setClient({ company: c.company, contact: c.contact, tel: c.phone, email: c.email, addr: '' })
      if (c.discount > 0) {
        setDiscount(c.discount)
        addToast(t('toast.discountApplied', { company: c.company, discount: c.discount }), 'info')
      }
    }
  }

  const handleAddFromInventory = (inv) => {
    const existing = items.findIndex(i => i.desc === inv.name)
    if (existing >= 0) {
      updateItem(existing, 'qty', items[existing].qty + 1)
    } else {
      setItems([...items, { desc: inv.name, qty: 1, price: inv.price, costPrice: inv.costPrice }])
    }
  }

  const handleSubmit = () => {
    if (items.length === 0) return
    const enrichedItems = items.map(item => {
      if (item.costPrice != null) return item
      const inv = inventory.find(i => i.name === item.desc)
      return { ...item, costPrice: inv ? inv.costPrice : 0 }
    })
    addQuote({
      items: enrichedItems, total, subtotal, client: { ...client },
      date: new Date().toISOString().split('T')[0],
      discount, sst, shipping, notes,
    })
    showChain([
      { text: t('toast.quoteGenerated', { num: quoteNum }), type: 'success' },
      { text: t('toast.viewInOrders'), type: 'info' },
    ])
  }

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf().set({
      margin: [10, 10, 10, 10],
      filename: `${quoteNum}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(previewRef.current).save()
  }

  const handleNew = () => {
    setClient({ company: '', contact: '', tel: '', email: '', addr: '' })
    setSelectedClientId(null)
    setItems(structuredClone(DEFAULT_ITEMS))
    setDiscount(0)
    setShipping(0)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in duration-300">
      {/* Form */}
      <div className="space-y-3">
        <Card>
          <CardHeader className="px-4 pt-3 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <CardTitle className="text-sm font-semibold heading-font">{t('quote.clientInfo')}</CardTitle>
              <select
                className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground w-full sm:w-auto"
                value={selectedClientId || ''}
                onChange={e => handleSelectClient(e.target.value)}
              >
                <option value="">{t('quote.selectClient')}</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company} ({c.contact}){c.discount > 0 ? ` [${c.discount}%]` : ''}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div className="space-y-1"><Label className="text-xs">{t('quote.company')}</Label><Input value={client.company} onChange={e => setClient(c => ({ ...c, company: e.target.value }))} placeholder="ABC Sdn Bhd" className="h-8" /></div>
              <div className="space-y-1"><Label className="text-xs">{t('quote.contact')}</Label><Input value={client.contact} onChange={e => setClient(c => ({ ...c, contact: e.target.value }))} placeholder="Mr. Tan" className="h-8" /></div>
              <div className="space-y-1"><Label className="text-xs">{t('quote.phone')}</Label><Input value={client.tel} onChange={e => setClient(c => ({ ...c, tel: e.target.value }))} placeholder="012-345 6789" className="h-8" /></div>
              <div className="space-y-1"><Label className="text-xs">{t('quote.email')}</Label><Input value={client.email} onChange={e => setClient(c => ({ ...c, email: e.target.value }))} placeholder="tan@abc.com" className="h-8" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 pt-3 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <CardTitle className="text-sm font-semibold heading-font">{t('quote.items')}</CardTitle>
              <div className="flex gap-2">
                <select
                  className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground flex-1 sm:flex-none"
                  value=""
                  onChange={e => {
                    const inv = inventory.find(i => i.id === Number(e.target.value))
                    if (inv) handleAddFromInventory(inv)
                  }}
                >
                  <option value="">{t('quote.addFromInventory')}</option>
                  {inventory.filter(i => i.stock > 0).map(i => (
                    <option key={i.id} value={i.id}>{i.name} (RM{i.price}) [{t('quote.stockLabel')}:{i.stock}]</option>
                  ))}
                </select>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addItem}>{t('quote.addCustom')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 space-y-1.5">
            {items.map((item, i) => {
              const cost = item.costPrice ?? inventory.find(inv => inv.name === item.desc)?.costPrice
              const itemMargin = cost != null && item.price > 0 ? ((item.price - cost) / item.price * 100) : null
              return (
                <div key={i} className="flex flex-wrap sm:flex-nowrap gap-1.5 items-center border-b border-border/50 pb-1.5 sm:border-0 sm:pb-0">
                  <div className="w-full sm:flex-1">
                    <Input value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder={t('quote.productName')} className="text-sm h-8" />
                  </div>
                  <div className="w-16 sm:w-18"><Input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} className="text-sm text-center h-8" /></div>
                  <div className="w-20 sm:w-22"><Input type="number" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} className="text-sm text-right h-8" /></div>
                  <div className="w-20 text-right text-sm font-medium tabular-nums">RM {(item.qty * item.price).toLocaleString()}</div>
                  {itemMargin !== null && (
                    <div className={`w-12 text-right text-xs ${itemMargin >= 20 ? 'text-emerald-600' : itemMargin >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                      {itemMargin.toFixed(0)}%
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => removeItem(i)}>×</Button>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2.5">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t('quote.discount')}</Label><Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} className="h-8" /></div>
              <div className="space-y-1"><Label className="text-xs">{t('quote.shipping')}</Label><Input type="number" value={shipping} onChange={e => setShipping(Number(e.target.value) || 0)} className="h-8" /></div>
              <div className="flex items-end gap-2 pb-0.5"><Label className="text-xs">SST 8%</Label><Switch checked={sst} onCheckedChange={setSst} /></div>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 text-xs">
              <span className="text-muted-foreground">{t('quote.marginAnalysis')}</span>
              <span className="tabular-nums">{t('quote.cost')} RM {totalCost.toLocaleString()}</span>
              <span className="text-muted-foreground">·</span>
              <Badge className={`text-xs ${margin >= 20 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : margin >= 10 ? 'bg-amber-500/15 text-amber-700' : 'bg-red-500/15 text-red-700'}`}>
                {t('quote.marginRate')} {margin.toFixed(1)}%
              </Badge>
            </div>

            <div className="space-y-1"><Label className="text-xs">{t('common.notes')}</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="text-sm" /></div>
            <div className="flex gap-2 pt-0.5">
              <Button size="sm" onClick={handleSubmit}>{t('quote.generate')}</Button>
              <Button size="sm" variant="outline" onClick={handleDownloadPDF}>{t('quote.downloadPDF')}</Button>
              <Button size="sm" variant="ghost" onClick={handleNew}>{t('quote.new')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="px-4 pt-3 pb-2"><CardTitle className="text-sm font-semibold heading-font">{t('quote.preview')}</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div ref={previewRef} className="bg-white text-gray-900 p-6 rounded-lg text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold">{company.name}</h2>
              <p className="text-xs text-gray-500">{company.addr}</p>
              <p className="text-xs text-gray-500">Tel: {company.tel} | Email: {company.email} | SSM: {company.ssm}</p>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-xs mb-4">
              <div>
                <p className="font-semibold">Bill To:</p>
                <p>{client.company || '—'}</p>
                <p>{client.contact}</p>
                <p>{client.tel}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{quoteNum}</p>
                <p>{new Date().toLocaleDateString('en-MY')}</p>
              </div>
            </div>

            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1.5 font-semibold">#</th>
                  <th className="text-left py-1.5 font-semibold">Description</th>
                  <th className="text-right py-1.5 font-semibold">Qty</th>
                  <th className="text-right py-1.5 font-semibold">Unit Price</th>
                  <th className="text-right py-1.5 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1.5">{i + 1}</td>
                    <td className="py-1.5">{item.desc || '—'}</td>
                    <td className="py-1.5 text-right tabular-nums">{item.qty}</td>
                    <td className="py-1.5 text-right tabular-nums">RM {item.price.toLocaleString()}</td>
                    <td className="py-1.5 text-right tabular-nums">RM {(item.qty * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-48 text-xs space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">RM {subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div className="flex justify-between text-red-600"><span>Discount ({discount}%)</span><span>-RM {discountAmt.toLocaleString()}</span></div>}
                {sst && <div className="flex justify-between"><span>SST (8%)</span><span className="tabular-nums">RM {sstAmt.toFixed(2)}</span></div>}
                {shipping > 0 && <div className="flex justify-between"><span>Shipping</span><span className="tabular-nums">RM {shipping.toLocaleString()}</span></div>}
                <Separator />
                <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span className="tabular-nums">RM {total.toFixed(2)}</span></div>
              </div>
            </div>

            {notes && <div className="mt-4 text-[11px] text-gray-400 whitespace-pre-line">{notes}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
