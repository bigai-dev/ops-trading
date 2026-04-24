export const DEFAULT_ITEMS = [
  { desc: 'Steel Pipe 40mm × 6m', qty: 100, price: 32 },
  { desc: 'Aluminium Sheet 2mm × 1200mm', qty: 50, price: 36 },
  { desc: 'Stainless Bolt M12 (box/100)', qty: 20, price: 28 },
]

export const DEFAULT_CLIENTS = [
  { id: 1, company: 'ABC Hardware Sdn Bhd', contact: 'Mr. Tan', phone: '012-345 6789', email: 'tan@abc.com', status: '成交', lastContact: '2026-03-24', totalOrders: 12, totalSpent: 45600, notes: '老客户，每月固定采购', discount: 5 },
  { id: 2, company: 'KL Steel Trading', contact: 'Ahmad', phone: '019-876 5432', email: 'ahmad@klsteel.com', status: '跟进中', lastContact: '2026-03-20', totalOrders: 3, totalSpent: 12800, notes: '价格敏感，需要给折扣', discount: 8 },
  { id: 3, company: 'Mega Construction', contact: 'David Lee', phone: '016-789 0123', email: 'david@mega.com', status: '潜在', lastContact: '2026-03-18', totalOrders: 0, totalSpent: 0, notes: '上周展会认识，对Steel Pipe有兴趣', discount: 0 },
  { id: 4, company: 'Soon Heng Auto Parts', contact: '林老板', phone: '013-456 7890', email: 'sh@auto.com', status: '成交', lastContact: '2026-03-23', totalOrders: 8, totalSpent: 28400, notes: '汽车零件批发商', discount: 3 },
  { id: 5, company: 'Johor Building Supply', contact: 'Muthu', phone: '017-234 5678', email: 'muthu@jbs.com', status: '维护', lastContact: '2026-03-15', totalOrders: 20, totalSpent: 89200, notes: '大客户，每季度review价格', discount: 10 },
  { id: 6, company: 'Penang Metal Works', contact: 'Ong', phone: '014-567 8901', email: 'ong@pmw.com', status: '跟进中', lastContact: '2026-03-21', totalOrders: 1, totalSpent: 3200, notes: '第一单已完成，等他回购', discount: 0 },
]

export const DEFAULT_INVENTORY = [
  { id: 1, name: 'Steel Pipe 40mm × 6m', sku: 'SP-40-6M', stock: 450, minStock: 100, price: 32, costPrice: 22, unit: '根' },
  { id: 2, name: 'Aluminium Sheet 2mm × 1200mm', sku: 'AS-2-1200', stock: 180, minStock: 50, price: 36, costPrice: 24, unit: '片' },
  { id: 3, name: 'Stainless Bolt M12 (box/100)', sku: 'SB-M12', stock: 85, minStock: 80, price: 28, costPrice: 18, unit: '盒' },
  { id: 4, name: 'Copper Wire 2.5mm (100m roll)', sku: 'CW-25-100', stock: 12, minStock: 30, price: 145, costPrice: 98, unit: '卷' },
  { id: 5, name: 'Galvanized Pipe 50mm × 6m', sku: 'GP-50-6M', stock: 320, minStock: 80, price: 45, costPrice: 30, unit: '根' },
  { id: 6, name: 'Iron Plate 3mm × 1200mm', sku: 'IP-3-1200', stock: 0, minStock: 40, price: 52, costPrice: 35, unit: '片' },
  { id: 7, name: 'Brass Fitting 25mm', sku: 'BF-25', stock: 500, minStock: 200, price: 8.50, costPrice: 5.20, unit: '个' },
  { id: 8, name: 'PVC Pipe 32mm × 4m', sku: 'PP-32-4M', stock: 200, minStock: 100, price: 12, costPrice: 7.50, unit: '根' },
]

export const STATUS_LABELS = {
  '成交': { color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  '跟进中': { color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  '潜在': { color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  '维护': { color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20' },
}

export const QUOTE_STATUSES = {
  draft: { label: '草稿', color: 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20' },
  sent: { label: '已发送', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  accepted: { label: '已接受', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  rejected: { label: '已拒绝', color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20' },
  invoiced: { label: '已开票', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20' },
}

export const PAYMENT_STATUSES = {
  unpaid: { label: '未付款', color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20' },
  partial: { label: '部分付款', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  paid: { label: '已付清', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
}

// Sample quotes for demo purposes
export const SAMPLE_QUOTES = [
  {
    id: 22, num: 'QT-2026-022', status: 'invoiced', paymentStatus: 'paid', paidAmount: 7128,
    client: { company: 'ABC Hardware Sdn Bhd', contact: 'Mr. Tan', tel: '012-345 6789', email: 'tan@abc.com', addr: '' },
    items: [{ desc: 'Steel Pipe 40mm × 6m', qty: 80, price: 32, costPrice: 22 }, { desc: 'Stainless Bolt M12 (box/100)', qty: 50, price: 28, costPrice: 18 }],
    total: 7128, subtotal: 3960, discount: 5, sst: true, shipping: 150,
    date: '2026-03-10', dueDate: '2026-04-09', invoiceNum: 'INV-2026-022', invoiceDate: '2026-03-12',
    notes: 'Payment: 30 days from invoice date',
  },
  {
    id: 23, num: 'QT-2026-023', status: 'invoiced', paymentStatus: 'partial', paidAmount: 3000,
    client: { company: 'Soon Heng Auto Parts', contact: '林老板', tel: '013-456 7890', email: 'sh@auto.com', addr: '' },
    items: [{ desc: 'Brass Fitting 25mm', qty: 200, price: 8.50, costPrice: 5.20 }, { desc: 'Copper Wire 2.5mm (100m roll)', qty: 10, price: 145, costPrice: 98 }],
    total: 5508, subtotal: 3150, discount: 3, sst: true, shipping: 80,
    date: '2026-03-15', dueDate: '2026-04-14', invoiceNum: 'INV-2026-023', invoiceDate: '2026-03-17',
    notes: 'Partial payment received RM3000 on 2026-03-25',
  },
  {
    id: 24, num: 'QT-2026-024', status: 'sent', paymentStatus: 'unpaid', paidAmount: 0,
    client: { company: 'Mega Construction', contact: 'David Lee', tel: '016-789 0123', email: 'david@mega.com', addr: '' },
    items: [{ desc: 'Steel Pipe 40mm × 6m', qty: 500, price: 32, costPrice: 22 }, { desc: 'Galvanized Pipe 50mm × 6m', qty: 200, price: 45, costPrice: 30 }],
    total: 28080, subtotal: 25000, discount: 0, sst: true, shipping: 500,
    date: '2026-03-22', dueDate: null, invoiceNum: null, invoiceDate: null,
    notes: 'Big project quotation — follow up by March 30',
  },
]
