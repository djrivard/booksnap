"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"

export function AuthModal({
  isOpen,
  onClose,
  defaultView = "sign-in",
}: {
  isOpen: boolean
  onClose: () => void
  defaultView?: "sign-in" | "sign-up"
}) {
  const [view, setView] = useState<"sign-in" | "sign-up">(defaultView)

  const toggleView = () => {
    setView(view === "sign-in" ? "sign-up" : "sign-in")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
        {view === "sign-in" ? <SignInForm onToggleForm={toggleView} /> : <SignUpForm onToggleForm={toggleView} />}
      </DialogContent>
    </Dialog>
  )
}
