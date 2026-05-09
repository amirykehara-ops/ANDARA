"use client"

import { useState, useEffect } from "react"
import { TourCard } from "@/components/tours/TourCard"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"

// Mock data base fallback
export const defaultTours = [
  {
    id: "1",
    title: "Tour VIP Huacachina y Buggies",
    price: "45.00",
    currency: "USD",
    duration: "2 horas",
    capacity: 12,
    imageUrl: "https://images.unsplash.com/photo-1547466792-5633a6dd90f1?w=800&auto=format&fit=crop",
    status: "active" as const
  },
  {
    id: "2",
    title: "Sobrevuelo Líneas de Nazca Clásico",
    price: "120.00",
    currency: "USD",
    duration: "35 min",
    capacity: 6,
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&auto=format&fit=crop",
    status: "active" as const
  },
  {
    id: "3",
    title: "Islas Ballestas y Candelabro",
    price: "25.00",
    currency: "USD",
    duration: "Half day",
    capacity: 20,
    imageUrl: "https://images.unsplash.com/photo-1510006851064-e6056cd0e3a8?w=800&auto=format&fit=crop",
    status: "draft" as const
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function ToursPage() {
  const [tours, setTours] = useState<typeof defaultTours>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Cargar de localStorage
    const saved = localStorage.getItem("andara_tours")
    if (saved) {
      setTours(JSON.parse(saved))
    } else {
      setTours(defaultTours)
      localStorage.setItem("andara_tours", JSON.stringify(defaultTours))
    }
    setIsLoaded(true)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este tour?")) {
      const newTours = tours.filter(t => t.id !== id)
      setTours(newTours)
      localStorage.setItem("andara_tours", JSON.stringify(newTours))
    }
  }

  const filteredTours = tours.filter(tour => 
    tour.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isLoaded) return null // Evitar errores de hidratación

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis Tours</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu inventario, precios y detalles de tus experiencias.
          </p>
        </div>
        <Link href="/tours/editor">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" /> Crear Nuevo Tour
          </Button>
        </Link>
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar tour por nombre..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {filteredTours.length > 0 ? (
          filteredTours.map(tour => (
            <motion.div key={tour.id} variants={itemVariants}>
              <TourCard {...tour} onDelete={() => handleDelete(tour.id)} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/50">
            No se encontraron tours.
          </div>
        )}
      </motion.div>
    </div>
  )
}
