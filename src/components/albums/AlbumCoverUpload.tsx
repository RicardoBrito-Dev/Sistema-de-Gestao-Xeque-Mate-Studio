"use client"

import React, { useState, useRef } from "react"
import { ImagePlus, X } from "lucide-react"

interface AlbumCoverUploadProps {
  currentUrl?: string
  onFileSelected: (file: File, previewUrl: string) => void
  onRemove?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function AlbumCoverUpload({
  currentUrl,
  onFileSelected,
  onRemove,
  size = 'md',
}: AlbumCoverUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-20 h-20 rounded-xl',
    md: 'w-36 h-36 rounded-2xl',
    lg: 'w-48 h-48 rounded-2xl',
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem (JPG, PNG, WEBP).')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileSelected(file, url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  if (preview) {
    return (
      <div className={`relative flex-shrink-0 ${sizeClasses[size]} overflow-hidden border border-[#27272a] group`}>
        <img src={preview} alt="Capa do álbum" className="w-full h-full object-cover" />
        {onRemove && (
          <button
            type="button"
            onClick={() => { setPreview(null); onRemove() }}
            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white hover:bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <X size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold text-white"
        >
          Trocar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
        />
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => fileInputRef.current?.click()}
      className={`flex-shrink-0 ${sizeClasses[size]} border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
        isDragging
          ? 'border-[#22c55e] bg-[#22c55e]/10'
          : 'border-[#27272a] hover:border-[#15803d]/60 bg-[#0f0f11] hover:bg-[#141417]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />
      <ImagePlus size={size === 'sm' ? 16 : 24} className="text-[#3f3f46]" />
      {size !== 'sm' && (
        <span className="text-[10px] text-[#52525b] font-medium text-center leading-tight px-2">
          Capa do<br/>Álbum
        </span>
      )}
    </div>
  )
}
