"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Save, Edit3 } from "lucide-react"

interface NotesSectionProps {
  initialNotes?: string
  onSaveNotes: (notes: string) => Promise<void>
  isAuthenticated: boolean
  onSignInPrompt: () => void
}

export function NotesSection({ initialNotes = "", onSaveNotes, isAuthenticated, onSignInPrompt }: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setHasUnsavedChanges(value !== initialNotes)
  }

  const handleSaveNotes = async () => {
    if (!isAuthenticated) {
      onSignInPrompt()
      return
    }

    setIsSaving(true)
    try {
      await onSaveNotes(notes)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Failed to save notes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Personal Notes
        </CardTitle>
        <CardDescription>
          {isAuthenticated
            ? "Write down your thoughts, key takeaways, or action items from this book"
            : "Sign in to save personal notes for this book"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder={
              isAuthenticated
                ? "What are your key takeaways? How will you apply these insights? What questions do you have?"
                : "Sign in to write and save notes..."
            }
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={!isAuthenticated}
            className="min-h-[120px] resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          {!isAuthenticated && (
            <div className="absolute inset-0 bg-gray-50/50 rounded-md flex items-center justify-center">
              <Button
                onClick={onSignInPrompt}
                variant="outline"
                className="bg-white shadow-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Sign In to Add Notes
              </Button>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-amber-600">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  Unsaved changes
                </span>
              )}
              {!hasUnsavedChanges && notes && (
                <span className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Notes saved
                </span>
              )}
            </div>
            <Button
              onClick={handleSaveNotes}
              disabled={isSaving || !hasUnsavedChanges}
              size="sm"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSaving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
