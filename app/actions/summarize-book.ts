"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface BookSummary {
  title: string
  author: string
  overview: string
  mainPoints: string[]
  keyThemes: string[]
  callToAction: string
  conclusion: string
  rating: number
  notes?: string
}

export async function summarizeBook(formData: FormData): Promise<BookSummary> {
  const title = formData.get("title") as string
  const author = formData.get("author") as string

  if (!title || !author) {
    throw new Error("Both title and author are required")
  }

  const prompt = `Please provide a comprehensive summary of the book "${title}" by ${author}. 

Structure your response as a JSON object with the following fields:
- title: The book title
- author: The author name
- overview: A detailed overview of the book (at least 4 paragraphs) including when it was written, its historical context, and its significance
- mainPoints: An array of 5-7 key main points or lessons from the book
- keyThemes: An array of 3-5 major themes explored in the book
- callToAction: The main actionable advice or call to action from the book
- conclusion: The book's primary conclusion or final message
- rating: A rating from 1-10 based on the book's impact and usefulness

IMPORTANT: Return ONLY the raw JSON with no markdown formatting, code blocks, or additional text.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    // Clean the response to extract just the JSON part
    let jsonText = text

    // Remove markdown code blocks if present
    if (jsonText.includes("```")) {
      // Extract content between code blocks
      const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match && match[1]) {
        jsonText = match[1].trim()
      }
    }

    // Parse the JSON response
    try {
      const summary = JSON.parse(jsonText) as BookSummary
      return summary
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      console.error("Attempted to parse:", jsonText)
      throw new Error("Failed to parse the AI response. Please try again.")
    }
  } catch (error) {
    console.error("Error summarizing book:", error)
    throw new Error("Failed to generate book summary. Please try again.")
  }
}
