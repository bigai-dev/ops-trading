import { FileText, ClipboardList, Users, Package, LayoutDashboard, BrainCircuit } from 'lucide-react'

// Each screen has its own address (app/<path>/page.jsx); `key` names its header text
export const NAV_ITEMS = [
  { key: 'dashboard', path: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { key: 'orders', path: '/orders', labelKey: 'nav.orders', icon: ClipboardList, badgeKey: 'unpaid' },
  { key: 'crm', path: '/crm', labelKey: 'nav.crm', icon: Users, badgeKey: 'overdue' },
  { key: 'quote', path: '/quotes', labelKey: 'nav.quote', icon: FileText },
  { key: 'inventory', path: '/inventory', labelKey: 'nav.inventory', icon: Package, badgeKey: 'lowStock' },
  { key: 'forecast', path: '/forecast', labelKey: 'nav.forecast', icon: BrainCircuit },
]

// The nav item for an address ("/" only matches exactly; others also match sub-addresses)
export function navItemFor(pathname) {
  return NAV_ITEMS.find(item =>
    item.path === '/' ? pathname === '/' : pathname === item.path || pathname.startsWith(`${item.path}/`)
  )
}
