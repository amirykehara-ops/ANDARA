"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export type TourData = {
  title: string
  description: string
  price: string
  currency: string
  duration: string
  capacity: string
  imageUrl: string
}

interface TourFormProps {
  data: TourData
  onChange: (data: TourData) => void
  onSubmit?: () => void
  onCancel?: () => void
  errors?: Record<string, string>
}

export function TourForm({ data, onChange, onSubmit, onCancel, errors }: TourFormProps) {
  const handleChange = (field: keyof TourData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className={errors?.title ? "text-destructive" : ""}>Título del Tour</Label>
        <Input 
          id="title" 
          placeholder="Ej: Tour Huacachina VIP" 
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className={errors?.title ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors?.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea 
          id="description" 
          placeholder="Describe la experiencia detalladamente..." 
          className="min-h-[150px]"
          value={data.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className={errors?.price ? "text-destructive" : ""}>Precio</Label>
          <Input 
            id="price" 
            type="number" 
            placeholder="0.00" 
            value={data.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className={errors?.price ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors?.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <select 
            id="currency"
            className="flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
            value={data.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="PEN">PEN (S/)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duración</Label>
          <Input 
            id="duration" 
            placeholder="Ej: 2 horas" 
            value={data.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity" className={errors?.capacity ? "text-destructive" : ""}>Capacidad Max.</Label>
          <Input 
            id="capacity" 
            type="number" 
            placeholder="15" 
            value={data.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
            className={errors?.capacity ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors?.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL de Imagen de Portada</Label>
        <Input 
          id="imageUrl" 
          placeholder="https://ejemplo.com/imagen.jpg" 
          value={data.imageUrl}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Pega un link de imagen por ahora (unsplash, etc). Más adelante agregaremos subida local.
        </p>
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel} type="button">Descartar</Button>
        <Button onClick={onSubmit} type="button">Guardar Tour</Button>
      </div>
    </div>
  )
}
