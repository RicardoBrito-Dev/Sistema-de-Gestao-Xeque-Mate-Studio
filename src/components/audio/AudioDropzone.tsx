"use client"

import React, { useState, useRef } from "react"
import { UploadCloud, Music, FileAudio, Check, Plus } from "lucide-react"
import { TrackVersion } from "@/lib/types"
import { saveAudioBlob } from "@/lib/audioStorage"
import { generateId } from "@/lib/storage"

interface AudioDropzoneProps {
  existingVersions?: TrackVersion[]
  onVersionAdded: (version: TrackVersion) => void
  className?: string
  compact?: boolean
}

export function AudioDropzone({
  existingVersions = [],
  onVersionAdded,
  className = "",
  compact = false,
}: AudioDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|ogg|flac|aac)$/i)) {
      alert("Por favor, selecione um arquivo de áudio válido (.mp3, .wav, .m4a, etc).")
      return
    }

    setUploading(true)
    try {
      const nextVersionNum = existingVersions.length + 1
      const versionId = `v-${generateId()}`
      const blobUrl = URL.createObjectURL(file)

      // Save binary blob to IndexedDB
      await saveAudioBlob(versionId, file)

      const cleanFileName = file.name.replace(/\.[^/.]+$/, "")
      const newVersion: TrackVersion = {
        id: versionId,
        versionNumber: nextVersionNum,
        name: `v${nextVersionNum} • ${cleanFileName}`,
        audioUrl: blobUrl,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        uploadedAt: new Date().toISOString(),
        isFinal: false,
      }

      onVersionAdded(newVersion)
    } catch (err) {
      console.error("Erro ao processar áudio:", err)
      alert("Erro ao carregar o arquivo de áudio.")
    } finally {
      setUploading(false)
      setIsDragging(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0])
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-xs font-semibold text-[#d4d4d8] hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <Plus size={13} className="text-[#22c55e]" />
          <span>{uploading ? "Carregando..." : "Adicionar Versão"}</span>
        </button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`group relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-6 flex flex-col items-center justify-center text-center ${
        isDragging
          ? "border-[#22c55e] bg-[#22c55e]/10 scale-[1.01]"
          : "border-[#27272a] hover:border-[#15803d]/60 bg-[#121214]/80 hover:bg-[#151518]"
      } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileProcess(e.target.files[0])
          }
        }}
      />

      <div className="h-12 w-12 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#22c55e] group-hover:scale-110 transition-transform mb-3 shadow-inner">
        {uploading ? (
          <div className="h-5 w-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        ) : (
          <UploadCloud size={24} />
        )}
      </div>

      <p className="text-sm font-semibold text-white">
        {uploading
          ? "Processando áudio..."
          : isDragging
          ? "Solte o áudio aqui!"
          : "Arraste e solte o áudio da música aqui"}
      </p>
      <p className="text-xs text-[#71717a] mt-1">
        ou clique para selecionar do computador / celular (MP3, WAV, M4A)
      </p>

      <div className="flex items-center gap-2 mt-3 text-[10px] text-[#52525b] font-mono">
        <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">WAV</span>
        <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">MP3</span>
        <span className="px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">FLAC</span>
        <span>• Criação automática de v{existingVersions.length + 1}</span>
      </div>
    </div>
  )
}
