// ─── Xeque Mate Studio — Supabase Storage Helpers ───
// Uploads áudio e imagens para buckets públicos no Supabase Storage.
// Retorna a URL pública permanente do arquivo.

import { createClient } from '@/lib/supabase/client'

const BUCKET_TRACKS = 'track-versions'
const BUCKET_COVERS = 'album-covers'

/** Upload de arquivo de áudio para bucket track-versions.
 *  Retorna a URL pública permanente ou null em caso de erro. */
export async function uploadTrackVersion(
  file: File,
  versionId: string
): Promise<string | null> {
  try {
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'mp3'
    const path = `${versionId}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET_TRACKS)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'audio/mpeg',
      })

    if (error) {
      console.error('uploadTrackVersion error:', error.message)
      return null
    }

    const { data } = supabase.storage.from(BUCKET_TRACKS).getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.error('uploadTrackVersion exception:', err)
    return null
  }
}

/** Upload de imagem de capa para bucket album-covers.
 *  Retorna a URL pública permanente ou null em caso de erro. */
export async function uploadAlbumCover(
  file: File,
  albumId: string
): Promise<string | null> {
  try {
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${albumId}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET_COVERS)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      })

    if (error) {
      console.error('uploadAlbumCover error:', error.message)
      return null
    }

    const { data } = supabase.storage.from(BUCKET_COVERS).getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.error('uploadAlbumCover exception:', err)
    return null
  }
}

/** Remove um arquivo de qualquer bucket pelo path. */
export async function deleteStorageFile(
  bucket: string,
  path: string
): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) console.error('deleteStorageFile error:', error.message)
  } catch (err) {
    console.error('deleteStorageFile exception:', err)
  }
}

/** Deleta arquivo de áudio do bucket track-versions dado o versionId e extensão. */
export async function deleteTrackVersion(
  versionId: string,
  ext = 'mp3'
): Promise<void> {
  await deleteStorageFile(BUCKET_TRACKS, `${versionId}.${ext}`)
}

/** Deleta capa do álbum do bucket album-covers dado albumId e extensão. */
export async function deleteAlbumCover(
  albumId: string,
  ext = 'jpg'
): Promise<void> {
  await deleteStorageFile(BUCKET_COVERS, `${albumId}.${ext}`)
}
