"use client"

import { useEffect } from "react"

/**
 * Registra o Service Worker do PWA.
 * Deve ser renderizado apenas uma vez, no layout raiz.
 */
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[PWA] Service Worker registrado:", reg.scope)
        })
        .catch((err) => {
          console.warn("[PWA] Falha ao registrar SW:", err)
        })
    }
  }, [])

  return null
}
