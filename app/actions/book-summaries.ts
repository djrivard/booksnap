"use server"

import { createClient } from "@supabase/supabase-js"
import type { BookSummary } from "./summarize-book"
import { revalidatePath } from "next/cache"

// Create a server client for database operations
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function saveSummary(summary: BookSummary, userId: string, notes = "") {
  try {
    const supabase = createServerClient()

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
      notes: notes,
    })

    if (error) {
      console.error("Error saving summary:", error)
      throw new Error("Failed to save summary")
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in saveSummary:", error)
    throw new Error("Failed to save summary")
  }
}

export async function getUserSummaries(userId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("book_summaries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching summaries:", error)
      throw new Error("Failed to fetch summaries")
    }

    if (!data) {
      return []
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
      notes: item.notes || "",
      createdAt: item.created_at,
    })) as (BookSummary & { notes: string; createdAt: string })[]
  } catch (error) {
    console.error("Error in getUserSummaries:", error)
    throw new Error("Failed to fetch summaries")
  }
}

export async function deleteSummary(userId: string, title: string, author: string) {
  try {
    const supabase = createServerClient()

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
  } catch (error) {
    console.error("Error in deleteSummary:", error)
    throw new Error("Failed to delete summary")
  }
}

export async function updateSummaryNotes(userId: string, title: string, author: string, notes: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("book_summaries")
      .update({ notes: notes })
      .eq("user_id", userId)
      .eq("title", title)
      .eq("author", author)

    if (error) {
      console.error("Error updating notes:", error)
      throw new Error("Failed to update notes")
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in updateSummaryNotes:", error)
    throw new Error("Failed to update notes")
  }
}
