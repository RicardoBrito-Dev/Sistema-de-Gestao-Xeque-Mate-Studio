"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import { TrackVersion } from "@/lib/types"
import { getAudioBlob } from "@/lib/audioStorage"

export interface PlayingTrack {
  id: string
  title: string
  artist: string
  audioUrl?: string
  versions?: TrackVersion[]
  activeVersionId?: string
}

interface AudioPlayerContextType {
  currentTrack: PlayingTrack | null
  activeVersion: TrackVersion | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playTrack: (track: PlayingTrack, targetVersionId?: string) => void
  pauseTrack: () => void
  resumeTrack: () => void
  stopTrack: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  switchVersion: (versionId: string) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentTrack: null,
  activeVersion: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  stopTrack: () => {},
  seek: () => {},
  setVolume: () => {},
  switchVersion: () => {},
})

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(null)
  const [activeVersion, setActiveVersion] = useState<TrackVersion | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize HTML5 Audio Element
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio()
      audio.preload = "auto"

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime)
      }

      audio.onloadedmetadata = () => {
        if (!isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration)
        }
      }

      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      audio.onerror = () => {
        // Fallback simulation if audio file URL failed or is mock
        console.warn("Audio file failed or format unsupported, using fallback timer")
      }

      audioRef.current = audio

      return () => {
        audio.pause()
        audio.src = ""
      }
    }
  }, [])

  // Resolve audio source (check IndexedDB if blob URL expired)
  const resolveAudioUrl = async (version: TrackVersion): Promise<string> => {
    if (version.audioUrl && (version.audioUrl.startsWith("http") || version.audioUrl.startsWith("data:"))) {
      return version.audioUrl
    }

    // Check IndexedDB
    const blob = await getAudioBlob(version.id)
    if (blob) {
      return URL.createObjectURL(blob)
    }

    return version.audioUrl || ""
  }

  const playTrack = async (track: PlayingTrack, targetVersionId?: string) => {
    setCurrentTrack(track)

    // Determine which version to play
    let versionToPlay: TrackVersion | null = null
    if (track.versions && track.versions.length > 0) {
      const selectedId = targetVersionId || track.activeVersionId || track.versions[track.versions.length - 1].id
      versionToPlay = track.versions.find((v) => v.id === selectedId) || track.versions[track.versions.length - 1]
    } else {
      // Default virtual version if no versions uploaded yet
      versionToPlay = {
        id: `v-default-${track.id}`,
        versionNumber: 1,
        name: "v1 • Guia Inicial",
        audioUrl: track.audioUrl || "",
        fileName: "guia_estudio.mp3",
        uploadedAt: new Date().toISOString(),
      }
    }

    setActiveVersion(versionToPlay)
    setCurrentTime(0)

    const audio = audioRef.current
    if (audio) {
      const finalUrl = await resolveAudioUrl(versionToPlay)
      if (finalUrl) {
        audio.src = finalUrl
        audio.currentTime = 0
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay policy or empty src - fallback timer
            setIsPlaying(true)
            setDuration(165)
          })
      } else {
        // No audio URL yet: visual simulation mode
        setIsPlaying(true)
        setDuration(165)
      }
    } else {
      setIsPlaying(true)
      setDuration(165)
    }
  }

  const switchVersion = async (versionId: string) => {
    if (!currentTrack || !currentTrack.versions) return
    const target = currentTrack.versions.find((v) => v.id === versionId)
    if (!target) return

    setActiveVersion(target)
    const audio = audioRef.current
    const wasPlaying = isPlaying

    if (audio) {
      const finalUrl = await resolveAudioUrl(target)
      if (finalUrl) {
        audio.src = finalUrl
        audio.currentTime = 0
        if (wasPlaying) {
          audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true))
        }
      }
    }
  }

  const pauseTrack = () => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const resumeTrack = () => {
    if (currentTrack) {
      setIsPlaying(true)
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().catch(() => {})
      }
    }
  }

  const stopTrack = () => {
    setIsPlaying(false)
    setCurrentTrack(null)
    setActiveVersion(null)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
  }

  const seek = (time: number) => {
    setCurrentTime(time)
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = time
    }
  }

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    setVolumeState(clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped
    }
  }

  // Fallback timer when no actual audio source is loaded
  useEffect(() => {
    if (isPlaying && (!audioRef.current || !audioRef.current.src)) {
      fallbackTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
    }

    return () => {
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
    }
  }, [isPlaying, duration])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        activeVersion,
        isPlaying,
        currentTime,
        duration: duration || 165,
        volume,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        seek,
        setVolume,
        switchVersion,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext)
}
