import { NextResponse } from "next/server"
import { client } from "@/lib/sanity"

export async function GET() {
  try {
    const authors = await client.fetch(
      `*[_type == "author"] | order(name asc) {
        _id,
        name,
        role
      }`
    )

    return NextResponse.json(authors)
  } catch (error) {
    console.error("Error fetching authors:", error)
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 })
  }
}
