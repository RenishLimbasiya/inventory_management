'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface DashboardContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Responsive Dashboard Container
 * Wraps dashboard content with glass morphism styling
 */
export function DashboardContainer({
  children,
  className,
}: DashboardContainerProps) {
  return (
    <div className={cn('dashboard-container', className)}>
      <div className="dashboard-grid grid-cols-1 p-4 sm:p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}
