"use client"

import React, { useState } from "react"
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  MessageSquareQuote,
  Sparkles,
  User,
  Send,
  X,
  ChevronUp,
} from "lucide-react"
import { TrackFeedback, AlbumTrack } from "@/lib/types"
import { generateId } from "@/lib/storage"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"
import { useAuth } from "@/contexts/AuthContext"

interface TrackFeedbackListProps {
  track: AlbumTrack
  onUpdateFeedbacks: (feedbacks: TrackFeedback[]) => void
  isCurrentPlaying?: boolean
  onClose?: () => void
}

export function TrackFeedbackList({
  track,
  onUpdateFeedbacks,
  isCurrentPlaying = false,
  onClose,
}: TrackFeedbackListProps) {
  const { user } = useAuth()
  const { currentTime, seek } = useAudioPlayer()

  const feedbacks = track.feedbacks || []
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState(user?.name || "Produtor")
  const [useCurrentTime, setUseCurrentTime] = useState(false)

  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const completedCount = feedbacks.filter((f) => f.isCompleted).length
  const totalCount = feedbacks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleToggleCompleted = (feedbackId: string) => {
    const updated = feedbacks.map((f) => {
      if (f.id === feedbackId) {
        const nextState = !f.isCompleted
        return {
          ...f,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        }
      }
      return f
    })
    onUpdateFeedbacks(updated)
  }

  const handleDeleteFeedback = (feedbackId: string) => {
    const updated = feedbacks.filter((f) => f.id !== feedbackId)
    onUpdateFeedbacks(updated)
  }

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const newFeedback: TrackFeedback = {
      id: `fb-${generateId()}`,
      author: author.trim() || "Anônimo",
      timestampSeconds: useCurrentTime ? Math.floor(currentTime) : undefined,
      content: content.trim(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }

    onUpdateFeedbacks([...feedbacks, newFeedback])
    setContent("")
    setUseCurrentTime(false)
  }

  return (
    <div className="bg-[#0e0e10] border border-[#222226] rounded-2xl p-4 md:p-5 space-y-4 shadow-inner">
      {/* Header com Progresso e Botão Fechar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1e1e22] pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquareQuote size={16} className="text-[#22c55e] flex-shrink-0" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4d4d8] truncate">
            Tópicos de Revisão & Feedbacks
          </h4>
          <span className="text-[10px] font-mono text-[#71717a] flex-shrink-0">
            ({completedCount}/{totalCount})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {totalCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 h-1.5 bg-[#1e1e22] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#22c55e] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-mono font-bold ${
                  progressPercent === 100 ? "text-[#4ade80]" : "text-[#71717a]"
                }`}
              >
                {progressPercent}% OK
              </span>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#222226] text-[#a1a1aa] hover:text-white border border-[#27272e] text-[11px] font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Fechar aba de feedbacks"
            >
              <span>Fechar</span>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Feedbacks */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-[#222226] bg-[#121214]/40">
          <p className="text-xs text-[#71717a]">
            Nenhum tópico de revisão adicionado para esta faixa.
          </p>
          <p className="text-[11px] text-[#52525b] mt-0.5">
            Adicione anotações de mixagem ou carimbe trechos do áudio abaixo.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {feedbacks.map((f) => (
            <li
              key={f.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                f.isCompleted
                  ? "bg-[#22c55e]/5 border-[#22c55e]/20 opacity-80"
                  : "bg-[#141417] border-[#222226] hover:border-[#2e2e34]"
              }`}
            >
              {/* Botão de OK (Checkbox) */}
              <button
                type="button"
                onClick={() => handleToggleCompleted(f.id)}
                title={f.isCompleted ? "Marcar como pendente" : "Dar OK (Ajuste concluído)"}
                className="mt-0.5 flex-shrink-0 cursor-pointer text-[#52525b] hover:text-[#22c55e] transition-colors"
              >
                {f.isCompleted ? (
                  <CheckCircle2 size={18} className="text-[#22c55e] fill-[#22c55e]/20" />
                ) : (
                  <Circle size={18} />
                )}
              </button>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {f.timestampSeconds !== undefined && (
                    <button
                      type="button"
                      onClick={() => seek(f.timestampSeconds!)}
                      title={`Pular para ${formatSeconds(f.timestampSeconds)} no player`}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1f1f24] hover:bg-[#22c55e]/20 border border-[#27272a] text-[#4ade80] text-[10px] font-mono font-bold transition-all cursor-pointer"
                    >
                      <Clock size={10} />
                      <span>{formatSeconds(f.timestampSeconds)}</span>
                    </button>
                  )}

                  <span className="text-[10px] text-[#71717a] font-mono">
                    por <strong className="text-[#a1a1aa]">{f.author}</strong>
                  </span>

                  {f.isCompleted && (
                    <span className="text-[9px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.2 rounded uppercase tracking-wider font-mono">
                      OK Feito
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs text-[#e4e4e7] leading-relaxed break-words ${
                    f.isCompleted ? "line-through text-[#71717a]" : ""
                  }`}
                >
                  {f.content}
                </p>
              </div>

              {/* Excluir comentário */}
              <button
                type="button"
                onClick={() => handleDeleteFeedback(f.id)}
                title="Excluir tópico"
                className="text-[#52525b] hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all flex-shrink-0 cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Formulário Novo Feedback */}
      <form onSubmit={handleAddFeedback} className="pt-2 border-t border-[#1e1e22] space-y-3">
        <div>
          <input
            type="text"
            placeholder="Escreva um ajuste (ex: Aumentar o volume da dobra de voz no refrão)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-dark w-full text-xs"
            required
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-[#52525b]" />
              <input
                type="text"
                placeholder="Seu nome"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="input-dark text-[11px] py-1 px-2 w-28 md:w-36"
              />
            </div>

            {/* Carimbar tempo atual */}
            <button
              type="button"
              onClick={() => setUseCurrentTime(!useCurrentTime)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border cursor-pointer ${
                useCurrentTime
                  ? "bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80]"
                  : "bg-[#141416] hover:bg-[#1a1a1e] border-[#27272a] text-[#71717a] hover:text-[#d4d4d8]"
              }`}
              title="Carimbar tempo que está tocando agora"
            >
              <Clock size={11} />
              <span>
                {useCurrentTime
                  ? `Carimbado: ${formatSeconds(Math.floor(currentTime))}`
                  : `Carimbar tempo (${formatSeconds(Math.floor(currentTime))})`}
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="inline-flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer active:scale-95"
          >
            <Plus size={14} />
            <span>Adicionar Ajuste</span>
          </button>
        </div>
      </form>

      {/* Botão de recolher no rodapé */}
      {onClose && (
        <div className="pt-2 flex justify-center border-t border-[#1a1a1e]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#d4d4d8] transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5 cursor-pointer font-mono"
          >
            <ChevronUp size={13} />
            <span>Recolher Feedbacks</span>
          </button>
        </div>
      )}
    </div>
  )
}
