# Guía Paso a Paso: Despliegue en Vercel y Configuración de Webhooks de Meta

Esta guía te guiará detalladamente para subir ANDARA a internet usando **Vercel** y configurar la integración oficial de **Facebook Messenger/Instagram** en el portal de desarrolladores de Meta.

---

## PARTE 1: Subir el proyecto a Vercel

### Paso 1.1: Crear repositorio en GitHub
1. Si no lo has hecho, crea una cuenta en [GitHub](https://github.com/).
2. Crea un nuevo repositorio privado o público llamado `andara-crm`.
3. Sube tu proyecto ejecutando estos comandos en tu terminal local (en la raíz de tu proyecto `ANDARA`):
   ```bash
   git init
   git add .
   git commit -m "feat: integracion saas y supabase ready"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/andara-crm.git
   git push -u origin main
   ```

### Paso 1.2: Importar el proyecto en Vercel
1. Ve a [Vercel.com](https://vercel.com/) e inicia sesión con tu cuenta de GitHub (es gratis para proyectos personales/estudiantiles).
2. Haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio `andara-crm` y haz clic en **Import**.
4. **Configuración del proyecto (¡MUY IMPORTANTE!)**:
   - En **Root Directory**, edítalo y selecciona la carpeta **`andara-web`**.
   - Expande la sección **Environment Variables** (Variables de Entorno) y agrega las variables de Supabase:
     * `NEXT_PUBLIC_SUPABASE_URL` = `https://dhmrtidehbmnyabwveds.supabase.co`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY`
5. Haz clic en **Deploy**. ¡En menos de 2 minutos tu web estará activa en una URL tipo `https://andara-crm.vercel.app`!

---

## PARTE 2: Configuración en Meta Developers

Para conectar tus páginas, necesitamos configurar una App comercial en Meta:

### Paso 2.1: Crear la App en Meta
1. Ve a [developers.facebook.com](https://developers.facebook.com/) e inicia sesión con tu cuenta personal de Facebook.
2. Ve a **Mis Apps** -> **Crear App**.
3. Selecciona el caso de uso **"Otro"** (u "Negocios") y haz clic en Siguiente.
4. Selecciona el tipo de App **"Negocios"** (Business) o **"Consumidor"**.
5. Coloca el nombre de tu aplicación (ej. `Andara CRM Pro`) y haz clic en **Crear App**.

### Paso 2.2: Agregar el Producto "Messenger"
1. En el menú izquierdo, haz clic en **Agregar producto** (o en la tarjeta de productos del inicio).
2. Busca **Messenger** y haz clic en **Configurar**.

### Paso 2.3: Configurar el Webhook
1. Dentro del menú de Messenger, ve a **Webhooks** y haz clic en **Configurar Webhook**.
2. Rellena los campos:
   - **URL de retorno (Callback URL)**: `https://TU-URL-DE-VERCEL.vercel.app/api/webhook` (reemplaza con tu URL real de Vercel).
   - **Token de verificación (Verify Token)**: `AndaraMeta2026` (debe ser exactamente este token para que coincida con el backend).
3. Haz clic en **Verificar y Guardar**. Meta validará tu endpoint llamando al `GET` de tu API en Vercel.
4. Una vez guardado, busca el botón **Suscripciones de Campos** y suscríbete al menos a:
   - `messages`
   - `messaging_postbacks`
   - `instagram_messages` (si deseas soportar Instagram también)

### Paso 2.4: Agregar el Producto "Inicio de Sesión de Facebook" (Facebook Login)
Para que los guías puedan iniciar sesión y autorizar sus páginas desde tu web:
1. En el menú izquierdo, haz clic en **Agregar producto** y añade **Inicio de sesión de Facebook** (Facebook Login).
2. En la configuración de Facebook Login:
   - Ve a **Configuración rápida** -> selecciona **Web**.
   - En **URI de redireccionamiento de OAuth válidos**, ingresa:
     `https://TU-URL-DE-VERCEL.vercel.app/settings` y haz clic en guardar.
3. Copia el **App ID** (ID de la aplicación) que aparece en la barra superior de tu pantalla.
4. Abre el archivo `src/app/settings/page.tsx` en tu código y reemplaza el ID del app en la inicialización del SDK:
   ```typescript
   // En src/app/settings/page.tsx:L148
   appId: 'TU_APP_ID_AQUI',
   ```

---

## PARTE 3: Cómo registrar a tu profesor como Tester (Para pruebas reales)

Como tu app está en **Modo Desarrollo**, Facebook no dejará que usuarios externos conecten sus páginas a menos que los registres como colaboradores:

1. En el panel izquierdo de Meta Developers, ve a **Roles** -> **Roles**.
2. Desplázate hacia abajo hasta la sección **Evaluadores (Testers)** y haz clic en **Agregar evaluadores**.
3. Ingresa el nombre de usuario de Facebook de tu profesor, su correo electrónico asociado a FB, o su ID de perfil y haz clic en **Enviar**.
4. **¡IMPORTANTE!**: Tu profesor recibirá una notificación en Facebook (o en `developers.facebook.com/requests`) aceptando la invitación como Evaluador.
5. Una vez que acepte, tu profesor podrá ingresar a `https://TU-URL-DE-VERCEL.vercel.app`, ir a Configuración, iniciar sesión con su Facebook, conectar sus páginas de prueba reales, ¡y enviar mensajes reales que se reflejarán instantáneamente en tu CRM!
