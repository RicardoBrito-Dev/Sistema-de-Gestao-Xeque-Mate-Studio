"use client"

import React from "react"
import { TrackVersion } from "@/lib/types"
import { ChevronDown } from "lucide-react"

interface VersionSelectorProps {
  versions: TrackVersion[]
  selectedVersionId?: string
  onChange: (versionId: string) => void
  className?: string
}

export function VersionSelector({ versions, selectedVersionId, onChange, className = "" }: VersionSelectorProps) {
  if (!versions || versions.length === 0) {
    return (
      <span className="text-[11px] text-[#3f3f46] italic">Sem versões</span>
    )
  }

  const activeId = selectedVersionId || versions[versions.length - 1]?.id

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#18181b] border border-[#27272a] hover:border-[#15803d]/50 text-[#d4d4d8] text-[11px] font-mono font-semibold pl-2.5 pr-7 py-1.5 rounded-lg cursor-pointer transition-all outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/20"
      >
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}{v.isFinal ? " ★" : ""}
          </option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none"
      />
    </div>
  )
}
