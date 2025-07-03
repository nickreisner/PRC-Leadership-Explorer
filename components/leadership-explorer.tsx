"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import BodyHierarchy from "./body-hierarchy"

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
}

export default function LeadershipExplorer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    hometown: "",
    educationLevel: "",
    educationType: "",
    generation: "",
  })
  const [activeFilters, setActiveFilters] = useState(false)
  const [bodies, setBodies] = useState<Body[]>([])
  const [officials, setOfficials] = useState<Official[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Fetching data from API...")
        const [bodiesResponse, officialsResponse] = await Promise.all([
          fetch("/api/bodies"),
          fetch("/api/officials")
        ])

        if (!bodiesResponse.ok || !officialsResponse.ok) {
          const bodiesError = await bodiesResponse.text()
          const officialsError = await officialsResponse.text()
          console.error("API Error:", {
            bodies: bodiesError,
            officials: officialsError
          })
          throw new Error("Failed to fetch data")
        }

        const [bodiesData, officialsData] = await Promise.all([
          bodiesResponse.json(),
          officialsResponse.json()
        ])

        console.log("Received data:", {
          bodies: bodiesData,
          officials: officialsData
        })

        setBodies(bodiesData)
        setOfficials(officialsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Ensure all counts are based on the original 'officials' array

  // Custom sort function to put "Unknown" at the end
  const sortWithOptions = (options: string[], optionType?: string) => {
    return options.sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      // For generations, sort numerically if they are numbers, otherwise localeCompare
      if (optionType === "generations" && !isNaN(Number(a)) && !isNaN(Number(b))) {
        return Number(a) - Number(b);
      }
      return a.localeCompare(b);
    });
  };

  const hometowns = sortWithOptions([
    ...new Set(officials.map(official => official.home_province || "Unknown"))
  ].filter(Boolean));

  const hometownCounts = hometowns.reduce((acc, hometown) => {
    if (hometown === "Unknown") {
      acc[hometown] = officials.filter(o => !o.home_province).length;
    } else {
      acc[hometown] = officials.filter(o => o.home_province === hometown).length
    }
    return acc
  }, {} as Record<string, number>)
  
  const educationLevels = sortWithOptions(
    [...new Set(
      officials.flatMap(official => {
        if (!official.degrees || official.degrees.length === 0) {
          return ["Unknown"];
        }
        return official.degrees.map(degree => {
          if (!degree.level || degree.level.trim() === "") {
            return "Unknown";
          }
          const level = degree.level.toLowerCase().trim();
          if (level.includes("bachelor")) return "Bachelor's";
          if (level.includes("master")) return "Master's";
          if (level.includes("doctor")) return "Doctor's";
          if (level.includes("stem")) return "STEM";
          if (level.includes("associate")) return "Associate's";
          const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);
          return capitalizedLevel === "" ? "Unknown" : capitalizedLevel;
        });
      })
    )].filter((level): level is string => level !== null && level.trim() !== "")
  );
  
  const educationLevelCounts = educationLevels.reduce((acc, level) => {
    if (level === "Unknown") {
      acc[level] = officials.filter(o => 
        !o.degrees || 
        o.degrees.length === 0 || 
        o.degrees.every(d => !d.level || d.level.trim() === "")
      ).length;
    } else {
      acc[level] = officials.filter(o => 
        o.degrees?.some(d => {
          if (!d.level || d.level.trim() === "") return false;
          const dLevel = d.level.toLowerCase().trim();
          if (level === "Bachelor's") return dLevel.includes("bachelor");
          if (level === "Master's") return dLevel.includes("master");
          if (level === "Doctor's") return dLevel.includes("doctor") || dLevel.includes("phd");
          if (level === "STEM") return dLevel.includes("stem");
          if (level === "Associate's") return dLevel.includes("associate");
          return (dLevel.charAt(0).toUpperCase() + dLevel.slice(1)) === level;
        })
      ).length;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const educationTypes = sortWithOptions(
    [...new Set(
      officials.flatMap(official => {
        if (!official.degrees || official.degrees.length === 0) {
          return ["Unknown"];
        }
        return official.degrees.map(degree => {
          if (!degree.type || degree.type.trim() === "") {
            return "Unknown";
          }
          const type = degree.type.toLowerCase().trim();
          if (type.includes("stem")) return "STEM";
          const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
          return capitalizedType === "" ? "Unknown" : capitalizedType;
        });
      })
    )].filter((type): type is string => type !== null && type.trim() !== "")
  );
  
  const educationTypeCounts = educationTypes.reduce((acc, type) => {
    if (type === "Unknown") {
      acc[type] = officials.filter(o => 
        !o.degrees || 
        o.degrees.length === 0 || 
        o.degrees.every(d => !d.type || d.type.trim() === "")
      ).length;
    } else {
      acc[type] = officials.filter(o => {
        return o.degrees?.some(d => {
          if (!d.type || d.type.trim() === "") return false;
          const dType = d.type.toLowerCase().trim();
          if (type === "STEM") return dType.includes("stem");
          return (dType.charAt(0).toUpperCase() + dType.slice(1)) === type;
        });
      }).length;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const generations = sortWithOptions([
    ...new Set(
      officials.map(official => official.generation?.toString() ? official.generation.toString() : "Unknown") 
    )
  ].filter(Boolean), "generations");

  const generationCounts = generations.reduce((acc, generation) => {
    if (generation === "Unknown") {
      acc[generation] = officials.filter(o => !o.generation).length;
    } else {
      acc[generation] = officials.filter(o => o.generation?.toString() === generation).length
    }
    return acc
  }, {} as Record<string, number>)

  // Check if any filters are active
  useEffect(() => {
    const hasActiveFilters = filters.hometown !== "" || 
      filters.educationLevel !== "" || 
      filters.educationType !== "" || 
      filters.generation !== ""
    setActiveFilters(hasActiveFilters)
  }, [filters])

  const resetFilters = () => {
    setFilters({
      hometown: "",
      educationLevel: "",
      educationType: "",
      generation: "",
    })
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chinese Leadership Explorer</h1>
        <ThemeToggle />
      </div>

      <div className="space-y-4">
        <div>
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Select value={filters.educationLevel} onValueChange={(value) => setFilters({ ...filters, educationLevel: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Education Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {educationLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level} ({educationLevelCounts[level] !== undefined ? educationLevelCounts[level] : 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.educationType} onValueChange={(value) => setFilters({ ...filters, educationType: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Education Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {educationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type} ({educationTypeCounts[type] !== undefined ? educationTypeCounts[type] : 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.generation} onValueChange={(value) => setFilters({ ...filters, generation: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Generation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Generations</SelectItem>
              {generations.map((generation) => (
                <SelectItem key={generation} value={generation}>
                  {generation} ({generationCounts[generation] !== undefined ? generationCounts[generation] : 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.hometown} onValueChange={(value) => setFilters({ ...filters, hometown: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Hometown" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hometowns</SelectItem>
              {hometowns.map((hometown) => (
                <SelectItem key={hometown} value={hometown}>
                  {hometown} ({hometownCounts[hometown] !== undefined ? hometownCounts[hometown] : 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end min-h-[32px] mt-2">
        <button
          onClick={resetFilters}
          className={`text-sm px-2 py-1 rounded transition-colors ${activeFilters ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground opacity-50 cursor-not-allowed'}`}
          disabled={!activeFilters}
        >
            Reset Filters
          </button>
        </div>

      <BodyHierarchy 
        bodies={bodies} 
        officials={officials}
        searchQuery={searchQuery}
        filters={filters}
      />
    </div>
  )
}
