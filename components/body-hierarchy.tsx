"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import LeaderCard from "./leader-card"

interface Official {
  id: number
  name_en: string
  name_cn: string
  age: number
  generation: number
  home_province: string
  positions: string[]
  degrees: {
    name: string
    level: string
    type: string
  }[]
}

interface Body {
  id: number
  name: string
  members: { id: number; title: string | null }[]
  parent: number | null
  caption?: string
  order?: number
}

interface Leader {
  id: string;
  name: string;
  chineseName?: string;
  age?: string;
  generation?: string;
  hometown?: string;
  title?: string; // General positions from officials table
  specificTitleInBody?: string; // Specific title/role within the current body
  education?: string;
  visible: boolean;
  highlight: boolean;
}

interface BodyHierarchyProps {
  bodies: Body[]
  officials: Official[]
  searchQuery: string
  filters: {
    hometown: string
    educationLevel: string
    educationType: string
    generation: string
  }
}

export default function BodyHierarchy({ bodies, officials, searchQuery, filters }: BodyHierarchyProps) {
  const topLevelBodies = bodies
    .filter(body => body.parent === null)
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))

  const getNestedBodies = (parentId: number) => {
    return bodies
      .filter(body => body.parent === parentId)
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
  }

  const getLeaderData = (memberId: number, roleInBodyParam?: string | null): Leader | null => {
    const official = officials.find(o => o.id === memberId)
    if (!official) return null

    const searchLower = searchQuery.toLowerCase()
    const searchMatch = searchQuery === "" || 
                        official.name_en.toLowerCase().includes(searchLower) || 
                        (official.name_cn && official.name_cn.toLowerCase().includes(searchLower))

    const hometownMatch = filters.hometown === "Unknown"
      ? !official.home_province
      : !filters.hometown || official.home_province === filters.hometown

    const generationMatch = filters.generation === "Unknown"
      ? !official.generation
      : !filters.generation || official.generation?.toString() === filters.generation

    const educationLevelMatch = filters.educationLevel === "Unknown"
      ? !official.degrees || official.degrees.length === 0 || official.degrees.every(d => !d.level || d.level.trim() === "")
      : !filters.educationLevel || official.degrees?.some(d => {
          if (!d.level || d.level.trim() === "") return false
          const level = d.level.toLowerCase().trim()
          const filterLevel = filters.educationLevel.toLowerCase().trim()
          if (filterLevel === "bachelor's") return level.includes("bachelor")
          if (filterLevel === "master's") return level.includes("master")
          if (filterLevel === "doctor's") return level.includes("doctor") || level.includes("phd")
          if (filterLevel === "stem") return level.includes("stem")
          if (filterLevel === "associate's") return level.includes("associate")
          return (level.charAt(0).toUpperCase() + level.slice(1)) === filters.educationLevel
        })

    const educationTypeMatch = filters.educationType === "Unknown"
      ? !official.degrees || official.degrees.length === 0 || official.degrees.every(d => !d.type || d.type.trim() === "")
      : !filters.educationType || official.degrees?.some(d => {
          if (!d.type || d.type.trim() === "") return false
          const type = d.type.toLowerCase().trim()
          const filterType = filters.educationType.toLowerCase().trim()
          const normalizedFilterType = filterType === "stem" ? "stem" : filterType
          if (filterType.toUpperCase() === "STEM") return type.includes("stem")
          return type === normalizedFilterType
        })

    const filterMatch = hometownMatch && generationMatch && educationLevelMatch && educationTypeMatch
    const hasActiveFilters = !!(filters.hometown || filters.generation || filters.educationLevel || filters.educationType)

    const isVisible = searchMatch && (!hasActiveFilters || filterMatch)
    const isHighlighted = searchMatch && hasActiveFilters && filterMatch

    return {
      id: official.id.toString(),
      name: official.name_en,
      chineseName: official.name_cn || undefined,
      age: official.age?.toString() || undefined,
      generation: official.generation?.toString() || undefined,
      hometown: official.home_province || undefined,
      title: official.positions?.length ? official.positions.join("\n") : undefined,
      specificTitleInBody: roleInBodyParam || undefined,
      education: official.degrees?.length ? official.degrees.map(d => `${d.name || 'N/A'}`).join("\n") : undefined,
      visible: !!isVisible,
      highlight: !!isHighlighted
    }
  }

  const renderBody = (body: Body) => {
    const nestedBodies = getNestedBodies(body.id)
    const currentMembers = body.members
      .map(member => getLeaderData(member.id, member.title))
      .filter((leader): leader is Leader => leader !== null)

    if (!body.name && currentMembers.length === 0 && nestedBodies.length === 0) {
        return null;
    }

    return (
      <div key={body.id} className="space-y-4 pt-4">
        <div className="text-center">
          <h4 className="text-base font-semibold">{body.name}</h4>
          {body.caption && <p className="text-sm text-muted-foreground">{body.caption}</p>}
        </div>
        
        {currentMembers.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 items-start">
            {currentMembers.map((memberLeaderData) => (
              <div key={memberLeaderData.id} className="text-center w-60">
                {memberLeaderData.specificTitleInBody && (
                  <h5 className="text-sm font-semibold mb-1 text-center min-h-10 flex items-center justify-center" title={memberLeaderData.specificTitleInBody}>
                    {memberLeaderData.specificTitleInBody}
                  </h5>
                )}
                <LeaderCard leader={memberLeaderData} />
              </div>
            ))}
          </div>
        )}

        {nestedBodies.length > 0 && (
          <div className="space-y-4 pt-2">
            {nestedBodies.map(nestedBody => renderBody(nestedBody))}
          </div>
        )}
      </div>
    )
  }

  if (bodies.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No organizational data available.</div>;
  }
  
  if (topLevelBodies.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No top-level organizations found.</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={topLevelBodies[0]?.id.toString()} className="w-full">
        <TabsList className="w-full justify-center">
          {topLevelBodies.map((body) => (
            <TabsTrigger key={body.id} value={body.id.toString()}>
              {body.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {topLevelBodies.map((currentTopLevelBody) => {
          const membersOfTopLevelBody = currentTopLevelBody.members
            .map(member => getLeaderData(member.id, member.title))
            .filter((leader): leader is Leader => leader !== null);

          const firstLevelChildrenBodies = getNestedBodies(currentTopLevelBody.id);

          return (
            <TabsContent key={currentTopLevelBody.id} value={currentTopLevelBody.id.toString()}>
              <div className="space-y-6">
                {currentTopLevelBody.caption && (
                  <div className="mb-4 text-center">
                    <p className="text-lg text-muted-foreground italic">{currentTopLevelBody.caption}</p>
                  </div>
                )}

                {membersOfTopLevelBody.length > 0 && (
                  <Card className="my-4 shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap justify-center gap-4 items-start">
                        {membersOfTopLevelBody.map((memberLeaderData) => (
                          <div key={memberLeaderData.id} className="text-center w-60">
                            {memberLeaderData.specificTitleInBody && (
                              <h5 className="text-sm font-semibold mb-1 text-center min-h-10 flex items-center justify-center" title={memberLeaderData.specificTitleInBody}>
                                {memberLeaderData.specificTitleInBody}
                              </h5>
                            )}
                            <LeaderCard leader={memberLeaderData} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {firstLevelChildrenBodies.map(firstChildBody => {
                  const membersOfFirstChild = firstChildBody.members
                    .map(member => getLeaderData(member.id, member.title))
                    .filter((leader): leader is Leader => leader !== null);
                  
                  const grandChildrenBodies = getNestedBodies(firstChildBody.id);

                  return (
                    <Card key={firstChildBody.id} className="my-4 shadow-md">
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{firstChildBody.name}</CardTitle>
                        {firstChildBody.caption && <CardDescription className="text-base">{firstChildBody.caption}</CardDescription>}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {membersOfFirstChild.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-4 items-start">
                            {membersOfFirstChild.map((memberLeaderData) => (
                              <div key={memberLeaderData.id} className="text-center w-60">
                                {memberLeaderData.specificTitleInBody && (
                                  <h5 className="text-sm font-semibold mb-1 text-center min-h-10 flex items-center justify-center" title={memberLeaderData.specificTitleInBody}>
                                    {memberLeaderData.specificTitleInBody}
                                  </h5>
                                )}
                                <LeaderCard leader={memberLeaderData} />
                              </div>
                            ))}
                          </div>
                        )}
                        {grandChildrenBodies.map(grandChildBody => renderBody(grandChildBody))}

                        {membersOfFirstChild.length === 0 && grandChildrenBodies.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center">No members or sub-committees listed.</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                
                {membersOfTopLevelBody.length === 0 && firstLevelChildrenBodies.length === 0 && !currentTopLevelBody.caption && (
                   <p className="text-muted-foreground text-center">No members or sub-committees listed for {currentTopLevelBody.name}.</p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  )
} 