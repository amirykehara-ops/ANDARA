"use client"

import { useState, useEffect } from "react"
import { TourCard } from "@/components/tours/TourCard"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as const

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchTours = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setTours(data)
      }
      setIsLoaded(true)
    }
    fetchTours()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este tour?")) {
      const supabase = createClient()
      await supabase.from("tours").delete().eq("id", id)
      setTours(tours.filter(t => t.id !== id))
    }
  }

  const filteredTours = tours.filter(tour =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isLoaded) return null

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
              <TourCard
                id={tour.id}
                title={tour.title}
                price={tour.price}
                currency={tour.currency}
                duration={tour.duration}
                capacity={tour.capacity}
                imageUrl={tour.image_url}
                status={tour.status}
                onDelete={() => handleDelete(tour.id)}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron tours</h3>
            <p className="max-w-sm mb-6 text-sm">
              Aún no tienes tours creados. ¡Crea tu primera experiencia!
            </p>
            <Link href="/tours/editor">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Crear Tour
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}