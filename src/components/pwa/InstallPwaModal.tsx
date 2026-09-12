"use client"

import React, { useState, useEffect } from "react"
import { Download, Smartphone, Share, PlusSquare, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPwaModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(isStandaloneMode)

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    const handlePrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handlePrompt)
    window.addEventListener("appinstalled", () => {
      setInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        setInstalled(true)
        setTimeout(() => onClose(), 1500)
      }
      setDeferredPrompt(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#1e1e1e] rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors cursor-pointer p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/30 flex items-center justify-center text-[#16a34a]">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="font-bebas text-xl text-[#F0F0F0] tracking-wide">
              Instalar Xeque Mate
            </h3>
            <p className="text-xs text-[#888]">Acesse direto da tela inicial do seu celular</p>
          </div>
        </div>

        {isStandalone || installed ? (
          <div className="bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-xl p-4 flex items-center gap-3 text-sm text-[#4ade80]">
            <Check size={20} className="shrink-0" />
            <span>O aplicativo já está instalado no seu dispositivo!</span>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 bg-[#141416] border border-[#222] rounded-xl p-4 text-xs text-[#ccc]">
            <p className="font-semibold text-white">Como instalar no iPhone (Safari):</p>
            <ol className="space-y-2 list-decimal list-inside text-[#aaa]">
              <li className="flex items-center gap-2">
                <span>1. Toque no botão de <strong>Compartilhar</strong></span>
                <Share size={14} className="text-[#16a34a]" />
              </li>
              <li className="flex items-center gap-2">
                <span>2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong></span>
                <PlusSquare size={14} className="text-[#16a34a]" />
              </li>
              <li>
                <span>3. Toque em <strong>Adicionar</strong> no canto superior direito</span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <p className="text-xs text-[#aaa]">
              Clique no botão abaixo para adicionar o app à sua tela inicial com ícone dedicado e modo tela cheia.
            </p>
            <Button onClick={handleInstallClick} className="w-full" size="lg">
              <Download size={18} /> Instalar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-3 bg-[#141416] border border-[#222] rounded-xl p-4 text-xs text-[#ccc]">
            <p className="font-semibold text-white">Como instalar no Android (Chrome):</p>
            <ol className="space-y-1.5 list-decimal list-inside text-[#aaa]">
              <li>Toque nos <strong>3 pontinhos</strong> do navegador no canto superior direito</li>
              <li>Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong></li>
              <li>Confirme a instalação</li>
            </ol>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Entendi
          </Button>
        </div>
      </div>
    </div>
  )
}
