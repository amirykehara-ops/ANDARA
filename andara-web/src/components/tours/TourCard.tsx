"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TourCardProps {
  id: string
  title: string
  price: string
  currency: string
  duration: string
  capacity: number
  imageUrl: string
  status: "active" | "draft"
  onDelete?: () => void
}

export function TourCard({ id, title, price, currency, duration, capacity, imageUrl, status, onDelete }: TourCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden group">
      <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop"} 
          alt={title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <Badge variant={status === "active" ? "success" : "secondary"} className="shadow-lg backdrop-blur-md bg-white/90 dark:bg-black/80">
            {status === "active" ? "Activo" : "Borrador"}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-2">{title}</h3>
          <p className="font-extrabold text-brand-primary whitespace-nowrap ml-2">
            {currency === "USD" ? "$" : "S/"}{price}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 opacity-70" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 opacity-70" />
            <span>Máx {capacity}</span>
          </div>
        </div>
        <div className="flex space-x-2 mt-auto">
          <Link href={`/tours/editor?id=${id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
          </Link>
          {onDelete && (
            <Button variant="destructive" size="icon" onClick={onDelete} className="shrink-0" title="Eliminar Tour">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
