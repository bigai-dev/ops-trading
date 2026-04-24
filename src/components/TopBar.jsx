import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
  )
}

export function TopBar({ notifications = [], logo }) {
  const { isDark, toggle } = useDarkMode()
  const [showNotifications, setShowNotifications] = useState(false)
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

  return (
    <div className="flex items-center gap-1 px-6 py-2.5 border-b border-border bg-card">
      {/* Logo — for demos without sidebar */}
      {logo && <div className="flex-1">{logo}</div>}
      {!logo && <div className="flex-1" />}

      {/* Notification Bell */}
      <div className="relative" ref={notifRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 relative"
          aria-label={`通知${notifications.length > 0 ? ` (${notifications.length} 条新通知)` : ''}`}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <BellIcon />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[11px] bg-destructive text-destructive-foreground">
              {notifications.length}
            </Badge>
          )}
        </Button>

        {showNotifications && notifications.length > 0 && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-border font-semibold text-sm heading-font">
              通知 ({notifications.length})
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} className="px-3 py-2.5 text-sm border-b border-border last:border-0 hover:bg-muted/50">
                  {n.text || n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dark Mode Toggle */}
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggle} aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  )
}
