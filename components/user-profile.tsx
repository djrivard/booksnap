"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, BookMarked } from "lucide-react"
import { AuthModal } from "./auth/auth-modal"

export function UserProfile() {
  const { user, signOut, isLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<"sign-in" | "sign-up">("sign-in")

  const handleSignOut = async () => {
    await signOut()
  }

  const openSignIn = () => {
    setAuthModalView("sign-in")
    setIsAuthModalOpen(true)
  }

  const openSignUp = () => {
    setAuthModalView("sign-up")
    setIsAuthModalOpen(true)
  }

  if (isLoading) {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={openSignIn}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
        >
          Sign In
        </Button>
        <Button
          onClick={openSignUp}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          Sign Up
        </Button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultView={authModalView} />
      </div>
    )
  }

  // Get initials from email
  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-indigo-100">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              <p className="text-xs leading-none text-gray-500">Signed in</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              const summariesSection = document.querySelector("[data-summaries-section]")
              if (summariesSection) {
                summariesSection.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            <BookMarked className="mr-2 h-4 w-4" />
            <span>My Summaries</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
