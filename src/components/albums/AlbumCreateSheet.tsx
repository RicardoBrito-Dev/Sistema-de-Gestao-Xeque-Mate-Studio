"use client"

import React, { useState, useEffect } from "react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet"
import { Album } from "@/lib/types"
import { saveAlbumAsync, generateId } from "@/lib/storage"
import { uploadAlbumCover } from "@/lib/supabaseStorage"
import { AlbumCoverUpload } from "./AlbumCoverUpload"
import { Loader2 } from "lucide-react"

interface AlbumCreateSheetProps {
  isOpen: boolean
  onClose: () => void
  album?: Album | null
  onSave: (album: Album) => void
}

export function AlbumCreateSheet({ isOpen, onClose, album, onSave }: AlbumCreateSheetProps) {
  const [title, setTitle] = useState("")
  const [artistName, setArtistName] = useState("")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (album) {
      setTitle(album.title)
      setArtistName(album.artistName)
      setYear(album.year || new Date().getFullYear().toString())
      setCoverPreview(album.coverUrl || null)
      setCoverFile(null)
    } else {
      setTitle("")
      setArtistName("")
      setYear(new Date().getFullYear().toString())
      setCoverFile(null)
      setCoverPreview(null)
    }
  }, [album, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      const id = album?.id || generateId()
      let coverUrl = album?.coverUrl

      // Upload da capa se um novo arquivo foi selecionado
      if (coverFile) {
        const uploadedUrl = await uploadAlbumCover(coverFile, id)
        if (uploadedUrl) {
          coverUrl = uploadedUrl
        } else {
          console.warn('Upload de capa para Supabase falhou, capa não persistida na nuvem.')
        }
      }

      const now = new Date().toISOString()
      const newAlbum: Album = {
        id,
        title: title.trim(),
        artistName: artistName.trim(),
        year,
        coverUrl,
        tracks: album?.tracks || [],
        createdAt: album?.createdAt || now,
        updatedAt: now,
      }

      await saveAlbumAsync(newAlbum)
      onSave(newAlbum)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{album ? "Editar Álbum" : "Novo Álbum"}</SheetTitle>
          <SheetDescription>
            {album ? `Editando "${album.title}"` : "Crie um novo projeto de álbum"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Capa */}
          <div className="flex items-start gap-4">
            <AlbumCoverUpload
              currentUrl={coverPreview || undefined}
              onFileSelected={(file, url) => { setCoverFile(file); setCoverPreview(url) }}
              onRemove={() => { setCoverFile(null); setCoverPreview(null) }}
              size="lg"
            />
            <div className="flex-1 space-y-3 pt-1">
              <div>
                <label className="label-field">Nome do Álbum *</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Ex: Favela Chronicles Vol.1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label-field">Artista</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Ex: MC Sombra"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                />
              </div>
              <div>
                <label className="label-field">Ano</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="2026"
                  maxLength={4}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="px-0 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </span>
              ) : (
                album ? "Salvar" : "Criar Álbum"
              )}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
