"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  Users,
  DollarSign,
  Mic2,
  Music,
  Plus,
  ArrowRight,
  Sparkles,
  Disc3,
} from "lucide-react"
import { getArtistsAsync, getKanbanCardsAsync } from "@/lib/storage"
import { Artist, KanbanCard } from "@/lib/types"

export function GlobalCommandMenu() {
  const [open, setOpen] = useState(false)
  const [artists, setArtists] = useState<Artist[]>([])
  const [tracks, setTracks] = useState<KanbanCard[]>([])
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    const handleCustomOpen = () => setOpen(true)
    window.addEventListener("open-command-menu", handleCustomOpen)
    document.addEventListener("keydown", down)

    return () => {
      window.removeEventListener("open-command-menu", handleCustomOpen)
      document.removeEventListener("keydown", down)
    }
  }, [])

  useEffect(() => {
    if (open) {
      Promise.all([getArtistsAsync(), getKanbanCardsAsync()]).then(
        ([arts, cards]) => {
          setArtists(arts)
          setTracks(cards)
        }
      )
    }
  }, [open])

  const runCommand = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando, artista ou música..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {/* ─── Ações Rápidas ─── */}
        <CommandGroup heading="Ações Rápidas">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                router.push("/kanban")
              })
            }
          >
            <Plus className="mr-2 h-4 w-4 text-[#22c55e]" />
            <span>Nova Música no Kanban</span>
            <CommandShortcut>K</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                router.push("/schedule")
              })
            }
          >
            <Calendar className="mr-2 h-4 w-4 text-sky-400" />
            <span>Agendar Nova Sessão</span>
            <CommandShortcut>A</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                router.push("/artists")
              })
            }
          >
            <Mic2 className="mr-2 h-4 w-4 text-purple-400" />
            <span>Cadastrar Novo Artista</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                router.push("/finances")
              })
            }
          >
            <DollarSign className="mr-2 h-4 w-4 text-gold" />
            <span>Registrar Entrada / Saída</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ─── Navegação ─── */}
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/kanban"))}>
            <Kanban className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Produção (Kanban)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/albums"))}>
            <Disc3 className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Álbuns & EPs</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/schedule"))}>
            <Calendar className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Agenda de Estúdio & Shows</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/artists"))}>
            <Mic2 className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Artistas da Produtora</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/clients"))}>
            <Users className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Clientes & Contatos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/finances"))}>
            <DollarSign className="mr-2 h-4 w-4 text-[#71717a]" />
            <span>Fluxo Financeiro</span>
          </CommandItem>
        </CommandGroup>

        {/* ─── Artistas ─── */}
        {artists.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Artistas do Casting">
              {artists.slice(0, 5).map((artist) => (
                <CommandItem
                  key={artist.id}
                  onSelect={() =>
                    runCommand(() => {
                      router.push("/artists")
                    })
                  }
                >
                  <Mic2 className="mr-2 h-4 w-4 text-[#22c55e]" />
                  <span>{artist.artisticName}</span>
                  <span className="ml-2 text-[10px] text-[#71717a] uppercase font-mono">
                    ({artist.genre})
                  </span>
                  <ArrowRight className="ml-auto h-3 w-3 text-[#52525b]" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ─── Músicas no Kanban ─── */}
        {tracks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Músicas em Produção">
              {tracks.slice(0, 5).map((track) => (
                <CommandItem
                  key={track.id}
                  onSelect={() =>
                    runCommand(() => {
                      router.push("/kanban")
                    })
                  }
                >
                  <Music className="mr-2 h-4 w-4 text-gold" />
                  <span>{track.trackName}</span>
                  <span className="ml-2 text-[10px] text-[#71717a]">
                    • {track.artistName}
                  </span>
                  <span className="ml-auto text-[10px] uppercase font-semibold text-[#22c55e]">
                    {track.stage}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
