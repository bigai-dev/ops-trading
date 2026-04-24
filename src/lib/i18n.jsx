import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const LANGS = {
  zh: { label: '中文', flag: '🇨🇳' },
  en: { label: 'English', flag: '🇬🇧' },
  bm: { label: 'Bahasa', flag: '🇲🇾' },
}

const translations = {
  // ─── Navigation & Layout ───
  'nav.dashboard': { zh: 'Dashboard', en: 'Dashboard', bm: 'Dashboard' },
  'nav.orders': { zh: '订单管理', en: 'Orders', bm: 'Pesanan' },
  'nav.crm': { zh: '客户 CRM', en: 'CRM', bm: 'CRM Pelanggan' },
  'nav.quote': { zh: '报价单', en: 'Quote Builder', bm: 'Sebut Harga' },
  'nav.inventory': { zh: '库存管理', en: 'Inventory', bm: 'Inventori' },

  'header.dashboard': { zh: 'Dashboard', en: 'Dashboard', bm: 'Dashboard' },
  'header.dashboard.sub': { zh: 'Business Overview', en: 'Business Overview', bm: 'Ringkasan Perniagaan' },
  'header.orders': { zh: '订单管理', en: 'Order Management', bm: 'Pengurusan Pesanan' },
  'header.orders.sub': { zh: 'Order Management', en: 'Order Management', bm: 'Pengurusan Pesanan' },
  'header.crm': { zh: '客户 CRM', en: 'Customer CRM', bm: 'CRM Pelanggan' },
  'header.crm.sub': { zh: 'Customer Relationship', en: 'Customer Relationship', bm: 'Hubungan Pelanggan' },
  'header.quote': { zh: '报价单', en: 'Quote Builder', bm: 'Pembina Sebut Harga' },
  'header.quote.sub': { zh: 'Quote Builder', en: 'Quote Builder', bm: 'Pembina Sebut Harga' },
  'header.inventory': { zh: '库存管理', en: 'Inventory Control', bm: 'Kawalan Inventori' },
  'header.inventory.sub': { zh: 'Inventory Control', en: 'Inventory Control', bm: 'Kawalan Inventori' },

  // ─── Sidebar Actions ───
  'sidebar.exportAll': { zh: '导出 Excel', en: 'Export Excel', bm: 'Eksport Excel' },
  'sidebar.darkMode': { zh: '暗色模式', en: 'Dark Mode', bm: 'Mod Gelap' },
  'sidebar.lightMode': { zh: '亮色模式', en: 'Light Mode', bm: 'Mod Cerah' },
  'sidebar.reset': { zh: '重置数据', en: 'Reset Data', bm: 'Set Semula' },
  'sidebar.collapse': { zh: '收起侧边栏', en: 'Collapse sidebar', bm: 'Tutup bar sisi' },
  'sidebar.expand': { zh: '展开侧边栏', en: 'Expand sidebar', bm: 'Buka bar sisi' },
  'sidebar.openMenu': { zh: '打开菜单', en: 'Open menu', bm: 'Buka menu' },
  'sidebar.closeMenu': { zh: '关闭菜单', en: 'Close menu', bm: 'Tutup menu' },
  'sidebar.language': { zh: '语言', en: 'Language', bm: 'Bahasa' },

  // ─── Common ───
  'common.search': { zh: '搜索...', en: 'Search...', bm: 'Cari...' },
  'common.export': { zh: '导出', en: 'Export', bm: 'Eksport' },
  'common.import': { zh: '导入', en: 'Import', bm: 'Import' },
  'common.exportExcel': { zh: '导出 Excel', en: 'Export Excel', bm: 'Eksport Excel' },
  'common.importExcel': { zh: '导入 Excel', en: 'Import Excel', bm: 'Import Excel' },
  'common.all': { zh: '全部', en: 'All', bm: 'Semua' },
  'common.notes': { zh: '备注', en: 'Notes', bm: 'Nota' },
  'common.save': { zh: '保存', en: 'Save', bm: 'Simpan' },
  'common.cancel': { zh: '取消', en: 'Cancel', bm: 'Batal' },
  'common.confirm': { zh: '确认', en: 'Confirm', bm: 'Sahkan' },
  'common.delete': { zh: '删除', en: 'Delete', bm: 'Padam' },
  'common.edit': { zh: '编辑', en: 'Edit', bm: 'Edit' },
  'common.add': { zh: '添加', en: 'Add', bm: 'Tambah' },
  'common.noData': { zh: '暂无数据', en: 'No data', bm: 'Tiada data' },
  'common.notifications': { zh: '通知', en: 'Notifications', bm: 'Notifikasi' },

  // ─── Dashboard ───
  'dash.totalRevenue': { zh: '总营收', en: 'Total Revenue', bm: 'Jumlah Hasil' },
  'dash.totalOrders': { zh: '总订单', en: 'Total Orders', bm: 'Jumlah Pesanan' },
  'dash.activeClients': { zh: '活跃客户', en: 'Active Clients', bm: 'Pelanggan Aktif' },
  'dash.avgMargin': { zh: '平均利润率', en: 'Avg Margin', bm: 'Margin Purata' },
  'dash.collected': { zh: '已收款', en: 'Collected', bm: 'Telah Diterima' },
  'dash.outstanding': { zh: '应收未付', en: 'Outstanding', bm: 'Belum Dibayar' },
  'dash.overdueInvoices': { zh: '逾期发票', en: 'Overdue Invoices', bm: 'Invois Tertunggak' },
  'dash.clientRevenue': { zh: '客户营收排行', en: 'Client Revenue Ranking', bm: 'Kedudukan Hasil Pelanggan' },
  'dash.inventoryStatus': { zh: '库存状态', en: 'Inventory Status', bm: 'Status Inventori' },
  'dash.paymentDist': { zh: '付款状态分布', en: 'Payment Distribution', bm: 'Taburan Pembayaran' },
  'dash.agingReport': { zh: '应收账龄分析', en: 'Aging Analysis', bm: 'Analisis Penuaan' },
  'dash.exportAll': { zh: '导出全部 Excel', en: 'Export All Excel', bm: 'Eksport Semua Excel' },
  'dash.orders': { zh: '单', en: '', bm: '' },
  'dash.clients': { zh: '个', en: '', bm: '' },
  'dash.invoices': { zh: '张', en: '', bm: '' },
  'dash.sufficient': { zh: '充足', en: 'OK', bm: 'Cukup' },
  'dash.low': { zh: '偏低', en: 'Low', bm: 'Rendah' },
  'dash.outOfStock': { zh: '缺货', en: 'Out', bm: 'Habis' },
  'dash.paid': { zh: '已付清', en: 'Paid', bm: 'Dibayar' },
  'dash.partial': { zh: '部分付', en: 'Partial', bm: 'Separa' },
  'dash.unpaid': { zh: '未付款', en: 'Unpaid', bm: 'Belum Bayar' },
  'dash.current': { zh: '未到期', en: 'Current', bm: 'Semasa' },
  'dash.days30': { zh: '1-30天', en: '1-30d', bm: '1-30h' },
  'dash.days60': { zh: '31-60天', en: '31-60d', bm: '31-60h' },
  'dash.days90': { zh: '60天+', en: '60d+', bm: '60h+' },
  'dash.revenue': { zh: '营收', en: 'Revenue', bm: 'Hasil' },
  'dash.unpaidAmount': { zh: '未付金额', en: 'Unpaid', bm: 'Belum Bayar' },

  // ─── Quote Builder ───
  'quote.clientInfo': { zh: '客户信息', en: 'Client Info', bm: 'Info Pelanggan' },
  'quote.selectClient': { zh: '— 选择已有客户 —', en: '— Select Client —', bm: '— Pilih Pelanggan —' },
  'quote.company': { zh: '公司名称', en: 'Company', bm: 'Syarikat' },
  'quote.contact': { zh: '联系人', en: 'Contact', bm: 'Kenalan' },
  'quote.phone': { zh: '电话', en: 'Phone', bm: 'Telefon' },
  'quote.email': { zh: 'Email', en: 'Email', bm: 'Emel' },
  'quote.items': { zh: '报价项目', en: 'Quote Items', bm: 'Item Sebut Harga' },
  'quote.addFromInventory': { zh: '+ 从库存添加', en: '+ From Inventory', bm: '+ Dari Inventori' },
  'quote.addCustom': { zh: '+ 自定义', en: '+ Custom', bm: '+ Custom' },
  'quote.productName': { zh: '产品名称', en: 'Product name', bm: 'Nama produk' },
  'quote.discount': { zh: '折扣 (%)', en: 'Discount (%)', bm: 'Diskaun (%)' },
  'quote.shipping': { zh: '运费 (RM)', en: 'Shipping (RM)', bm: 'Penghantaran (RM)' },
  'quote.marginAnalysis': { zh: '利润分析:', en: 'Margin:', bm: 'Margin:' },
  'quote.cost': { zh: '成本', en: 'Cost', bm: 'Kos' },
  'quote.marginRate': { zh: '利润率', en: 'Margin', bm: 'Margin' },
  'quote.generate': { zh: '生成报价单', en: 'Generate Quote', bm: 'Jana Sebut Harga' },
  'quote.downloadPDF': { zh: '下载 PDF', en: 'Download PDF', bm: 'Muat Turun PDF' },
  'quote.new': { zh: '新报价', en: 'New Quote', bm: 'Sebut Harga Baru' },
  'quote.preview': { zh: '报价单预览', en: 'Quote Preview', bm: 'Pratonton Sebut Harga' },

  // ─── Orders ───
  'orders.all': { zh: '全部', en: 'All', bm: 'Semua' },
  'orders.draft': { zh: '草稿', en: 'Draft', bm: 'Draf' },
  'orders.sent': { zh: '已发送', en: 'Sent', bm: 'Dihantar' },
  'orders.accepted': { zh: '已接受', en: 'Accepted', bm: 'Diterima' },
  'orders.invoiced': { zh: '已开票', en: 'Invoiced', bm: 'Diinvois' },
  'orders.rejected': { zh: '已拒绝', en: 'Rejected', bm: 'Ditolak' },
  'orders.allPayment': { zh: '全部付款', en: 'All Payment', bm: 'Semua Bayaran' },
  'orders.unpaid': { zh: '未付款', en: 'Unpaid', bm: 'Belum Bayar' },
  'orders.partial': { zh: '部分付', en: 'Partial', bm: 'Separa' },
  'orders.paid': { zh: '已付清', en: 'Paid', bm: 'Dibayar' },
  'orders.searchPlaceholder': { zh: '搜索报价单号、客户...', en: 'Search quote #, client...', bm: 'Cari no sebut harga, pelanggan...' },
  'orders.totalQuotes': { zh: '全部报价', en: 'Total Quotes', bm: 'Jumlah Sebut Harga' },
  'orders.pending': { zh: '待处理', en: 'Pending', bm: 'Menunggu' },
  'orders.quoteNum': { zh: '报价单号', en: 'Quote #', bm: 'No. Sebut Harga' },
  'orders.date': { zh: '日期', en: 'Date', bm: 'Tarikh' },
  'orders.client': { zh: '客户', en: 'Client', bm: 'Pelanggan' },
  'orders.amount': { zh: '金额 (RM)', en: 'Amount (RM)', bm: 'Jumlah (RM)' },
  'orders.status': { zh: '状态', en: 'Status', bm: 'Status' },
  'orders.payment': { zh: '付款', en: 'Payment', bm: 'Bayaran' },
  'orders.invoice': { zh: '发票', en: 'Invoice', bm: 'Invois' },
  'orders.actions': { zh: '操作', en: 'Actions', bm: 'Tindakan' },
  'orders.noRecords': { zh: '暂无报价记录', en: 'No records', bm: 'Tiada rekod' },
  'orders.markSent': { zh: '标记已发送', en: 'Mark Sent', bm: 'Tanda Dihantar' },
  'orders.clientAccepted': { zh: '客户接受', en: 'Accepted', bm: 'Diterima' },
  'orders.clientRejected': { zh: '客户拒绝', en: 'Rejected', bm: 'Ditolak' },
  'orders.generateInvoice': { zh: '生成发票', en: 'Generate Invoice', bm: 'Jana Invois' },
  'orders.recordPayment': { zh: '记录付款', en: 'Record Payment', bm: 'Rekod Bayaran' },
  'orders.duplicateQuote': { zh: '复制报价', en: 'Duplicate', bm: 'Salin' },
  'orders.quoteItems': { zh: '报价项目', en: 'Quote Items', bm: 'Item Sebut Harga' },
  'orders.total': { zh: '总金额', en: 'Total', bm: 'Jumlah' },
  'orders.invoiceInfo': { zh: '发票信息', en: 'Invoice Info', bm: 'Info Invois' },
  'orders.invoiceNum': { zh: '发票号', en: 'Invoice #', bm: 'No. Invois' },
  'orders.invoiceDate': { zh: '开票日期', en: 'Invoice Date', bm: 'Tarikh Invois' },
  'orders.dueDate': { zh: '付款期限', en: 'Due Date', bm: 'Tarikh Akhir' },
  'orders.paymentRecord': { zh: '付款记录', en: 'Payment Record', bm: 'Rekod Bayaran' },
  'orders.paidAmount': { zh: '已付', en: 'Paid', bm: 'Dibayar' },
  'orders.unpaidAmount': { zh: '未付', en: 'Unpaid', bm: 'Belum Bayar' },
  'orders.payFullAmount': { zh: '付清全款', en: 'Pay Full', bm: 'Bayar Penuh' },
  'orders.confirmPayment': { zh: '确认付款', en: 'Confirm Payment', bm: 'Sahkan Bayaran' },
  'orders.paymentAmount': { zh: '付款金额 (RM)', en: 'Payment Amount (RM)', bm: 'Jumlah Bayaran (RM)' },
  'orders.balance': { zh: '未付余额', en: 'Balance', bm: 'Baki' },
  'orders.lifecycle': { zh: '报价流程', en: 'Lifecycle', bm: 'Kitaran' },
  'orders.rejectedMsg': { zh: '报价已被客户拒绝', en: 'Quote rejected by client', bm: 'Sebut harga ditolak' },

  // ─── CRM ───
  'crm.searchPlaceholder': { zh: '搜索公司、联系人...', en: 'Search company, contact...', bm: 'Cari syarikat, kenalan...' },
  'crm.newClient': { zh: '新客户', en: 'New Client', bm: 'Pelanggan Baru' },
  'crm.addClient': { zh: '添加新客户', en: 'Add New Client', bm: 'Tambah Pelanggan' },
  'crm.addBtn': { zh: '添加客户', en: 'Add Client', bm: 'Tambah' },
  'crm.discount': { zh: '专属折扣', en: 'Discount', bm: 'Diskaun' },
  'crm.editDiscount': { zh: '修改专属折扣 (%)', en: 'Edit Discount (%)', bm: 'Edit Diskaun (%)' },
  'crm.totalOrders': { zh: '总订单', en: 'Orders', bm: 'Pesanan' },
  'crm.totalSpent': { zh: '总消费', en: 'Spent', bm: 'Belanja' },
  'crm.lastContact': { zh: '最后联系', en: 'Last Contact', bm: 'Hubungan Terakhir' },
  'crm.overdue': { zh: '超过5天未跟进', en: 'Overdue 5+ days', bm: 'Tertunggak 5+ hari' },
  'crm.status.deal': { zh: '成交', en: 'Deal', bm: 'Perjanjian' },
  'crm.status.following': { zh: '跟进中', en: 'Following', bm: 'Susulan' },
  'crm.status.potential': { zh: '潜在', en: 'Potential', bm: 'Potensi' },
  'crm.status.maintain': { zh: '维护', en: 'Maintain', bm: 'Selenggara' },
  'crm.orders': { zh: '单', en: '', bm: '' },

  // ─── Inventory ───
  'inv.title': { zh: '库存管理', en: 'Inventory', bm: 'Inventori' },
  'inv.searchPlaceholder': { zh: '搜索产品、SKU...', en: 'Search product, SKU...', bm: 'Cari produk, SKU...' },
  'inv.totalValueSell': { zh: '库存总值（售价）', en: 'Stock Value (Sell)', bm: 'Nilai Stok (Jual)' },
  'inv.totalValueCost': { zh: '库存总值（成本）', en: 'Stock Value (Cost)', bm: 'Nilai Stok (Kos)' },
  'inv.avgMargin': { zh: '平均利润率', en: 'Avg Margin', bm: 'Margin Purata' },
  'inv.productName': { zh: '产品名称', en: 'Product', bm: 'Produk' },
  'inv.stock': { zh: '库存', en: 'Stock', bm: 'Stok' },
  'inv.minStock': { zh: '最低', en: 'Min', bm: 'Min' },
  'inv.stockRatio': { zh: '库存比', en: 'Ratio', bm: 'Nisbah' },
  'inv.sellPrice': { zh: '售价', en: 'Sell', bm: 'Jual' },
  'inv.costPrice': { zh: '成本价', en: 'Cost', bm: 'Kos' },
  'inv.margin': { zh: '利润率', en: 'Margin', bm: 'Margin' },
  'inv.status': { zh: '状态', en: 'Status', bm: 'Status' },
  'inv.sufficient': { zh: '充足', en: 'OK', bm: 'Cukup' },
  'inv.low': { zh: '偏低', en: 'Low', bm: 'Rendah' },
  'inv.outOfStock': { zh: '缺货', en: 'Out', bm: 'Habis' },

  // ─── AI Forecast ───
  'nav.forecast': { zh: 'AI 预测', en: 'AI Forecast', bm: 'Ramalan AI' },
  'header.forecast': { zh: 'AI 销售预测', en: 'AI Sales Forecast', bm: 'Ramalan Jualan AI' },
  'header.forecast.sub': { zh: 'AI-Powered Insights', en: 'AI-Powered Insights', bm: 'Pandangan Berkuasa AI' },
  'ai.revenueForecast': { zh: '营收预测（未来6个月）', en: 'Revenue Forecast (Next 6 Months)', bm: 'Ramalan Hasil (6 Bulan Akan Datang)' },
  'ai.predicted': { zh: '预测', en: 'Predicted', bm: 'Ramalan' },
  'ai.actual': { zh: '实际', en: 'Actual', bm: 'Sebenar' },
  'ai.confidence': { zh: '置信区间', en: 'Confidence', bm: 'Keyakinan' },
  'ai.clientForecast': { zh: '客户购买预测', en: 'Client Purchase Forecast', bm: 'Ramalan Pembelian Pelanggan' },
  'ai.nextOrder': { zh: '预计下次下单', en: 'Est. Next Order', bm: 'Anggaran Pesanan Seterusnya' },
  'ai.predictedValue': { zh: '预计金额', en: 'Est. Amount', bm: 'Anggaran Jumlah' },
  'ai.probability': { zh: '概率', en: 'Probability', bm: 'Kebarangkalian' },
  'ai.trend': { zh: '趋势', en: 'Trend', bm: 'Trend' },
  'ai.up': { zh: '上升', en: 'Up', bm: 'Naik' },
  'ai.down': { zh: '下降', en: 'Down', bm: 'Turun' },
  'ai.stable': { zh: '稳定', en: 'Stable', bm: 'Stabil' },
  'ai.stockForecast': { zh: '库存预警预测', en: 'Stock Alert Forecast', bm: 'Ramalan Amaran Stok' },
  'ai.reorderDate': { zh: '建议补货日期', en: 'Reorder By', bm: 'Pesan Sebelum' },
  'ai.reorderQty': { zh: '建议补货量', en: 'Reorder Qty', bm: 'Kuantiti Pesanan' },
  'ai.daysLeft': { zh: '天后断货', en: 'days left', bm: 'hari lagi' },
  'ai.riskScore': { zh: '风险评分', en: 'Risk Score', bm: 'Skor Risiko' },
  'ai.cashFlow': { zh: '现金流预测', en: 'Cash Flow Forecast', bm: 'Ramalan Aliran Tunai' },
  'ai.inflow': { zh: '预计收入', en: 'Inflow', bm: 'Aliran Masuk' },
  'ai.outflow': { zh: '预计支出', en: 'Outflow', bm: 'Aliran Keluar' },
  'ai.net': { zh: '净现金流', en: 'Net Cash', bm: 'Tunai Bersih' },
  'ai.insights': { zh: 'AI 洞察', en: 'AI Insights', bm: 'Pandangan AI' },
  'ai.generatedAt': { zh: '预测生成于', en: 'Generated at', bm: 'Dijana pada' },
  'ai.poweredBy': { zh: '由 AI 模型驱动 · 基于历史数据分析', en: 'Powered by AI · Based on historical data', bm: 'Dikuasakan AI · Berdasarkan data sejarah' },
  'ai.highRisk': { zh: '高风险', en: 'High Risk', bm: 'Risiko Tinggi' },
  'ai.medRisk': { zh: '中风险', en: 'Med Risk', bm: 'Risiko Sederhana' },
  'ai.lowRisk': { zh: '低风险', en: 'Low Risk', bm: 'Risiko Rendah' },
  'ai.product': { zh: '产品', en: 'Product', bm: 'Produk' },
  'ai.velocity': { zh: '消耗速度', en: 'Velocity', bm: 'Kelajuan' },
  'ai.perWeek': { zh: '/周', en: '/wk', bm: '/mg' },

  // ─── Quote & Payment Status Badges ───
  'status.draft': { zh: '草稿', en: 'Draft', bm: 'Draf' },
  'status.sent': { zh: '已发送', en: 'Sent', bm: 'Dihantar' },
  'status.accepted': { zh: '已接受', en: 'Accepted', bm: 'Diterima' },
  'status.rejected': { zh: '已拒绝', en: 'Rejected', bm: 'Ditolak' },
  'status.invoiced': { zh: '已开票', en: 'Invoiced', bm: 'Diinvois' },
  'pay.unpaid': { zh: '未付款', en: 'Unpaid', bm: 'Belum Bayar' },
  'pay.partial': { zh: '部分付款', en: 'Partial', bm: 'Separa' },
  'pay.paid': { zh: '已付清', en: 'Paid', bm: 'Dibayar' },

  // ─── Inventory Units ───
  'unit.根': { zh: '根', en: 'pcs', bm: 'btg' },
  'unit.片': { zh: '片', en: 'pcs', bm: 'kpg' },
  'unit.盒': { zh: '盒', en: 'box', bm: 'ktk' },
  'unit.卷': { zh: '卷', en: 'roll', bm: 'gul' },
  'unit.个': { zh: '个', en: 'pcs', bm: 'bh' },

  // ─── Toast Messages ───
  'toast.quoteGenerated': { zh: '✅ 报价单 {num} 已生成', en: '✅ Quote {num} generated', bm: '✅ Sebut harga {num} dijana' },
  'toast.viewInOrders': { zh: '📄 可在订单管理查看和跟进', en: '📄 View & track in Orders', bm: '📄 Lihat & jejak di Pesanan' },
  'toast.discountApplied': { zh: '已自动应用 {company} 专属折扣 {discount}%', en: 'Applied {company} discount {discount}%', bm: 'Diskaun {company} {discount}% digunakan' },
  'toast.clientAdded': { zh: '✅ 已添加客户 {name}', en: '✅ Client {name} added', bm: '✅ Pelanggan {name} ditambah' },
  'toast.imported': { zh: '✅ 已导入 {count} 条记录', en: '✅ Imported {count} records', bm: '✅ {count} rekod diimport' },
  'toast.importFailed': { zh: '❌ Excel 文件读取失败', en: '❌ Failed to read Excel', bm: '❌ Gagal membaca Excel' },

  // ─── CRM Extra ───
  'crm.viewDetail': { zh: '查看 {name} 详情', en: 'View {name} details', bm: 'Lihat butiran {name}' },
  'crm.discountLabel': { zh: '专属折扣: {pct}%', en: 'Discount: {pct}%', bm: 'Diskaun: {pct}%' },
  'crm.ordersCount': { zh: '订单: {count} 单', en: 'Orders: {count}', bm: 'Pesanan: {count}' },
  'crm.status': { zh: '状态', en: 'Status', bm: 'Status' },
  'crm.notesPlaceholder': { zh: '备注信息...', en: 'Notes...', bm: 'Nota...' },

  // ─── Inventory Extra ───
  'inv.importedProducts': { zh: '✅ 已导入 {count} 个产品', en: '✅ Imported {count} products', bm: '✅ {count} produk diimport' },

  // ─── Quote Extra ───
  'quote.discountSuffix': { zh: '折扣', en: 'disc', bm: 'diskaun' },
  'quote.stockLabel': { zh: '库存', en: 'Stock', bm: 'Stok' },

  // ─── KPI ───
  'kpi.vsYesterday': { zh: '较昨日', en: 'vs yesterday', bm: 'vs semalam' },

  // ─── Notifications (store) ───
  'notif.stockZero': { zh: '库存已清零', en: 'Out of stock', bm: 'Stok habis' },
  'notif.stockLow': { zh: '库存偏低', en: 'Stock low', bm: 'Stok rendah' },
  'notif.overdueFollow': { zh: '超过5天未跟进', en: 'Overdue 5+ days', bm: 'Tertunggak 5+ hari' },
  'notif.invoiceOverdue': { zh: '已过付款期限', en: 'Payment overdue', bm: 'Bayaran tertunggak' },
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('qf_lang') || 'zh')

  const changeLang = useCallback((newLang) => {
    setLang(newLang)
    localStorage.setItem('qf_lang', newLang)
  }, [])

  const t = useCallback((key, params) => {
    const entry = translations[key]
    if (!entry) return key
    let text = entry[lang] ?? entry.zh ?? key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }, [lang])

  const value = useMemo(() => ({ lang, setLang: changeLang, t, langs: LANGS }), [lang, changeLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export { LANGS }
