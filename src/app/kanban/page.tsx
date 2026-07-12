'use client'

import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { getKanbanCardsAsync, saveKanbanCard, deleteKanbanCard } from '@/lib/storage'
import { KanbanCard, KanbanStage } from '@/lib/types'
import KanbanCardModal from '@/components/kanban/KanbanCardModal'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { filterKanbanForUser } from '@/lib/permissions'
import { Mic2, Sliders, Headphones, RotateCcw, CheckCircle2, Plus, Calendar, Trash2, Edit2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

const COLUMNS: { id: KanbanStage; label: string; color: string; bg: string; border: string; icon: any }[] = [
  { id: 'gravacao', label: 'Gravação', color: 'text-[#E74C3C]', bg: 'bg-[#C0392B]/5', border: 'border-[#C0392B]/20', icon: Mic2 },
  { id: 'mix', label: 'Mix', color: 'text-gold', bg: 'bg-gold/5', border: 'border-gold/20', icon: Sliders },
  { id: 'master', label: 'Master', color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20', icon: Headphones },
  { id: 'recall', label: 'Recall', color: 'text-sky-400', bg: 'bg-sky-500/5', border: 'border-sky-500/20', icon: RotateCcw },
  { id: 'entregue', label: 'Entregue', color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', icon: CheckCircle2 },
]

export default function KanbanPage() {
  const { user, canEdit } = useAuth()
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)

  const loadData = async () => {
    const data = await getKanbanCardsAsync()
    setCards(filterKanbanForUser(data, user))
  }
  useEffect(() => { setMounted(true); loadData() }, [user])

  const handleDragEnd = (result: DropResult) => {
    if (!canEdit) return
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    const card = cards.find(c => c.id === draggableId)
    if (card) {
      saveKanbanCard({ ...card, stage: destination.droppableId as KanbanStage, daysInStage: 0 })
      loadData()
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir "${name}" do painel?`)) { deleteKanbanCard(id); loadData() }
  }
  const handleEdit = (card: KanbanCard) => { setSelectedCard(card); setIsModalOpen(true) }
  const handleNew = () => { setSelectedCard(null); setIsModalOpen(true) }

  const getDaysText = (entryDateStr: string) => {
    try {
      const days = differenceInDays(new Date(), new Date(entryDateStr))
      if (days === 0) return 'Hoje'
      if (days === 1) return '1 dia'
      return `${days} dias`
    } catch { return 'N/A' }
  }

  const getPriorityVariant = (p: KanbanCard['priority']): 'crimson' | 'gold' | 'gray' => {
    if (p === 'urgente') return 'crimson'
    if (p === 'normal') return 'gold'
    return 'gray'
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 pt-8 md:pt-12 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1e1e1e]">
        <div>
          <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">Painel de Produção</h1>
          <p className="text-sm text-[#888] mt-1.5">
            {canEdit ? 'Arraste as faixas para atualizar o estágio de produção' : 'Acompanhe o status das suas faixas'}
          </p>
        </div>
        {canEdit && (
          <button onClick={handleNew} className="btn-primary">
            <Plus size={16} />Nova Música
          </button>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 sm:px-6 md:px-8 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 h-full" style={{ minWidth: 1100, minHeight: 520 }}>
            {COLUMNS.map(col => {
              const colCards = cards.filter(c => c.stage === col.id)
              const Icon = col.icon
              return (
                <div
                  key={col.id}
                  className={`flex flex-col flex-1 min-w-[250px] max-w-[310px] rounded-2xl border border-[#1e1e1e] bg-[#0a0a0a] overflow-hidden`}
                >
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-4 py-4 border-b border-[#1e1e1e] ${col.bg} flex-shrink-0`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${col.bg} border ${col.border}`}>
                        <Icon size={13} className={col.color} />
                      </div>
                      <span className={`font-semibold text-sm tracking-wide ${col.color}`}>{col.label}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${col.bg} ${col.color} border ${col.border}`}>
                      {colCards.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-3.5 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-[#111] ring-1 ring-inset ring-gold/20' : ''}`}
                      >
                        {colCards.map((card, index) => {
                          const isOverdue = card.deadline && new Date(card.deadline) < new Date()
                          return (
                            <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={!canEdit}>
                              {(dp, ds) => (
                                <div
                                  ref={dp.innerRef}
                                  {...dp.draggableProps}
                                  {...(canEdit ? dp.dragHandleProps : {})}
                                  className={`bg-[#111] border rounded-xl p-4 flex flex-col gap-3 group transition-all
                                    ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                                    ${ds.isDragging
                                      ? 'border-gold/40 shadow-[0_8px_32px_rgba(139,92,246,0.25)] scale-[1.03] rotate-1'
                                      : 'border-[#1e1e1e] hover:border-[#2a2a2a] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                                    }`}
                                >
                                  {/* Priority + actions */}
                                  <div className="flex justify-between items-start gap-2">
                                    <Badge variant={getPriorityVariant(card.priority)} size="sm">
                                      {card.priority}
                                    </Badge>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {canEdit && (
                                        <>
                                          <button onClick={() => handleEdit(card)} className="btn-icon" style={{ padding: '5px' }}>
                                            <Edit2 size={11} />
                                          </button>
                                          <button onClick={() => handleDelete(card.id, card.trackName)} className="btn-icon btn-icon-danger" style={{ padding: '5px' }}>
                                            <Trash2 size={11} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Track name */}
                                  <div>
                                    <h4 className="font-bebas text-[15px] text-[#F0F0F0] tracking-wide leading-none truncate">{card.trackName}</h4>
                                    <p className="text-[11px] text-[#555] mt-1 truncate">{card.artistName}</p>
                                  </div>

                                  {/* Footer */}
                                  <div className="pt-2.5 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] text-[#444]">
                                    <span className="bg-[#0d0d0d] border border-[#1a1a1a] px-2.5 py-1 rounded-lg">
                                      {getDaysText(card.entryDate)}
                                    </span>
                                    {card.deadline && (
                                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#E74C3C] font-bold' : ''}`}>
                                        <Calendar size={9} />
                                        {format(new Date(card.deadline), 'dd/MM')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                        {colCards.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-[#1a1a1a] text-[#2a2a2a] text-xs gap-2">
                            <Icon size={20} className="opacity-40" />
                            <span>Vazio</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {canEdit && (
        <KanbanCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} card={selectedCard} onSave={loadData} />
      )}
    </div>
  )
}
