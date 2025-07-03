export interface Leader {
  id: string
  name: string
  chineseName?: string
  title?: string[] | string
  image?: string
  hometown?: string
  education?: string[] | string
  generation?: string
  age?: string
  visible: boolean
  highlighted?: boolean
}

export interface LeadershipCategory {
  id: string
  name: string
  type: "party" | "state"
  leaders: Leader[]
}

export interface LeaderData extends Array<LeadershipCategory> {} 