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
    const { rows } = await pool.query(`
      SELECT id, name_en, name_cn, age, generation, home_province, positions, degrees
      FROM officials
      ORDER BY id
    `)
    
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching officials:", error)
    return NextResponse.json(
      { error: "Failed to fetch officials" },
      { status: 500 }
    )
  }
} 