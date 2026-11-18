import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/Sidebar'
import { navItemFor } from '@/lib/nav'
import { useQuoteFlowStore } from '@/store'
import { Bell, Menu } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

// Sidebar + header shared by every screen. Each screen has its own address
// under app/ (e.g. app/quotes/page.jsx) and arrives here as `children`.
export function QuoteFlowLayout({ children }) {
  const pathname = usePathname()
  const tab = navItemFor(pathname)?.key ?? 'dashboard'
  const { getNotifications, getLowStockCount, getOverdueClients, quotes } = useQuoteFlowStore()
  const { t } = useI18n()
  const notifications = getNotifications()
  const lowStockCount = getLowStockCount()
  const overdueCount = getOverdueClients().length
  const unpaidCount = quotes.filter(q => q.status === 'invoiced' && q.paymentStatus !== 'paid').length

  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const badges = { unpaid: unpaidCount, overdue: overdueCount, lowStock: lowStockCount }
  const title = t(`header.${tab}`)
  const subtitle = t(`header.${tab}.sub`)

  return (
    <div data-theme="quoteflow" className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        badges={badges}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('sidebar.openMenu')}
            >
              <Menu size={18} />
            </Button>
            <div>
              <h1 className="text-base font-bold heading-font tracking-tight">{title}</h1>
              <p className="text-xs text-muted-foreground -mt-0.5 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
                aria-label={t('common.notifications')}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={16} strokeWidth={1.8} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] font-semibold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>

              {showNotifications && notifications.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-border font-semibold text-xs heading-font text-muted-foreground uppercase tracking-wider">
                    {t('common.notifications')} ({notifications.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className="px-3 py-2 text-sm border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        {n.text || n}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 max-w-350">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
