"use client"

import { useState, useEffect, Suspense } from "react" // 1. Añadimos Suspense aquí
import { TourForm, type TourData } from "@/components/tours/TourForm"
import { LivePreview } from "@/components/tours/LivePreview"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { defaultTours } from "@/app/tours/page"

// 2. Cambiamos el nombre de la función a un componente interno
function TourEditorContent() {
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
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    const newErrors: Record<string, string> = {}
    
    if (!tourData.title.trim()) {
      newErrors.title = "El título del tour es obligatorio."
    }
    
    const priceNum = parseFloat(tourData.price)
    if (!tourData.price.trim()) {
      newErrors.price = "El precio es obligatorio."
    } else if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = "El precio debe ser un número positivo o 0."
    }
    
    const capNum = parseInt(tourData.capacity)
    if (!tourData.capacity.trim()) {
      newErrors.capacity = "La capacidad es obligatoria."
    } else if (isNaN(capNum) || capNum <= 0) {
      newErrors.capacity = "La capacidad debe ser un número mayor a 0."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    const saved = localStorage.getItem("andara_tours")
    let tours = saved ? JSON.parse(saved) : defaultTours

    const newTour = {
      id: editId || Date.now().toString(),
      title: tourData.title,
      price: parseFloat(tourData.price).toFixed(2),
      currency: tourData.currency,
      duration: tourData.duration || "N/A",
      capacity: parseInt(tourData.capacity) || 1,
      imageUrl: tourData.imageUrl || "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop",
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
        <div className="overflow-y-auto pr-4 pb-10">
          <div className="glass-panel p-6 rounded-2xl">
            <TourForm 
              data={tourData} 
              onChange={(data) => {
                setTourData(data)
                setErrors({})
              }} 
              onSubmit={handleSave}
              onCancel={() => router.push("/tours")}
              errors={errors}
            />
          </div>
        </div>

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

// 3. Exportamos por defecto envolviendo en el Suspense Boundary para arreglar el Build
export default function TourEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full text-muted-foreground p-6">
        Cargando editor de Andara...
      </div>
    }>
      <TourEditorContent />
    </Suspense>
  )
}
