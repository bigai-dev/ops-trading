import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CLIENTS, DEFAULT_INVENTORY, SAMPLE_QUOTES } from './data'

export const useQuoteFlowStore = create(
  persist(
    (set, get) => ({
      clients: structuredClone(DEFAULT_CLIENTS),
      inventory: structuredClone(DEFAULT_INVENTORY),
      quoteCounter: 24,
      quotes: structuredClone(SAMPLE_QUOTES),

      // ─── Quote Actions ───
      addQuote: (quote) => {
        const counter = get().quoteCounter + 1
        const newQuote = {
          ...quote,
          id: counter,
          num: `QT-2026-${String(counter).padStart(3, '0')}`,
          status: 'draft',
          paymentStatus: 'unpaid',
          paidAmount: 0,
          invoiceNum: null,
          invoiceDate: null,
          dueDate: null,
        }
        set(state => ({
          quotes: [newQuote, ...state.quotes],
          quoteCounter: counter,
        }))
        return counter
      },

      updateQuoteStatus: (id, status) => {
        set(state => ({
          quotes: state.quotes.map(q => q.id === id ? { ...q, status } : q),
        }))
      },

      generateInvoice: (quoteId) => {
        const quote = get().quotes.find(q => q.id === quoteId)
        if (!quote || quote.status === 'invoiced') return null
        const invoiceNum = `INV-2026-${String(quoteId).padStart(3, '0')}`
        const invoiceDate = new Date().toISOString().split('T')[0]
        const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        set(state => ({
          quotes: state.quotes.map(q => q.id === quoteId ? {
            ...q, status: 'invoiced', invoiceNum, invoiceDate, dueDate,
          } : q),
        }))
        return invoiceNum
      },

      recordPayment: (quoteId, amount) => {
        set(state => ({
          quotes: state.quotes.map(q => {
            if (q.id !== quoteId) return q
            const newPaid = q.paidAmount + amount
            const paymentStatus = newPaid >= q.total ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid'
            return { ...q, paidAmount: newPaid, paymentStatus }
          }),
        }))
      },

      duplicateQuote: (quoteId) => {
        const original = get().quotes.find(q => q.id === quoteId)
        if (!original) return null
        const counter = get().quoteCounter + 1
        const newQuote = {
          ...structuredClone(original),
          id: counter,
          num: `QT-2026-${String(counter).padStart(3, '0')}`,
          status: 'draft',
          paymentStatus: 'unpaid',
          paidAmount: 0,
          invoiceNum: null,
          invoiceDate: null,
          dueDate: null,
          date: new Date().toISOString().split('T')[0],
        }
        set(state => ({
          quotes: [newQuote, ...state.quotes],
          quoteCounter: counter,
        }))
        return counter
      },

      // ─── Client Actions ───
      updateClient: (id, updates) => {
        set(state => ({
          clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c),
        }))
      },

      addClient: (client) => {
        set(state => {
          const maxId = Math.max(0, ...state.clients.map(c => c.id))
          return { clients: [...state.clients, { ...client, id: maxId + 1 }] }
        })
      },

      // ─── Inventory Actions ───
      updateInventoryItem: (id, updates) => {
        set(state => ({
          inventory: state.inventory.map(i => i.id === id ? { ...i, ...updates } : i),
        }))
      },

      importInventory: (items) => {
        set({ inventory: items })
      },

      importClients: (clients) => {
        set({ clients })
      },

      // ─── Computed Getters ───
      getLowStockCount: () => {
        return get().inventory.filter(i => i.stock === 0 || i.stock <= i.minStock * 1.2).length
      },

      getOverdueClients: () => {
        const ref = new Date('2026-03-24')
        return get().clients.filter(c => {
          if (c.status === '成交' || c.status === '维护') return false
          const last = new Date(c.lastContact)
          return (ref - last) / (1000 * 60 * 60 * 24) > 5
        })
      },

      getNotifications: () => {
        const state = get()
        const notifs = []
        const lowStock = state.inventory.filter(i => i.stock === 0 || i.stock <= i.minStock * 1.2)
        lowStock.forEach(i => notifs.push({ text: `📦 ${i.name} 库存${i.stock === 0 ? '已清零' : '偏低'}` }))
        const overdue = state.getOverdueClients()
        overdue.forEach(c => notifs.push({ text: `⏰ ${c.company} 超过5天未跟进` }))
        // Overdue invoices
        const today = new Date()
        state.quotes
          .filter(q => q.status === 'invoiced' && q.paymentStatus !== 'paid' && q.dueDate)
          .forEach(q => {
            if (new Date(q.dueDate) < today) {
              notifs.push({ text: `💰 ${q.invoiceNum} 已过付款期限` })
            }
          })
        return notifs
      },

      getRevenueSummary: () => {
        const { clients, quotes } = get()
        const invoiced = quotes.filter(q => q.status === 'invoiced')
        const totalOutstanding = invoiced.reduce((s, q) => s + (q.total - (q.paidAmount || 0)), 0)
        const totalCollected = invoiced.reduce((s, q) => s + (q.paidAmount || 0), 0)
        return {
          totalRevenue: clients.reduce((s, c) => s + c.totalSpent, 0),
          totalOrders: clients.reduce((s, c) => s + c.totalOrders, 0),
          activeClients: clients.filter(c => c.status === '成交' || c.status === '维护').length,
          totalOutstanding,
          totalCollected,
          invoiceCount: invoiced.length,
          overdueInvoices: invoiced.filter(q => q.paymentStatus !== 'paid' && q.dueDate && new Date(q.dueDate) < new Date()).length,
        }
      },

      getMarginSummary: () => {
        const inv = get().inventory
        const totalCost = inv.reduce((s, i) => s + i.costPrice * i.stock, 0)
        const totalValue = inv.reduce((s, i) => s + i.price * i.stock, 0)
        const avgMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue * 100) : 0
        return { totalCost, totalValue, avgMargin }
      },

      getAgingReport: () => {
        const today = new Date()
        const quotes = get().quotes.filter(q => q.status === 'invoiced' && q.paymentStatus !== 'paid' && q.dueDate)
        const buckets = { current: [], days30: [], days60: [], days90: [] }
        quotes.forEach(q => {
          const due = new Date(q.dueDate)
          const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24))
          const outstanding = q.total - (q.paidAmount || 0)
          const entry = { ...q, daysOverdue, outstanding }
          if (daysOverdue <= 0) buckets.current.push(entry)
          else if (daysOverdue <= 30) buckets.days30.push(entry)
          else if (daysOverdue <= 60) buckets.days60.push(entry)
          else buckets.days90.push(entry)
        })
        return buckets
      },

      resetAll: () => {
        set({
          clients: structuredClone(DEFAULT_CLIENTS),
          inventory: structuredClone(DEFAULT_INVENTORY),
          quoteCounter: 24,
          quotes: structuredClone(SAMPLE_QUOTES),
        })
      },
    }),
    {
      name: 'qf_store',
      version: 2,
      migrate: () => ({
        clients: structuredClone(DEFAULT_CLIENTS),
        inventory: structuredClone(DEFAULT_INVENTORY),
        quoteCounter: 24,
        quotes: structuredClone(SAMPLE_QUOTES),
      }),
    }
  )
)
