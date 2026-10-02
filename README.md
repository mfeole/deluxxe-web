# Deluxxe Show — sitio web

Sitio estático (HTML + CSS + JS, sin dependencias) para **Deluxxe Show**, show musical premium para eventos.

## Estructura

```
index.html          Página única (landing)
css/styles.css      Estilos (paleta negro + dorado)
js/main.js          Menú, animaciones, galería, formulario
assets/video/       Video del hero (sin pista de audio)
assets/img/         Logo, fotos y póster del video
```

## Ver en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicación

El sitio se publica con **GitHub Pages** desde la rama `main` (carpeta raíz) en
**https://deluxxeshow.com**. El archivo `CNAME` define el dominio y `.nojekyll`
evita que GitHub procese los archivos con Jekyll. Cada cambio que llega a `main`
se publica automáticamente en uno o dos minutos.
