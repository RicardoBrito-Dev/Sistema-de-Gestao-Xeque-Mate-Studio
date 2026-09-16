"use client"

import React from "react"
import { TrackVersion } from "@/lib/types"
import { ChevronDown, Check, Headphones } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface VersionSelectorProps {
  versions: TrackVersion[]
  selectedVersionId?: string
  onChange: (versionId: string) => void
  className?: string
}

export function VersionSelector({
  versions,
  selectedVersionId,
  onChange,
  className = "",
}: VersionSelectorProps) {
  if (!versions || versions.length === 0) {
    return <span className="text-[11px] text-[#3f3f46] italic">Sem versões</span>
  }

  const activeId = selectedVersionId || versions[versions.length - 1]?.id
  const activeIndex = versions.findIndex((v) => v.id === activeId)
  const activeVer = versions[activeIndex !== -1 ? activeIndex : 0]
  const displayLabel = `v${activeIndex !== -1 ? activeIndex + 1 : 1}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-[#22c55e]/40 text-[#d4d4d8] text-[11px] font-mono font-semibold transition-all cursor-pointer select-none focus:outline-none focus:border-[#22c55e]/50 ${className}`}
          title={`Versão ativa: ${activeVer?.name || displayLabel}. Clique para alternar.`}
        >
          <span>{displayLabel}</span>
          {activeVer?.isFinal && <span className="text-[#22c55e] text-[10px]">★</span>}
          <ChevronDown size={11} className="text-[#71717a] ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#71717a] border-b border-[#1e1e24] mb-1">
          Alternar Versão (A/B)
        </div>
        {versions.map((v, i) => {
          const isSelected = v.id === activeId
          return (
            <DropdownMenuItem
              key={v.id}
              onClick={() => onChange(v.id)}
              className="flex items-center justify-between text-xs py-2 px-2.5 cursor-pointer rounded-lg hover:bg-[#1a1a20]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[#22c55e] font-bold text-xs flex-shrink-0">
                  v{i + 1}
                </span>
                <span className="truncate text-[#e4e4e7]">{v.name}</span>
                {v.isFinal && (
                  <span className="text-[9px] text-[#22c55e] bg-[#22c55e]/15 px-1 py-0.5 rounded font-mono font-bold flex-shrink-0">
                    Final
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {v.playCount !== undefined && v.playCount > 0 && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-mono text-[#a1a1aa]"
                    title={`${v.playCount} ${v.playCount === 1 ? "audição" : "audições"} desta versão`}
                  >
                    <Headphones size={10} className="text-[#22c55e]" />
                    <span>{v.playCount}</span>
                  </span>
                )}
                {isSelected && (
                  <Check size={14} className="text-[#22c55e] flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
