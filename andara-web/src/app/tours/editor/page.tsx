"use client"

import { useState, useEffect } from "react"
import { TourForm, type TourData } from "@/components/tours/TourForm"
import { LivePreview } from "@/components/tours/LivePreview"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { defaultTours } from "@/app/tours/page"

export default function TourEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [tourData, setTourData] = useState<TourData>({
    title: "",
    description: "",
    price: "",
    currency: "USD",
    duration: "",
    capacity: "",
    imageUrl: ""
  })

  useEffect(() => {
    if (editId) {
      const saved = localStorage.getItem("andara_tours")
      const tours = saved ? JSON.parse(saved) : defaultTours
      const tourToEdit = tours.find((t: any) => t.id === editId)
      if (tourToEdit) {
        setTourData({
          title: tourToEdit.title,
          description: tourToEdit.description || "",
          price: tourToEdit.price,
          currency: tourToEdit.currency,
          duration: tourToEdit.duration,
          capacity: tourToEdit.capacity.toString(),
          imageUrl: tourToEdit.imageUrl
        })
      }
    }
  }, [editId])

  const handleSave = () => {
    const saved = localStorage.getItem("andara_tours")
    let tours = saved ? JSON.parse(saved) : defaultTours

    const newTour = {
      id: editId || Date.now().toString(),
      title: tourData.title || "Tour sin título",
      price: tourData.price || "0.00",
      currency: tourData.currency,
      duration: tourData.duration || "N/A",
      capacity: parseInt(tourData.capacity) || 1,
      imageUrl: tourData.imageUrl,
      description: tourData.description,
      status: "active" as const
    }

    if (editId) {
      tours = tours.map((t: any) => t.id === editId ? newTour : t)
    } else {
      tours = [newTour, ...tours]
    }

    localStorage.setItem("andara_tours", JSON.stringify(tours))
    router.push("/tours")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center mb-6">
        <Link href="/tours" className="text-muted-foreground hover:text-foreground mr-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {editId ? "Editar Tour" : "Crear Nuevo Tour"}
          </h1>
          <p className="text-sm text-muted-foreground">Configura los detalles y previsualiza en tiempo real.</p>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-8 min-h-0">
        {/* Lado Izquierdo: Formulario */}
        <div className="overflow-y-auto pr-4 pb-10">
          <div className="glass-panel p-6 rounded-2xl">
            <TourForm 
              data={tourData} 
              onChange={setTourData} 
              onSubmit={handleSave}
              onCancel={() => router.push("/tours")}
            />
          </div>
        </div>

        {/* Lado Derecho: Live Preview */}
        <div className="hidden lg:flex justify-center items-start sticky top-0 overflow-y-auto pb-10">
          <div className="w-full max-w-md pt-4">
            <div className="text-center mb-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Preview</span>
            </div>
            <LivePreview data={tourData} />
          </div>
        </div>
      </div>
    </div>
  )
}
