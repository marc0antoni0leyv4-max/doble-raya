# Cómo publicar Doble raya

El sitio es estático: solo HTML, CSS y JavaScript. No necesita servidor ni base de datos.
Cualquier hosting con **HTTPS** sirve (el micrófono del dictado solo funciona con HTTPS).

## Opción 1: Netlify Drop (la más rápida, sin instalar nada)

1. Entra en <https://app.netlify.com/drop> e inicia sesión (es gratis).
2. Arrastra la carpeta `doble-raya` completa a la página.
3. En unos segundos tendrás una dirección como `https://nombre-al-azar.netlify.app`.
4. En *Site configuration → Change site name* puedes cambiarla, por ejemplo `doble-raya.netlify.app`.

El archivo `_headers` ya permite el micrófono y añade cabeceras de seguridad.

## Opción 2: GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo `doble-raya`.
2. Desde esta carpeta (ya es un repositorio git con los archivos preparados):

   ```bash
   git config user.name "Tu nombre"
   git config user.email "tu-correo@ejemplo.com"
   git commit -m "Primera versión de Doble raya"
   git remote add origin https://github.com/TU-USUARIO/doble-raya.git
   git push -u origin main
   ```

3. En GitHub: *Settings → Pages → Source: Deploy from a branch → main / (root)*.
4. La dirección será `https://TU-USUARIO.github.io/doble-raya/`.

## Opción 3: Cloudflare Pages

*Workers & Pages → Create → Pages → Upload assets* y sube la carpeta. También lee `_headers`.

## Después de publicar, comprueba

- Abre la dirección en el celular y en la computadora.
- Crea una cuenta, cierra sesión y vuelve a entrar.
- Abre «Juguemos a leer» y prueba el dictado: el navegador debe pedir permiso para el micrófono.

## Para tener en cuenta

- **Las cuentas viven en cada navegador.** Si una familia entra desde otro equipo, tendrá que crear la cuenta de nuevo. Para cuentas compartidas entre equipos hace falta un servicio de autenticación (por ejemplo Supabase o Firebase).
- **Para actualizar un juego**, reemplaza el archivo en `juegos/` con el mismo nombre y vuelve a publicar.
