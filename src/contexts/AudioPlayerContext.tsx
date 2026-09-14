"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from "react"

interface AudioTrack {
  id: string
  title: string
  artist: string
  audioUrl?: string
}

interface AudioPlayerContextType {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playTrack: (track: AudioTrack) => void
  pauseTrack: () => void
  resumeTrack: () => void
  stopTrack: () => void
  seek: (time: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  stopTrack: () => {},
  seek: () => {},
})

// Demo sound synthesizer if audioUrl is not a direct MP3
function playSyntheticBeat(audioContext: AudioContext, isPlayingRef: React.MutableRefObject<boolean>) {
  // simple rhythmic studio beat click for demonstration
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(154) // 2:34 demo track length
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const playTrack = (track: AudioTrack) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    setCurrentTime(0)
    setDuration(168) // demo track length
  }

  const pauseTrack = () => {
    setIsPlaying(false)
  }

  const resumeTrack = () => {
    if (currentTrack) setIsPlaying(true)
  }

  const stopTrack = () => {
    setIsPlaying(false)
    setCurrentTrack(null)
    setCurrentTime(0)
  }

  const seek = (time: number) => {
    setCurrentTime(time)
  }

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, duration])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        stopTrack,
        seek,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext)
}
