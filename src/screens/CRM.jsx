import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SearchInput } from '@/components/SearchInput'
import { useQuoteFlowStore } from '@/store'
import { STATUS_LABELS } from '@/data'
import { exportClientsToExcel, readExcelFile, parseClientsFromExcel } from '@/lib/excel'
import { useToast } from '@/components/ToastProvider'
import { useI18n } from '@/lib/i18n'
import { FileSpreadsheet, Download, UserPlus, MessageCircle, Mail, Clock } from 'lucide-react'

const STATUS_KEYS = {
  '成交': 'crm.status.deal',
  '跟进中': 'crm.status.following',
  '潜在': 'crm.status.potential',
  '维护': 'crm.status.maintain',
}

export function CRM() {
  const { clients, getOverdueClients, updateClient, addClient, importClients } = useQuoteFlowStore()
  const { addToast } = useToast()
  const { t } = useI18n()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newClient, setNewClient] = useState({ company: '', contact: '', phone: '', email: '', status: '潜在', discount: 0, notes: '' })
  const fileInputRef = useRef(null)
  const overdueIds = new Set(getOverdueClients().map(c => c.id))

  const statusFilters = [
    { key: 'all', label: t('common.all'), value: 'all' },
    { key: '成交', label: t('crm.status.deal'), value: '成交' },
    { key: '跟进中', label: t('crm.status.following'), value: '跟进中' },
    { key: '潜在', label: t('crm.status.potential'), value: '潜在' },
    { key: '维护', label: t('crm.status.maintain'), value: '维护' },
  ]

  const filtered = clients.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter
    const matchSearch = !search || c.company.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    return matchStatus && matchSearch
  })

  const handleWhatsApp = (client) => {
    const phone = client.phone.replace(/[\s-]/g, '').replace(/^0/, '60')
    window.open(`https://wa.me/${phone}`, '_blank')
  }

  const handleAddClient = () => {
    if (!newClient.company) return
    addClient({
      ...newClient,
      lastContact: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
    })
    addToast(t('toast.clientAdded', { name: newClient.company }), 'success')
    setShowAddDialog(false)
    setNewClient({ company: '', contact: '', phone: '', email: '', status: '潜在', discount: 0, notes: '' })
  }

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const sheets = await readExcelFile(file)
      const firstSheet = Object.values(sheets)[0]
      if (firstSheet && firstSheet.length > 0) {
        const parsed = parseClientsFromExcel(firstSheet)
        importClients(parsed)
        addToast(t('toast.imported', { count: parsed.length }), 'success')
      }
    } catch {
      addToast(t('toast.importFailed'), 'error')
    }
    e.target.value = ''
  }

  const translateStatus = (status) => STATUS_KEYS[status] ? t(STATUS_KEYS[status]) : status

  return (
    <div className="page-enter">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {statusFilters.map(s => (
          <Button key={s.key} variant={filter === s.key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s.key)}>
            {s.label}
          </Button>
        ))}
        <div className="w-full sm:w-auto sm:ml-auto flex gap-2 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder={t('crm.searchPlaceholder')} />
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}><UserPlus size={14} className="mr-1.5" />{t('crm.newClient')}</Button>
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => exportClientsToExcel(clients)}><FileSpreadsheet size={14} className="mr-1.5" />{t('common.export')}</Button>
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => fileInputRef.current?.click()}><Download size={14} className="mr-1.5" />{t('common.import')}</Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(client => (
          <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow focus-visible:ring-2 focus-visible:ring-ring" role="button" tabIndex={0} aria-label={t('crm.viewDetail', { name: client.company })} onClick={() => setSelectedClient(client)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedClient(client) } }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm heading-font truncate flex-1">{client.company}</h3>
                <Badge variant="outline" className={STATUS_LABELS[client.status]?.color || ''}>
                  {translateStatus(client.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{client.contact}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>
              {client.discount > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('crm.discountLabel', { pct: client.discount })}</p>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t('crm.ordersCount', { count: client.totalOrders })}</span>
                <span className="font-semibold tabular-nums">RM {client.totalSpent.toLocaleString()}</span>
              </div>
              {overdueIds.has(client.id) && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock size={12} /> {t('crm.overdue')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Sheet */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent>
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedClient.company}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Badge variant="outline" className={STATUS_LABELS[selectedClient.status]?.color || ''}>
                    {translateStatus(selectedClient.status)}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('quote.contact')}</span><span>{selectedClient.contact}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('quote.phone')}</span><span>{selectedClient.phone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('quote.email')}</span><span>{selectedClient.email}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('crm.discount')}</span><span className="text-blue-600 font-semibold">{selectedClient.discount || 0}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('crm.totalOrders')}</span><span>{selectedClient.totalOrders}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('crm.totalSpent')}</span><span className="font-semibold">RM {selectedClient.totalSpent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t('crm.lastContact')}</span><span>{selectedClient.lastContact}</span></div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">{t('common.notes')}</p>
                    <p className="text-sm">{selectedClient.notes}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs">{t('crm.editDiscount')}</Label>
                    <div className="flex gap-2 mt-1">
                      <Input type="number" defaultValue={selectedClient.discount || 0} className="w-24" min={0} max={50} onBlur={e => updateClient(selectedClient.id, { discount: Number(e.target.value) || 0 })} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleWhatsApp(selectedClient)}><MessageCircle size={14} className="mr-1.5" />WhatsApp</Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${selectedClient.email}`)}><Mail size={14} className="mr-1.5" />Email</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('crm.addClient')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{t('quote.company')}</Label><Input value={newClient.company} onChange={e => setNewClient(c => ({ ...c, company: e.target.value }))} placeholder="ABC Sdn Bhd" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('quote.contact')}</Label><Input value={newClient.contact} onChange={e => setNewClient(c => ({ ...c, contact: e.target.value }))} placeholder="Mr. Tan" /></div>
              <div><Label>{t('quote.phone')}</Label><Input value={newClient.phone} onChange={e => setNewClient(c => ({ ...c, phone: e.target.value }))} placeholder="012-345 6789" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('quote.email')}</Label><Input value={newClient.email} onChange={e => setNewClient(c => ({ ...c, email: e.target.value }))} placeholder="email@company.com" /></div>
              <div><Label>{t('crm.discount')} (%)</Label><Input type="number" value={newClient.discount} onChange={e => setNewClient(c => ({ ...c, discount: Number(e.target.value) || 0 }))} /></div>
            </div>
            <div>
              <Label>{t('crm.status')}</Label>
              <select className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm" value={newClient.status} onChange={e => setNewClient(c => ({ ...c, status: e.target.value }))}>
                <option value="潜在">{t('crm.status.potential')}</option>
                <option value="跟进中">{t('crm.status.following')}</option>
                <option value="成交">{t('crm.status.deal')}</option>
                <option value="维护">{t('crm.status.maintain')}</option>
              </select>
            </div>
            <div><Label>{t('common.notes')}</Label><Input value={newClient.notes} onChange={e => setNewClient(c => ({ ...c, notes: e.target.value }))} placeholder={t('crm.notesPlaceholder')} /></div>
            <Button onClick={handleAddClient} className="w-full">{t('crm.addBtn')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
