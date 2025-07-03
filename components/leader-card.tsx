"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, GraduationCap, Users, Briefcase, Calendar } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Leader } from "@/lib/types"

interface LeaderCardProps {
  leader: Leader
  highlight?: boolean
}

export default function LeaderCard({ leader, highlight = false }: LeaderCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Card
        className={`transition-all duration-500 ease-in-out ${
          !leader.visible ? "opacity-30 pointer-events-none" : "opacity-100"
        } ${highlight && leader.visible ? "ring-2 ring-primary" : "ring-0 ring-transparent"}
        ${leader.visible ? "cursor-pointer hover:shadow-md" : ""}`}
        onClick={() => leader.visible && setIsOpen(true)}
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex justify-between items-center text-base">
            <div>
              <span>{leader.name}</span>
              {leader.chineseName && (
              <span className="ml-2 text-muted-foreground text-xs">{leader.chineseName}</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
            <Image
              src={leader.image || "/placeholder.svg"}
              alt={leader.name}
              width={100}
              height={133}
              className="rounded-md object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {leader.visible && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {leader.name}
                {leader.chineseName && (
                <span className="ml-2 text-muted-foreground text-lg">{leader.chineseName}</span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="grid md:grid-cols-[300px_1fr] gap-6 mt-4">
              <div className="bg-muted rounded-md flex items-center justify-center">
                <Image
                  src={leader.image || "/placeholder.svg"}
                  alt={leader.name}
                  width={300}
                  height={400}
                  className="rounded-md object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="grid gap-6">
                  {/* Position */}
                  {leader.title && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg font-semibold">Position</span>
                    </div>
                    <div className="ml-7 text-lg whitespace-pre-line">
                      {leader.title}
                    </div>
                  </div>
                  )}

                  {/* Education */}
                  {leader.education && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg font-semibold">Education</span>
                    </div>
                    <div className="ml-7 text-lg whitespace-pre-line">
                      {leader.education}
                    </div>
                  </div>
                  )}

                  {/* Age */}
                  {leader.age && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="text-lg font-semibold">Age</span>
                    </div>
                    <div className="ml-7 text-lg">
                        {leader.age}
                      </div>
                    </div>
                  )}

                  {/* Generation */}
                  {leader.generation && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-lg font-semibold">Generation</span>
                    </div>
                    <div className="ml-7 text-lg">
                      {leader.generation}
                    </div>
                  </div>
                  )}

                  {/* Hometown */}
                  {leader.hometown && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="text-lg font-semibold">Hometown</span>
                      </div>
                      <div className="ml-7 text-lg">
                        {leader.hometown}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
