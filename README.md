# ¿Qué comemos? 🍽️

Organizador de comidas casero, en español y pensado para el **teléfono** (también
funciona en computadora). Planea la semana, lleva tu recetario, arma la lista de
compras automática y revisa tus hábitos.

Hecho con **React + Vite**, base de datos en **Supabase** (Postgres) y hosting gratis
en **Vercel**. Es una **PWA**: se puede instalar en la pantalla de inicio del celular.

- **Hogar compartido sin login:** una sola base de datos que todos comparten.
- **Funciona sin Supabase** (modo local con `localStorage`) para probar de inmediato.

---

## 🚀 Cómo correrlo en tu computadora (desarrollo)

Necesitas [Node.js](https://nodejs.org) 18+ instalado.

```bash
npm install      # instala dependencias (solo la primera vez)
npm run dev      # abre http://localhost:5173
```

Sin credenciales de Supabase, la app arranca en **modo local**: los datos se guardan
solo en ese navegador. Perfecto para probar. Para compartir datos entre el teléfono y
la computadora, conecta Supabase (abajo).

---

## 🗄️ Paso 1 — Crear la base de datos en Supabase (gratis)

1. Entra a **https://supabase.com** y crea una cuenta (gratis, sin tarjeta).
2. **New project** → ponle un nombre (ej. `que-comemos`), elige una contraseña para la
   base de datos y la región más cercana. Espera ~2 min a que se cree.
3. En el menú izquierdo abre **SQL Editor → New query**.
4. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este proyecto, copia
   **todo** su contenido, pégalo y pulsa **Run**. Esto crea las tablas, los permisos y
   21 comidas de ejemplo.
5. Ve a **Project Settings → API** y copia dos valores:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **anon public** key (una cadena larga que empieza con `eyJ...`)

> La `anon key` es pública por diseño (va en el navegador). El acceso es compartido sin
> login: cualquiera con el link de tu app puede ver y editar. Es lo esperado para uso
> familiar. Si después quieres protegerlo, se puede agregar un PIN o cuentas.

### Conectar Supabase en local
Crea un archivo `.env.local` (copia de `.env.example`) y pega tus valores:

```
VITE_SUPABASE_URL=https://abcd1234.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Reinicia `npm run dev`. El banner naranja de "modo local" desaparece y los datos ya
viven en Supabase.

---

## ☁️ Paso 2 — Publicarlo gratis en Vercel

1. Sube este proyecto a **GitHub** (un repositorio nuevo). Por ejemplo:
   ```bash
   git add -A
   git commit -m "Mi app de comidas"
   git push
   ```
2. Entra a **https://vercel.com**, crea cuenta con tu GitHub (plan **Hobby**, gratis).
3. **Add New → Project** → importa tu repositorio. Vercel detecta Vite automáticamente
   (Build: `npm run build`, Output: `dist`). No cambies nada.
4. Antes de desplegar, abre **Environment Variables** y agrega las **mismas dos**
   variables del `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy**. En ~1 minuto tendrás una URL pública con HTTPS, tipo
   `https://que-comemos.vercel.app`. ¡Ya está arriba y gratis!

Cada vez que hagas `git push`, Vercel vuelve a desplegar solo.

---

## 📱 Instalar en el teléfono (PWA)

Abre la URL de Vercel en el celular:

- **iPhone (Safari):** botón Compartir → **Agregar a inicio**.
- **Android (Chrome):** menú ⋮ → **Instalar app / Agregar a la pantalla principal**.

Queda con icono propio y se abre en pantalla completa, como una app normal.

---

## 💵 ¿Es realmente gratis?

Sí. **Vercel Hobby** y **Supabase Free** son gratuitos de forma indefinida para este
uso. Los límites (500 MB de base de datos, ancho de banda) son inalcanzables para una
app de comidas familiar.

> Nota: Supabase pausa proyectos del plan gratis tras ~1 semana **sin ningún uso**. Con
> uso normal no pasa; si llegara a pausarse, se reactiva con un clic desde el panel.

---

## 🧱 Estructura del proyecto

```
src/
  App.jsx              Pestañas + orquestación de las hojas (modales)
  main.jsx             Punto de entrada
  styles.css           Variables de color, tipografías y layout responsive
  supabaseClient.js    Cliente de Supabase (o null en modo local)
  lib/
    constants.js       Categorías, colores y utilidades de fecha (fecha REAL)
    backend.js         Acceso a datos: Supabase o localStorage (misma interfaz)
    useStore.js        Estado global + acciones (hook principal)
  components/           Icono, primitivas (botones, chips, hoja), barra, fila, toast
  screens/             Hoy, Semana, Comidas, Lista, Resumen
  sheets/              Hojas: elegir comida, nueva comida, día, detalle
supabase/schema.sql    SQL para crear la base de datos
public/                Iconos de la PWA
```

## 🛠️ Comandos

| Comando           | Qué hace                                  |
|-------------------|-------------------------------------------|
| `npm run dev`     | Servidor de desarrollo (localhost:5173)   |
| `npm run build`   | Compila para producción en `dist/`        |
| `npm run preview` | Sirve el `dist/` ya compilado para probar |
