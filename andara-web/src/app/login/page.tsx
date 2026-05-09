import { login } from "./actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado izquierdo - Formulario */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-3xl font-extrabold tracking-tight text-foreground">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Inicia sesión en tu cuenta de Andara para gestionar tus tours.
            </p>
          </div>

          <div className="mt-8">
            <form action={login} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="guia@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary bg-background/50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full">
                  Iniciar Sesión
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Regístrate ahora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Imagen decorativa */}
      <div className="hidden lg:block relative w-1/2">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2000&auto=format&fit=crop"
          alt="Paisaje de Machu Picchu"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Gestiona tus tours como un profesional.</h2>
          <p className="text-lg text-white/90 drop-shadow-md">Únete a la red de guías turísticos más grande del Perú.</p>
        </div>
      </div>
    </div>
  )
}
