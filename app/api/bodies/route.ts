import { NextResponse } from "next/server"
import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    console.log("Attempting to connect to database...")
    const { rows } = await pool.query(`
      SELECT id, name, members, parent, caption, "order"
      FROM bodies
      ORDER BY parent NULLS FIRST, id
    `)
    console.log("Successfully fetched bodies:", rows.length)
    
    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Detailed error fetching bodies:", {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack
    })
    return NextResponse.json(
      { error: "Failed to fetch bodies", details: error?.message },
      { status: 500 }
    )
  }
} 