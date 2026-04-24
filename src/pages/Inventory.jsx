import { useState, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SearchInput } from '@/components/SearchInput'
import { useQuoteFlowStore } from '@/store'
import { exportInventoryToExcel, readExcelFile, parseInventoryFromExcel } from '@/lib/excel'
import { useToast } from '@/components/ToastProvider'
import { useI18n } from '@/lib/i18n'
import { FileSpreadsheet, Download } from 'lucide-react'

export function Inventory() {
  const { inventory, importInventory, getMarginSummary } = useQuoteFlowStore()
  const { addToast } = useToast()
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const fileInputRef = useRef(null)

  const { totalCost, totalValue, avgMargin } = getMarginSummary()

  const filtered = inventory.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  )

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const sheets = await readExcelFile(file)
      const firstSheet = Object.values(sheets)[0]
      if (firstSheet && firstSheet.length > 0) {
        const parsed = parseInventoryFromExcel(firstSheet)
        importInventory(parsed)
        addToast(t('toast.imported', { count: parsed.length }), 'success')
      }
    } catch {
      addToast(t('toast.importFailed'), 'error')
    }
    e.target.value = ''
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg font-bold heading-font">{t('inv.title')}</h2>
        <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
          <SearchInput value={search} onChange={setSearch} placeholder={t('inv.searchPlaceholder')} />
          <Button variant="outline" size="sm" onClick={() => exportInventoryToExcel(inventory)}><FileSpreadsheet size={14} className="mr-1.5" />{t('common.exportExcel')}</Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Download size={14} className="mr-1.5" />{t('common.importExcel')}</Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-border p-3 card-hover">
          <p className="text-xs text-muted-foreground">{t('inv.totalValueSell')}</p>
          <p className="text-lg font-bold tabular-nums heading-font">RM {totalValue.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border p-3 card-hover">
          <p className="text-xs text-muted-foreground">{t('inv.totalValueCost')}</p>
          <p className="text-lg font-bold tabular-nums heading-font">RM {totalCost.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border p-3 card-hover">
          <p className="text-xs text-muted-foreground">{t('inv.avgMargin')}</p>
          <p className={`text-lg font-bold tabular-nums heading-font ${avgMargin >= 20 ? 'text-emerald-600' : avgMargin >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
            {avgMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto card-hover">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inv.productName')}</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">{t('inv.stock')}</TableHead>
              <TableHead className="text-right">{t('inv.minStock')}</TableHead>
              <TableHead className="w-28">{t('inv.stockRatio')}</TableHead>
              <TableHead className="text-right">{t('inv.sellPrice')}</TableHead>
              <TableHead className="text-right">{t('inv.costPrice')}</TableHead>
              <TableHead className="text-right">{t('inv.margin')}</TableHead>
              <TableHead>{t('inv.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(item => {
              const ratio = item.minStock > 0 ? Math.min(item.stock / (item.minStock * 2), 1) * 100 : 100
              const isOut = item.stock === 0
              const isLow = !isOut && item.stock <= item.minStock * 1.2
              const margin = item.price > 0 ? ((item.price - item.costPrice) / item.price * 100) : 0

              return (
                <TableRow key={item.id} className={isOut ? 'bg-red-50 dark:bg-red-500/5' : ''}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{item.sku}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.stock} {t(`unit.${item.unit}`)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{item.minStock} {t(`unit.${item.unit}`)}</TableCell>
                  <TableCell>
                    <Progress value={ratio} className={`h-2 ${isOut ? '[&>div]:bg-red-500' : isLow ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">RM {item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">RM {item.costPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={`tabular-nums font-medium ${margin >= 25 ? 'text-emerald-600 dark:text-emerald-400' : margin >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                      {margin.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {isOut ? (
                      <Badge variant="destructive">{t('inv.outOfStock')}</Badge>
                    ) : isLow ? (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">{t('inv.low')}</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">{t('inv.sufficient')}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
