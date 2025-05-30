"use server"

import { createServerClient } from "@/lib/supabase-server"
import type { BookSummary } from "./summarize-book"
import { revalidatePath } from "next/cache"

export async function saveSummary(summary: BookSummary, userId: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("book_summaries").insert({
    user_id: userId,
    title: summary.title,
    author: summary.author,
    overview: summary.overview,
    main_points: summary.mainPoints,
    key_themes: summary.keyThemes,
    call_to_action: summary.callToAction,
    conclusion: summary.conclusion,
    rating: summary.rating,
  })

  if (error) {
    console.error("Error saving summary:", error)
    throw new Error("Failed to save summary")
  }

  revalidatePath("/")
  return { success: true }
}

export async function getUserSummaries(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("book_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching summaries:", error)
    throw new Error("Failed to fetch summaries")
  }

  // Convert from database format to app format
  return data.map((item) => ({
    title: item.title,
    author: item.author,
    overview: item.overview,
    mainPoints: item.main_points,
    keyThemes: item.key_themes,
    callToAction: item.call_to_action,
    conclusion: item.conclusion,
    rating: item.rating,
    createdAt: item.created_at,
  })) as (BookSummary & { createdAt: string })[]
}

export async function deleteSummary(userId: string, title: string, author: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("book_summaries")
    .delete()
    .eq("user_id", userId)
    .eq("title", title)
    .eq("author", author)

  if (error) {
    console.error("Error deleting summary:", error)
    throw new Error("Failed to delete summary")
  }

  revalidatePath("/")
  return { success: true }
}
