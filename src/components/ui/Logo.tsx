"use client"

import React from 'react'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'png' | 'svg'
  className?: string
  white?: boolean
  rounded?: boolean
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20'
}

export function Logo({ 
  size = 'md', 
  variant = 'svg', 
  className = '', 
  white = false,
  rounded = false 
}: LogoProps) {
  const sizeClass = sizeClasses[size]
  const logoSrc = variant === 'svg' ? '/logo.svg' : '/logo.png'
  
  const baseClasses = `${sizeClass} object-contain`
  const filterClasses = white ? 'filter brightness-0 invert' : ''
  const roundedClasses = rounded ? 'rounded-full' : ''
  
  const finalClasses = `${baseClasses} ${filterClasses} ${roundedClasses} ${className}`.trim()

  return (
    <img 
      src={logoSrc}
      alt="GatorEx Logo" 
      className={finalClasses}
    />
  )
}