'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${sizeClasses[size]} animate-slide-up flex flex-col overflow-hidden max-h-[92vh]`}
        style={{
          background: 'rgba(14, 14, 17, 0.98)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.08)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#1e1e1e] flex-shrink-0">
          <div>
            <h3 className="font-bebas text-xl text-gold tracking-widest leading-none">{title}</h3>
            <div className="mt-1 h-[2px] w-8 rounded-full bg-gradient-to-r from-gold to-transparent opacity-60" />
          </div>
          <button
            onClick={onClose}
            className="btn-icon ml-4"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {children}
        </div>
      </div>
    </div>
  )
}
