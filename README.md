# Amadeli Sweet & Salty

Sitio web oficial de Amadeli Sweet & Salty, pizzería y repostería en Loíza, Puerto Rico.

## Estructura

- `public/index.html`: contenido, SEO y datos estructurados.
- `public/styles.css`: diseño responsive.
- `public/script.js`: navegación, filtros, animaciones y galería.
- `public/assets/images`: imágenes optimizadas para web.
- `wrangler.jsonc`: configuración de Cloudflare Workers y sus recursos estáticos.

## Publicación automática en Cloudflare Workers

- Rama de producción: `main`
- Comando de compilación: `exit 0`
- Comando de despliegue: `npx wrangler deploy`
- Directorio raíz: `/`

Cloudflare Workers Builds está conectado a GitHub. Cada cambio enviado a `main` activa automáticamente una nueva compilación y publicación, sin pasos manuales.
