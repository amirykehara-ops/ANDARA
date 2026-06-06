import { signup } from "@/app/login/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Lado izquierdo - Formulario */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-3xl font-extrabold tracking-tight text-foreground">
              Crea tu cuenta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comienza a vender tus experiencias en minutos.
            </p>
          </div>
          <div className="mt-8">
            <form action={signup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="mt-1">
                  <Input id="name" name="name" type="text" required placeholder="Ej. Juan Pérez" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="mt-1">
                  <Input id="email" name="email" type="email" autoComplete="email" required placeholder="guia@ejemplo.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="mt-1">
                  <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full">
                  Crear Cuenta
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Inicia sesión
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
          src="https://images.unsplash.com/photo-1580502304784-8985b7eb7260?q=80&w=2000&auto=format&fit=crop"
          alt="Desierto de Huacachina"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Tu marca, tus reglas.</h2>
          <p className="text-lg text-white/90 drop-shadow-md">Digitaliza tu negocio turístico con Andara B2B.</p>
        </div>
      </div>
    </div>
  )
}