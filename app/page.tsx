"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Sparkles, Target, CheckCircle, Star, Clock, Trash2 } from "lucide-react"
import { summarizeBook, type BookSummary } from "./actions/summarize-book"

export default function BookSummaryApp() {
  const [summary, setSummary] = useState<BookSummary | null>(null)
  const [recentSummaries, setRecentSummaries] = useState<BookSummary[]>([])
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await summarizeBook(formData)
        setSummary(result)

        // Add to recent summaries
        const newRecentSummaries = [
          result,
          ...recentSummaries.filter((s) => s.title !== result.title || s.author !== result.author),
        ].slice(0, 5)
        setRecentSummaries(newRecentSummaries)
        localStorage.setItem("recentSummaries", JSON.stringify(newRecentSummaries))

        return { success: true, error: null }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An error occurred" }
      }
    },
    { success: false, error: null },
  )

  // Load recent summaries from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSummaries")
    if (saved) {
      try {
        setRecentSummaries(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse recent summaries:", error)
      }
    }
  }, [])

  const loadSummary = (bookSummary: BookSummary) => {
    setSummary(bookSummary)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearRecentSummaries = () => {
    setRecentSummaries([])
    localStorage.removeItem("recentSummaries")
  }

  const removeSummary = (titleToRemove: string, authorToRemove: string) => {
    const filtered = recentSummaries.filter((s) => !(s.title === titleToRemove && s.author === authorToRemove))
    setRecentSummaries(filtered)
    localStorage.setItem("recentSummaries", JSON.stringify(filtered))
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/library-background.webp')",
        }}
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-10 w-10 text-indigo-600" />
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">BookSnap</h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-lg">
              Get instant book summaries. Discover insights, main points and takeaways from any book.
            </p>
          </div>

          {/* Input Form */}
          <Card className="max-w-2xl mx-auto mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Summarize a Book
              </CardTitle>
              <CardDescription>Enter any book title and author to get a its summary with key insights.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={action} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Atomic Habits"
                      required
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                      Author
                    </label>
                    <Input
                      id="author"
                      name="author"
                      placeholder="e.g., James Clear"
                      required
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3"
                >
                  {isPending ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Summarize Book
                    </>
                  )}
                </Button>
              </form>
              {state.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{state.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Results */}
          {summary && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Book Header */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{summary.title}</CardTitle>
                      <CardDescription className="text-indigo-100 text-lg">by {summary.author}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{summary.rating}/10</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-gray-700 text-lg leading-relaxed space-y-4">
                    {summary.overview
                      .split("\n\n")
                      .slice(0, 2)
                      .map((paragraph, index) => (
                        <p key={index} className={index === 0 ? "font-medium" : ""}>
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Main Points */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Key Main Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {summary.mainPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Themes */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {summary.keyThemes.map((theme, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action & Conclusion */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Call to Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{summary.callToAction}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Conclusion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{summary.conclusion}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Summaries */}
              {recentSummaries.length > 0 && (
                <Card className="max-w-4xl mx-auto mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Recent Summaries
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSummaries}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear All
                      </Button>
                    </div>
                    <CardDescription>Click on any book to view its summary again</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {recentSummaries.map((bookSummary, index) => (
                        <div
                          key={`${bookSummary.title}-${bookSummary.author}-${index}`}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group"
                          onClick={() => loadSummary(bookSummary)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{bookSummary.title}</h4>
                              <p className="text-sm text-gray-600 truncate">by {bookSummary.author}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                              <Star className="h-3 w-3 fill-current text-yellow-600" />
                              <span className="text-xs font-semibold text-yellow-700">{bookSummary.rating}/10</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSummary(bookSummary.title, bookSummary.author)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Share & Explore More */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-center justify-center">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Share & Explore More
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
                      onClick={() => {
                        const text = `Just discovered "${summary.title}" by ${summary.author} on BookSnap! 📚✨`
                        const url = window.location.href
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                          "_blank",
                        )
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Share on X
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-green-50 border-green-200"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        // You could add a toast notification here
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Copy Link
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-orange-50 border-orange-200"
                      onClick={() => {
                        const searchQuery = `${summary.title} ${summary.author}`
                        window.open(
                          `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&i=stripbooks`,
                          "_blank",
                        )
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 8.206 3.166 13.044 3.166 2.688 0 5.25-.394 7.677-1.184.253-.082.4-.02.44.187.041.208-.044.314-.255.318-.211.004-1.93.32-2.395.398-2.756.466-5.426.7-8.006.7-2.581 0-5.054-.234-7.422-.7-.789-.155-2.395-.398-2.395-.398-.211-.004-.296-.11-.255-.318.04-.207.187-.269.44-.187.465-.078 2.184-.394 2.395-.398z" />
                        <path d="M18.5 11.5c0 .828-.224 1.5-.5 1.5s-.5-.672-.5-1.5.224-1.5.5-1.5.5.672.5 1.5z" />
                      </svg>
                      Find on Amazon
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-purple-50 border-purple-200"
                      onClick={() => {
                        const searchQuery = `${summary.title} ${summary.author}`
                        window.open(
                          `https://www.audible.com/search?keywords=${encodeURIComponent(searchQuery)}`,
                          "_blank",
                        )
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5,6 9,2 9,2 15,6 15,11 19,11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                      Listen on Audible
                    </Button>

                    <Button
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      onClick={() => {
                        setSummary(null)
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }}
                    >
                      <BookOpen className="h-4 w-4" />
                      Summarize Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
