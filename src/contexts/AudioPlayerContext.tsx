"use client"

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import { TrackVersion } from "@/lib/types"
import { getAudioBlob } from "@/lib/audioStorage"
import { recordTrackPlay } from "@/lib/storage"

export interface PlayingTrack {
  id: string
  title: string
  artist: string
  audioUrl?: string
  versions?: TrackVersion[]
  activeVersionId?: string
  albumId?: string
  playCount?: number
}

interface AudioPlayerContextType {
  currentTrack: PlayingTrack | null
  activeVersion: TrackVersion | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playlist: PlayingTrack[]
  hasNext: boolean
  hasPrev: boolean
  playTrack: (track: PlayingTrack, targetVersionId?: string, newPlaylist?: PlayingTrack[]) => void
  pauseTrack: () => void
  resumeTrack: () => void
  stopTrack: () => void
  seek: (time: number) => void
  setVolume: (vol: number) => void
  switchVersion: (versionId: string) => void
  nextTrack: () => void
  prevTrack: () => void
  updatePlaylist: (newPlaylist: PlayingTrack[]) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentTrack: null,
  activeVersion: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  playlist: [],
  hasNext: false,
  hasPrev: false,
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  stopTrack: () => {},
  seek: () => {},
  setVolume: () => {},
  switchVersion: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  updatePlaylist: () => {},
})

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(null)
  const [activeVersion, setActiveVersion] = useState<TrackVersion | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(1)
  const [playlist, setPlaylist] = useState<PlayingTrack[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPlayRecordedRef = useRef<{ [key: string]: number }>({})

  // Keep refs for event handlers to avoid stale closures
  const currentTrackRef = useRef<PlayingTrack | null>(null)
  const playlistRef = useRef<PlayingTrack[]>([])
  currentTrackRef.current = currentTrack
  playlistRef.current = playlist

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

  const playTrackInternal = useCallback(async (track: PlayingTrack, targetVersionId?: string) => {
    setCurrentTrack(track)
    currentTrackRef.current = track

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

    // Registrar reprodução com debounce de 3 segundos
    const now = Date.now()
    const lastPlayed = lastPlayRecordedRef.current[track.id] || 0
    if (now - lastPlayed > 3000) {
      lastPlayRecordedRef.current[track.id] = now
      recordTrackPlay({
        trackId: track.id,
        albumId: track.albumId,
        versionId: versionToPlay.id,
      }).catch((e) => console.warn("Erro ao registrar reprodução:", e))
    }

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
            setIsPlaying(true)
            setDuration(165)
          })
      } else {
        setIsPlaying(true)
        setDuration(165)
      }
    } else {
      setIsPlaying(true)
      setDuration(165)
    }
  }, [])

  const nextTrack = useCallback(() => {
    const curr = currentTrackRef.current
    const list = playlistRef.current
    if (!curr || list.length <= 1) return

    const currentIndex = list.findIndex((t) => t.id === curr.id)
    if (currentIndex !== -1 && currentIndex + 1 < list.length) {
      const next = list[currentIndex + 1]
      playTrackInternal(next, next.activeVersionId)
    } else {
      // End of playlist
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [playTrackInternal])

  const prevTrack = useCallback(() => {
    const curr = currentTrackRef.current
    const list = playlistRef.current
    if (!curr || list.length <= 1) return

    const currentIndex = list.findIndex((t) => t.id === curr.id)
    if (currentIndex > 0) {
      const prev = list[currentIndex - 1]
      playTrackInternal(prev, prev.activeVersionId)
    } else {
      // Restart current track from beginning
      if (audioRef.current) audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }, [playTrackInternal])

  // Next Track reference for audio.onended handler
  const nextTrackRef = useRef(nextTrack)
  nextTrackRef.current = nextTrack

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

      // Auto-advance to next track when finished
      audio.onended = () => {
        nextTrackRef.current()
      }

      audio.onerror = () => {
        console.warn("Audio file failed or format unsupported, using fallback timer")
      }

      audioRef.current = audio

      return () => {
        audio.pause()
        audio.src = ""
      }
    }
  }, [])

  const playTrack = (track: PlayingTrack, targetVersionId?: string, newPlaylist?: PlayingTrack[]) => {
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist)
      playlistRef.current = newPlaylist
    }
    playTrackInternal(track, targetVersionId)
  }

  const updatePlaylist = (newPlaylist: PlayingTrack[]) => {
    setPlaylist(newPlaylist)
    playlistRef.current = newPlaylist
  }

  const switchVersion = async (versionId: string) => {
    if (!currentTrack || !currentTrack.versions) return
    const target = currentTrack.versions.find((v) => v.id === versionId)
    if (!target) return

    setActiveVersion(target)

    // Registra reprodução da nova versão
    recordTrackPlay({
      trackId: currentTrack.id,
      albumId: currentTrack.albumId,
      versionId: target.id,
    }).catch((e) => console.warn("Erro ao registrar reprodução de versão:", e))

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

  // Fallback timer when no actual audio source is loaded (visual simulation mode)
  useEffect(() => {
    if (isPlaying && (!audioRef.current || !audioRef.current.src)) {
      fallbackTimerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            nextTrackRef.current()
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

  // Queue navigation state helpers
  const currentIdx = currentTrack ? playlist.findIndex((t) => t.id === currentTrack.id) : -1
  const hasNext = currentIdx !== -1 && currentIdx + 1 < playlist.length
  const hasPrev = currentIdx > 0

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        activeVersion,
        isPlaying,
        currentTime,
        duration: duration || 165,
        volume,
        playlist,
        hasNext,
        hasPrev,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        seek,
        setVolume,
        switchVersion,
        nextTrack,
        prevTrack,
        updatePlaylist,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext)
}
