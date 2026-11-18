'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Unknown addresses go back to the app
export default function NotFound() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/')
  }, [router])
  return null
}
