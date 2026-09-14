"use client"

import React from "react"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"
import { Play, Pause, X, Disc3, Volume2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function StudioAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seek,
  } = useAudioPlayer()

  if (!currentTrack) return null

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[460px] z-50 rounded-2xl bg-[#0d0d10]/95 backdrop-blur-xl border border-[#27272e] p-3.5 shadow-2xl shadow-black/90"
      >
        <div className="flex items-center gap-3">
          {/* Track thumbnail / spinning icon */}
          <div className="relative h-11 w-11 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0 overflow-hidden">
            <Disc3
              size={24}
              className={`text-[#22c55e] ${isPlaying ? "animate-spin" : ""}`}
              style={{ animationDuration: "3s" }}
            />
          </div>

          {/* Track info & controls */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bebas text-sm text-white tracking-wide truncate leading-none">
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] text-[#71717a] truncate mt-0.5">
                  {currentTrack.artist} • <span className="text-[#22c55e]">Prévia do Som</span>
                </p>
              </div>

              {/* Equalizer Bars Animation */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3 shrink-0 px-1">
                  <span className="w-0.5 bg-[#22c55e] h-3 animate-pulse rounded-full"></span>
                  <span className="w-0.5 bg-[#22c55e] h-2 animate-bounce rounded-full" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-3 animate-pulse rounded-full" style={{ animationDelay: "300ms" }}></span>
                  <span className="w-0.5 bg-[#22c55e] h-1.5 animate-bounce rounded-full" style={{ animationDelay: "450ms" }}></span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-[#71717a] shrink-0">
                {formatTime(currentTime)}
              </span>

              <div
                className="relative flex-1 h-1 bg-[#1e1e22] rounded-full cursor-pointer overflow-hidden group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const newPercent = clickX / rect.width
                  seek(newPercent * duration)
                }}
              >
                <div
                  className="h-full bg-[#22c55e] rounded-full transition-all duration-200 group-hover:bg-[#4ade80]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <span className="text-[9px] font-mono text-[#71717a] shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={isPlaying ? pauseTrack : resumeTrack}
              className="p-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white shadow-sm transition-all cursor-pointer active:scale-90"
              title={isPlaying ? "Pausar" : "Tocar"}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            <button
              onClick={stopTrack}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar Player"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
