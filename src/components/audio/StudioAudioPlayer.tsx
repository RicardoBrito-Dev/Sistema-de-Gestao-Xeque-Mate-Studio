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
  SkipBack, 
  SkipForward 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function StudioAudioPlayer() {
  const {
    currentTrack,
    activeVersion,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    hasNext,
    hasPrev,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seek,
    setVolume,
    switchVersion,
    nextTrack,
    prevTrack,
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
        className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[460px] z-50 rounded-2xl bg-[#0c0c0f]/95 backdrop-blur-2xl border border-[#27272e] p-3.5 sm:p-4 shadow-2xl shadow-black/95"
      >
        <div className="flex flex-col gap-2.5">
          {/* Top Row: Track Art + Track Details + (Equalizer & Close) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Spinning Vinyl Disc */}
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#141417] border border-[#27272a] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                <Disc3
                  size={22}
                  className={`text-[#22c55e] ${isPlaying ? "animate-spin" : ""}`}
                  style={{ animationDuration: "2.8s" }}
                />
              </div>

              {/* Title, Version Selector, Artist */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bebas text-base sm:text-lg text-white tracking-wide truncate leading-tight">
                    {currentTrack.title}
                  </h4>

                  {/* ─── Untitled Version Selector Dropdown ─── */}
                  <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsVersionDropdownOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#18181b] hover:bg-[#222226] border border-[#2e2e36] text-[10px] font-mono text-[#22c55e] hover:text-[#4ade80] transition-colors cursor-pointer"
                      title="Alternar entre versões da faixa"
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
                          className="absolute left-0 bottom-8 z-50 w-64 max-w-[calc(100vw-3rem)] rounded-xl bg-[#111114] border border-[#2a2a30] shadow-2xl p-1.5 space-y-1"
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
                  {currentTrack.artist} {activeVersion?.name && `• ${activeVersion.name.replace(/^v\d+\s*•?\s*/, "")}`}
                </p>
              </div>
            </div>

            {/* Right Header Actions: Equalizer + Close */}
            <div className="flex items-center gap-2 shrink-0">
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3.5 px-1">
                  <span className="w-0.5 bg-[#22c55e] h-3.5 animate-pulse rounded-full"></span>
                  <span className="w-0.5 bg-[#22c55e] h-2 animate-bounce rounded-full" style={{ animationDelay: "120ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-3 animate-pulse rounded-full" style={{ animationDelay: "240ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-1.5 animate-bounce rounded-full" style={{ animationDelay: "360ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-2.5 animate-pulse rounded-full" style={{ animationDelay: "480ms" }}></span>
                </div>
              )}
              <button
                onClick={stopTrack}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar Player"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Middle: Full-width Scrubber with timestamps */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono text-[#71717a] shrink-0 w-8">
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 h-1.5 hover:h-2 bg-[#1e1e22] rounded-full cursor-pointer overflow-hidden group transition-all"
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

            <span className="text-[10px] font-mono text-[#71717a] shrink-0 w-8 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Bottom Row: Controls */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Left: Volume / Mute */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? "Ativar som" : "Silenciar"}
            >
              {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} />}
            </button>

            {/* Center: Playback Controls (Prev, Play/Pause, Next) */}
            <div className="flex items-center gap-3">
              {playlist.length > 1 ? (
                <button
                  onClick={prevTrack}
                  disabled={!hasPrev}
                  className="p-2 rounded-full text-[#71717a] hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:text-[#71717a] transition-colors cursor-pointer"
                  title="Faixa anterior"
                >
                  <SkipBack size={16} />
                </button>
              ) : (
                <div className="w-8" />
              )}

              <button
                onClick={isPlaying ? pauseTrack : resumeTrack}
                className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black flex items-center justify-center shadow-lg shadow-[#22c55e]/20 transition-all cursor-pointer active:scale-95"
                title={isPlaying ? "Pausar" : "Tocar"}
              >
                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
              </button>

              {playlist.length > 1 ? (
                <button
                  onClick={nextTrack}
                  disabled={!hasNext}
                  className="p-2 rounded-full text-[#71717a] hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:text-[#71717a] transition-colors cursor-pointer"
                  title="Próxima faixa"
                >
                  <SkipForward size={16} />
                </button>
              ) : (
                <div className="w-8" />
              )}
            </div>

            {/* Right: Version indicator badge */}
            <div className="w-8 flex justify-end">
              <span className="text-[9px] font-mono text-[#71717a] px-1.5 py-0.5 rounded bg-white/[0.04] border border-[#27272a] uppercase font-semibold">
                {activeVersion?.isFinal ? "FINAL" : "WAV"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
