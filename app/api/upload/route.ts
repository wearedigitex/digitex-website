import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { adminClient } from "@/lib/sanity"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Sanity
    const asset = await adminClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return NextResponse.json({ 
      success: true, 
      assetId: asset._id,
      url: asset.url
    })
  } catch (error) {
    console.error("Upload error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to upload image" 
    }, { status: 500 })
  }
}
