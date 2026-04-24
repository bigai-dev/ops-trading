import * as XLSX from 'xlsx'

// ─── Export to Excel ───

export function exportToExcel(data, filename, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  // Auto-width columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(r => String(r[key] ?? '').length)) + 2,
  }))
  ws['!cols'] = colWidths
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportClientsToExcel(clients) {
  const rows = clients.map(c => ({
    '公司名称': c.company,
    '联系人': c.contact,
    '电话': c.phone,
    'Email': c.email,
    '状态': c.status,
    '最后联系': c.lastContact,
    '总订单': c.totalOrders,
    '总消费 (RM)': c.totalSpent,
    '折扣 (%)': c.discount || 0,
    '备注': c.notes,
  }))
  exportToExcel(rows, 'QuoteFlow_客户列表', '客户')
}

export function exportInventoryToExcel(inventory) {
  const rows = inventory.map(i => ({
    '产品名称': i.name,
    'SKU': i.sku,
    '库存': i.stock,
    '最低库存': i.minStock,
    '单位': i.unit,
    '售价 (RM)': i.price,
    '成本价 (RM)': i.costPrice,
    '利润率 (%)': i.price > 0 ? Math.round((i.price - i.costPrice) / i.price * 100) : 0,
    '库存价值 (RM)': i.price * i.stock,
  }))
  exportToExcel(rows, 'QuoteFlow_库存清单', '库存')
}

export function exportQuotesToExcel(quotes) {
  const rows = quotes.map(q => ({
    '报价单号': q.num,
    '日期': q.date,
    '客户': q.client?.company || '',
    '联系人': q.client?.contact || '',
    '电话': q.client?.tel || '',
    '项目数': q.items?.length || 0,
    '小计 (RM)': q.subtotal || 0,
    '折扣 (%)': q.discount || 0,
    'SST': q.sst ? '是' : '否',
    '运费 (RM)': q.shipping || 0,
    '总金额 (RM)': q.total,
    '状态': q.status,
    '发票号': q.invoiceNum || '',
    '发票日期': q.invoiceDate || '',
    '付款期限': q.dueDate || '',
    '付款状态': q.paymentStatus,
    '已付金额 (RM)': q.paidAmount || 0,
    '未付金额 (RM)': q.total - (q.paidAmount || 0),
  }))
  exportToExcel(rows, 'QuoteFlow_报价单及发票', '报价单')
}

export function exportAllToExcel(clients, inventory, quotes) {
  const wb = XLSX.utils.book_new()

  // Clients sheet
  const clientRows = clients.map(c => ({
    '公司名称': c.company, '联系人': c.contact, '电话': c.phone, 'Email': c.email,
    '状态': c.status, '总订单': c.totalOrders, '总消费 (RM)': c.totalSpent, '折扣 (%)': c.discount || 0,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientRows), '客户')

  // Inventory sheet
  const invRows = inventory.map(i => ({
    '产品名称': i.name, 'SKU': i.sku, '库存': i.stock, '最低库存': i.minStock,
    '单位': i.unit, '售价 (RM)': i.price, '成本价 (RM)': i.costPrice,
    '利润率 (%)': i.price > 0 ? Math.round((i.price - i.costPrice) / i.price * 100) : 0,
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invRows), '库存')

  // Quotes sheet
  const quoteRows = quotes.map(q => ({
    '报价单号': q.num, '日期': q.date, '客户': q.client?.company || '', '总金额 (RM)': q.total,
    '状态': q.status, '发票号': q.invoiceNum || '', '付款状态': q.paymentStatus,
    '已付 (RM)': q.paidAmount || 0, '未付 (RM)': q.total - (q.paidAmount || 0),
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quoteRows), '报价单')

  XLSX.writeFile(wb, 'QuoteFlow_全部数据.xlsx')
}

// ─── Import from Excel ───

export function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const sheets = {}
        wb.SheetNames.forEach(name => {
          sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name])
        })
        resolve(sheets)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function parseInventoryFromExcel(rows) {
  return rows.map((r, i) => ({
    id: i + 1,
    name: r['产品名称'] || r['name'] || '',
    sku: r['SKU'] || r['sku'] || '',
    stock: Number(r['库存'] || r['stock'] || 0),
    minStock: Number(r['最低库存'] || r['minStock'] || 0),
    unit: r['单位'] || r['unit'] || '个',
    price: Number(r['售价 (RM)'] || r['price'] || 0),
    costPrice: Number(r['成本价 (RM)'] || r['costPrice'] || 0),
  }))
}

export function parseClientsFromExcel(rows) {
  return rows.map((r, i) => ({
    id: i + 1,
    company: r['公司名称'] || r['company'] || '',
    contact: r['联系人'] || r['contact'] || '',
    phone: r['电话'] || r['phone'] || '',
    email: r['Email'] || r['email'] || '',
    status: r['状态'] || r['status'] || '潜在',
    lastContact: r['最后联系'] || r['lastContact'] || new Date().toISOString().split('T')[0],
    totalOrders: Number(r['总订单'] || r['totalOrders'] || 0),
    totalSpent: Number(r['总消费 (RM)'] || r['totalSpent'] || 0),
    discount: Number(r['折扣 (%)'] || r['discount'] || 0),
    notes: r['备注'] || r['notes'] || '',
  }))
}
