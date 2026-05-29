"use client"

import { TourData } from "./TourForm"
import { Clock, Users, MapPin, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

interface LivePreviewProps {
  data: TourData
}

export function LivePreview({ data }: LivePreviewProps) {
  const isUSD = data.currency === "USD"

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-[8px] border-slate-200 dark:border-slate-800 overflow-hidden relative aspect-[9/19]">
      {/* Notch simulation */}
      <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-b-xl"></div>
      </div>

      <div className="h-full w-full overflow-y-auto no-scrollbar pb-20 relative">
        <motion.div 
          className="w-full h-64 bg-slate-100 relative"
          layoutId="preview-image"
        >
          {data.imageUrl ? (
            <img 
              src={data.imageUrl} 
              alt="Tour Preview" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-800">
              Sin imagen
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
        </motion.div>

        <div className="px-6 -mt-8 relative z-10">
          <BadgePreview>Recomendado</BadgePreview>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-3 leading-tight">
            {data.title || "Título del Tour"}
          </h1>
          
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-4 space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {data.duration || "--"}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Máx {data.capacity || "--"}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Acerca de este tour</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {data.description || "Agrega una descripción para verla aquí..."}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Incluye</h3>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 mr-2 text-primary" /> Guía certificado
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 mr-2 text-primary" /> Traslado ida y vuelta
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Booking Bar) */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500 font-medium">Precio por persona</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {isUSD ? "$" : "S/"}{data.price || "0.00"}
          </p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-colors">
          Reservar
        </button>
      </div>
    </div>
  )
}

function BadgePreview({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {children}
    </span>
  )
}
