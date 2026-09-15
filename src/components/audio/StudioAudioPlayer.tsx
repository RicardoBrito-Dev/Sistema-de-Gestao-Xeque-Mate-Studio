"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"
import { 
  Play, 
  Pause, 
  X, 
  Disc3, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Plus, 
  Layers,
  Star
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AudioDropzone } from "@/components/audio/AudioDropzone"
import { TrackVersion } from "@/lib/types"

export function StudioAudioPlayer() {
  const {
    currentTrack,
    activeVersion,
    isPlaying,
    currentTime,
    duration,
    volume,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seek,
    setVolume,
    switchVersion,
  } = useAudioPlayer()

  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const prevVolumeRef = useRef(volume)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsVersionDropdownOpen(false)
      }
    }
    if (isVersionDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isVersionDropdownOpen])

  if (!currentTrack) return null

  const formatTime = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec)) return "0:00"
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolumeRef.current || 1)
      setIsMuted(false)
    } else {
      prevVolumeRef.current = volume
      setVolume(0)
      setIsMuted(true)
    }
  }

  const versions = currentTrack.versions || []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 90, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[500px] z-50 rounded-2xl bg-[#0c0c0f]/95 backdrop-blur-2xl border border-[#27272e] p-4 shadow-2xl shadow-black/95"
      >
        <div className="flex items-center gap-3.5">
          {/* Spinning Vinyl Disc */}
          <div className="relative h-12 w-12 rounded-xl bg-[#141417] border border-[#27272a] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <Disc3
              size={26}
              className={`text-[#22c55e] ${isPlaying ? "animate-spin" : ""}`}
              style={{ animationDuration: "2.8s" }}
            />
          </div>

          {/* Track Info & Version Dropdown (Untitled style) */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bebas text-base text-white tracking-wide truncate leading-none">
                    {currentTrack.title}
                  </h4>

                  {/* ─── Untitled Version Selector Dropdown ─── */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsVersionDropdownOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#18181b] hover:bg-[#222226] border border-[#2e2e36] text-[10px] font-mono text-[#22c55e] hover:text-[#4ade80] transition-colors cursor-pointer"
                      title="Alternar entre versões da faixa (estilo Untitled)"
                    >
                      <span className="font-bold">
                        {activeVersion ? `v${activeVersion.versionNumber}` : "v1"}
                      </span>
                      <ChevronDown size={10} />
                    </button>

                    {/* Version Dropdown Menu */}
                    <AnimatePresence>
                      {isVersionDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="absolute left-0 bottom-7 z-50 w-64 rounded-xl bg-[#111114] border border-[#2a2a30] shadow-2xl p-1.5 space-y-1"
                        >
                          <div className="px-2 py-1 text-[10px] font-bold text-[#71717a] uppercase tracking-wider flex items-center justify-between border-b border-[#1e1e22]">
                            <span>Versões da Música</span>
                            <span className="text-[9px] text-[#22c55e] lowercase">teste a/b</span>
                          </div>

                          {versions.length === 0 ? (
                            <div className="p-2 text-center text-xs text-[#71717a]">
                              Versão única (Guia inicial)
                            </div>
                          ) : (
                            versions.map((ver) => {
                              const isSelected = activeVersion?.id === ver.id
                              return (
                                <button
                                  key={ver.id}
                                  type="button"
                                  onClick={() => {
                                    switchVersion(ver.id)
                                    setIsVersionDropdownOpen(false)
                                  }}
                                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                    isSelected
                                      ? "bg-[#15803d]/20 text-[#4ade80] font-semibold border border-[#15803d]/30"
                                      : "text-[#d4d4d8] hover:bg-white/[0.04]"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-[11px] font-bold">
                                        v{ver.versionNumber}
                                      </span>
                                      <span className="truncate">{ver.name.replace(/^v\d+\s*•?\s*/, "")}</span>
                                      {ver.isFinal && (
                                        <span className="text-[9px] bg-gold/20 text-gold px-1 rounded font-bold">
                                          FINAL
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[9px] text-[#71717a] mt-0.5 flex items-center gap-2 font-mono">
                                      {ver.fileSize && <span>{ver.fileSize}</span>}
                                    </div>
                                  </div>

                                  {isSelected && <Check size={13} className="text-[#22c55e] shrink-0" />}
                                </button>
                              )
                            })
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <p className="text-[11px] text-[#71717a] truncate mt-0.5">
                  {currentTrack.artist} • <span className="text-[#d4d4d8]">{activeVersion?.name || "Versão 1"}</span>
                </p>
              </div>

              {/* Equalizer Waveform Bars Animation */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3.5 shrink-0 px-1">
                  <span className="w-0.5 bg-[#22c55e] h-3.5 animate-pulse rounded-full"></span>
                  <span className="w-0.5 bg-[#22c55e] h-2 animate-bounce rounded-full" style={{ animationDelay: "120ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-3 animate-pulse rounded-full" style={{ animationDelay: "240ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-1.5 animate-bounce rounded-full" style={{ animationDelay: "360ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-2.5 animate-pulse rounded-full" style={{ animationDelay: "480ms" }}></span>
                </div>
              )}
            </div>

            {/* Interactive Timeline Progress */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[9px] font-mono text-[#71717a] shrink-0 w-8">
                {formatTime(currentTime)}
              </span>

              <div
                className="relative flex-1 h-1.5 bg-[#1e1e22] rounded-full cursor-pointer overflow-hidden group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const newPercent = Math.max(0, Math.min(1, clickX / rect.width))
                  seek(newPercent * duration)
                }}
              >
                <div
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-100 group-hover:bg-[#4ade80]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <span className="text-[9px] font-mono text-[#71717a] shrink-0 w-8 text-right">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Play/Pause, Volume, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="p-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white shadow-sm transition-all cursor-pointer active:scale-90"
              title={isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-white/10 transition-colors"
              title={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={stopTrack}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar Player"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
