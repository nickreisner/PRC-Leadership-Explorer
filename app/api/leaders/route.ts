import { NextResponse } from "next/server"
import { Pool } from "pg"
import { Leader, LeadershipCategory } from "@/lib/types"

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_8Smdl9VwpUhB@ep-empty-frost-a6loh4vt-pooler.us-west-2.aws.neon.tech/chinese_leadership?sslmode=require",
})

interface LeadersByGroup {
  [key: string]: LeadershipCategory
}

export async function GET() {
  try {
    // Connect to the database
    const client = await pool.connect()

    try {
      // First, get all unique branches
      const branchesQuery = `
        SELECT DISTINCT branch 
        FROM groups 
        ORDER BY branch
      `
      const branchesResult = await client.query(branchesQuery)
      const branches = branchesResult.rows.map(row => row.branch)

      // For each branch, get all bodies
      const bodiesQuery = `
        SELECT DISTINCT branch, body 
        FROM groups 
        ORDER BY branch, body
      `
      const bodiesResult = await client.query(bodiesQuery)
      const bodiesByBranch = bodiesResult.rows.reduce((acc, row) => {
        if (!acc[row.branch]) {
          acc[row.branch] = []
        }
        acc[row.branch].push(row.body)
        return acc
      }, {} as Record<string, string[]>)

      // For each body, get all groups
      const groupsQuery = `
        SELECT DISTINCT branch, body, group_name 
        FROM groups 
        ORDER BY branch, body, group_name
      `
      const groupsResult = await client.query(groupsQuery)
      const groupsByBody = groupsResult.rows.reduce((acc, row) => {
        const key = `${row.branch}-${row.body}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(row.group_name)
        return acc
      }, {} as Record<string, string[]>)

      // Now get all the leader data
      const leadersQuery = `
        SELECT 
          p.name_en,
          p.name_cn,
          p.age,
          p.generation,
          p.hometown,
          g.branch,
          g.body,
          g.group_name,
          pos.position,
          e.degree
        FROM 
          people p
        LEFT JOIN 
          groups g ON p.name_en = g.name_en
        LEFT JOIN 
          positions pos ON p.name_en = pos.name_en
        LEFT JOIN 
          education e ON p.name_en = e.name_en
        ORDER BY g.branch, g.body, g.group_name, p.name_en
      `

      const leadersResult = await client.query(leadersQuery)
      const leadersByGroup: LeadersByGroup = {}

      leadersResult.rows.forEach((row) => {
        const groupKey = `${row.branch}-${row.body}-${row.group_name}`

        if (!leadersByGroup[groupKey]) {
          leadersByGroup[groupKey] = {
            id: groupKey.toLowerCase().replace(/\s+/g, "-"),
            name: row.group_name,
            type: row.branch.toLowerCase(),
            leaders: [],
          }
        }

        const existingLeaderIndex = leadersByGroup[groupKey].leaders.findIndex(
          (leader: Leader) => leader.id === row.name_en.toLowerCase().replace(/\s+/g, "-")
        )

        if (existingLeaderIndex === -1) {
          // Create new leader with arrays for positions and education
          const newLeader: Leader = {
            id: row.name_en.toLowerCase().replace(/\s+/g, "-"),
            name: row.name_en,
            chineseName: row.name_cn || "",
            title: row.position ? [row.position] : [],
            image: `/placeholder.svg?height=200&width=150`,
            hometown: row.hometown || "",
            education: row.degree ? [row.degree] : [],
            generation: row.generation || "",
            visible: true,
          }
          leadersByGroup[groupKey].leaders.push(newLeader)
        } else {
          const leader = leadersByGroup[groupKey].leaders[existingLeaderIndex]
          
          // Add position if not already included
          if (row.position) {
            const titles = Array.isArray(leader.title) ? leader.title : [leader.title]
            if (!titles.includes(row.position)) {
              leader.title = [...titles, row.position]
            }
          }

          // Add education if not already included
          if (row.degree) {
            const degrees = Array.isArray(leader.education) ? leader.education : [leader.education]
            if (!degrees.includes(row.degree)) {
              leader.education = [...degrees, row.degree]
            }
          }
        }
      })

      // Convert arrays to newline-separated strings before sending
      Object.values(leadersByGroup).forEach(group => {
        group.leaders.forEach(leader => {
          if (Array.isArray(leader.title)) {
            leader.title = leader.title.join('\n')
          }
          if (Array.isArray(leader.education)) {
            leader.education = leader.education.join('\n')
          }
        })
      })

      // Organize the data hierarchically
      const organizedData = branches.map((branch: string) => {
        const bodies = bodiesByBranch[branch] || []
        return {
          id: branch.toLowerCase(),
          name: branch,
          type: branch.toLowerCase(),
          bodies: bodies.map((body: string) => {
            const groups = groupsByBody[`${branch}-${body}`] || []
            return {
              id: `${branch}-${body}`.toLowerCase().replace(/\s+/g, "-"),
              name: body,
              groups: groups.map((group: string) => {
                const groupKey = `${branch}-${body}-${group}`
                return leadersByGroup[groupKey] || {
                  id: groupKey.toLowerCase().replace(/\s+/g, "-"),
                  name: group,
                  type: branch.toLowerCase(),
                  leaders: []
                }
              })
            }
          })
        }
      })

      return NextResponse.json(organizedData)
    } finally {
      // Release the client back to the pool
      client.release()
    }
  } catch (error) {
    console.error("Error fetching leaders:", error)
    return NextResponse.json({ error: "Failed to fetch leaders" }, { status: 500 })
  }
}
