# Documentación Técnica — Proyecto ANDARA

## 1. Conexión a Supabase

Primero creé un proyecto nuevo en supabase.com. Una vez creado, fui a Settings → API → Legacy anon, service_role API keys y copié dos credenciales: el Project URL y el anon public key.

Luego dentro de la carpeta andara-web creé el archivo .env.local con las siguientes variables:

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx...

Reemplacé el archivo src/utils/supabase/server.ts que originalmente era un stub sin conexión real, por el cliente real de Supabase usando @supabase/ssr. Lo mismo con src/app/login/actions.ts, que pasó de usar un sistema local de usuarios a usar supabase.auth.signInWithPassword y supabase.auth.signUp para el login y registro.

Para que la página de registro fuera accesible sin sesión, modifiqué el middleware en src/utils/supabase/middleware.ts agregando /register a las rutas permitidas sin autenticación. También desactivé la confirmación de email desde Authentication → Providers → Email → Confirm email.

## 2. Deploy en Vercel

Inicialicé un repositorio Git y lo subí a GitHub, luego instalé la CLI de Vercel:

sudo npm install -g vercel
vercel login

Configuré el Root Directory como andara-web en Project Settings → General y agregué las variables de entorno de Supabase en Project Settings → Environment Variables. Finalmente hice el deploy:

cd ~/ANDARA
vercel --prod

La app quedó disponible en https://andara-andara.vercel.app corriendo 24/7 sin necesidad de servidor local.
