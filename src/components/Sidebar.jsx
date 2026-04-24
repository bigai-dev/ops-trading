import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  FileText, ClipboardList, Users, Package, LayoutDashboard, BrainCircuit,
  ChevronLeft, ChevronRight, Download, RotateCcw, Moon, Sun,
  Menu, X, Globe,
} from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'
import { exportAllToExcel } from '@/lib/excel'
import { useQuoteFlowStore } from '@/store'
import { useI18n, LANGS } from '@/lib/i18n'

const NAV_ITEMS = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { key: 'orders', labelKey: 'nav.orders', icon: ClipboardList, badgeKey: 'unpaid' },
  { key: 'crm', labelKey: 'nav.crm', icon: Users, badgeKey: 'overdue' },
  { key: 'quote', labelKey: 'nav.quote', icon: FileText },
  { key: 'inventory', labelKey: 'nav.inventory', icon: Package, badgeKey: 'lowStock' },
  { key: 'forecast', labelKey: 'nav.forecast', icon: BrainCircuit },
]

export { NAV_ITEMS }

export function Sidebar({ activeTab, onTabChange, badges = {}, mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const { isDark, toggle: toggleDark } = useDarkMode()
  const { clients, inventory, quotes, resetAll } = useQuoteFlowStore()
  const { t, lang, setLang, langs } = useI18n()
  const [showLangMenu, setShowLangMenu] = useState(false)

  const handleExportAll = () => exportAllToExcel(clients, inventory, quotes)

  const handleNav = (key) => {
    onTabChange(key)
    if (onMobileClose) onMobileClose()
  }

  const showLabel = !collapsed || mobileOpen

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-in fade-in duration-200"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`sidebar-root flex flex-col border-r border-border bg-card transition-all duration-250 ease-out overflow-hidden
          fixed inset-y-0 left-0 z-50 md:relative md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${collapsed ? 'md:w-[68px]' : 'md:w-[220px]'}
          w-[260px]
        `}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center gap-2.5 px-4 h-14 shrink-0">
          <span
            className="flex items-center justify-center shrink-0 rounded-lg text-white font-bold"
            style={{ width: 32, height: 32, background: 'var(--color-primary)', fontSize: 14 }}
          >
            Q
          </span>
          {showLabel && (
            <span className="sidebar-brand text-base font-extrabold tracking-tight heading-font whitespace-nowrap">
              QuoteFlow
            </span>
          )}
          <button
            className="ml-auto md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
            onClick={onMobileClose}
            aria-label={t('sidebar.closeMenu')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-3 h-px bg-border" />

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.key
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
            const label = t(item.labelKey)
            const button = (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`sidebar-nav-item group flex items-center gap-2.5 w-full rounded-lg text-[15px] font-medium transition-all duration-150 cursor-pointer
                  ${!showLabel ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-primary/10 text-primary sidebar-nav-active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0 transition-colors" />
                {showLabel && (
                  <>
                    <span className="truncate">{label}</span>
                    {badgeCount > 0 && (
                      <Badge className="ml-auto h-5 min-w-5 px-1.5 text-[11px] bg-red-500 text-white border-0">
                        {badgeCount}
                      </Badge>
                    )}
                  </>
                )}
                {!showLabel && badgeCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            )

            if (!showLabel) {
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <div className="relative">{button}</div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {label}
                    {badgeCount > 0 && <span className="ml-1.5 text-red-400">({badgeCount})</span>}
                  </TooltipContent>
                </Tooltip>
              )
            }
            return button
          })}
        </nav>

        <div className="mx-3 h-px bg-border" />

        {/* Bottom Actions */}
        <div className="px-2 py-3 space-y-0.5">
          {/* Language Switcher */}
          <div className="relative">
            <SidebarAction
              icon={Globe}
              label={showLabel ? `${langs[lang].flag} ${langs[lang].label}` : ''}
              collapsed={!showLabel}
              onClick={() => setShowLangMenu(!showLangMenu)}
            />
            {showLangMenu && (
              <div className="absolute bottom-full left-2 mb-1 w-40 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                {Object.entries(langs).map(([code, { label, flag }]) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setShowLangMenu(false) }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm cursor-pointer transition-colors
                      ${lang === code ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                  >
                    <span>{flag}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <SidebarAction icon={Download} label={t('sidebar.exportAll')} collapsed={!showLabel} onClick={handleExportAll} />
          <SidebarAction icon={isDark ? Sun : Moon} label={isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')} collapsed={!showLabel} onClick={toggleDark} />
          <SidebarAction icon={RotateCcw} label={t('sidebar.reset')} collapsed={!showLabel} onClick={resetAll} className="text-red-500 hover:text-red-600 hover:bg-red-500/10" />
        </div>

        {/* Collapse Toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  )
}

function SidebarAction({ icon: Icon, label, collapsed, onClick, className = '' }) {
  const button = (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
        ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}
        text-muted-foreground hover:text-foreground hover:bg-muted/60 ${className}`}
    >
      <Icon size={18} strokeWidth={1.8} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
      </Tooltip>
    )
  }
  return button
}
