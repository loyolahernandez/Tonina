# CLAUDE.md — getit

App web **local** y personal (no comercial) para bajar música desde YouTube / YouTube Music, usando links de Spotify solo como fuente de metadata, y dejar archivos **AIFF etiquetados** listos para importar en **rekordbox** (controlador Pioneer DDJ).

- Spec del MVP: @docs/prd/getit-descarga-musica-dj.md — es la fuente de verdad del alcance. Si algo no está ahí, preguntar antes de construirlo.
- Idioma: UI, mensajes de error y docs en español. Código (nombres de variables, funciones) en inglés.

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Lenguaje | Python 3.12+, gestionado con `uv` | yt-dlp es Python; un solo runtime |
| Servidor | FastAPI + Uvicorn, bind **solo** a `127.0.0.1` | API simple + tareas en segundo plano |
| UI | Jinja2 + htmx (sin build de frontend) | App personal: cero toolchain JS |
| Descarga | `yt-dlp` usado como librería | Búsqueda + mejor audio disponible |
| Conversión | `ffmpeg` (binario del sistema, `brew install ffmpeg`) | Audio → AIFF PCM 16-bit / 44.1 kHz |
| Tags | `mutagen` (ID3 dentro de AIFF) | rekordbox lee ID3 en AIFF |
| Spotify | `spotipy`: login del usuario (playlists propias completas) → client credentials → página pública (máx. 100) | Ver @docs/prd/spotify-login-playlists.md. Pasar siempre client_id/secret explícitos: spotipy por defecto lee `SPOTIPY_*`, no `SPOTIFY_*` |
| Persistencia | SQLite (`~/.getit/getit.db`) | Biblioteca/candados y lotes |
| Tests | `pytest` | |

## Estructura esperada

```
getit/
├── CLAUDE.md
├── pyproject.toml
├── .env.example          # SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, GETIT_OUTPUT_DIR
├── docs/prd/
├── src/getit/
│   ├── main.py           # app FastAPI + rutas (create_app / run)
│   ├── jobs.py           # análisis, revisión y cola de descargas (estados)
│   ├── config.py         # ajustes editables (SQLite + defaults de .env)
│   ├── spotify_auth.py   # login OAuth con la cuenta de Spotify (solo lectura, token en la DB local)
│   ├── sources/          # youtube.py, spotify.py — un módulo por fuente (NAME, matches, resolve)
│   ├── matching.py       # puntaje de candidatos YouTube (PRD §4)
│   ├── pipeline.py       # descargar → convertir → taguear → mover
│   ├── library.py        # candados anti-duplicado (PRD §5)
│   ├── naming.py         # normalización de nombres y claves
│   ├── db.py
│   └── templates/
└── tests/
```

## Comandos

```bash
uv sync                                   # instalar dependencias
uv run getit                              # levantar en http://127.0.0.1:8765
uv run pytest                             # tests
uv lock --upgrade-package yt-dlp && uv sync   # actualizar yt-dlp cuando YouTube rompa algo
```

## Reglas de implementación

1. **Nunca sobrescribir** un archivo en la carpeta de salida. Trabajar en un directorio temporal y mover al final (operación atómica).
2. **Candados anti-duplicado** antes de descargar: por `youtube_id` y por clave normalizada artista+título. La lógica vive solo en `library.py`.
3. **Un tema que falla no detiene el lote.** Guardar el motivo en lenguaje humano ("video no disponible en tu país", "ffmpeg no instalado") y permitir reintentar.
4. **Las fuentes son plugins**: cada fuente expone la misma interfaz (resolver link → lista de temas con metadata). Agregar SoundCloud/Bandcamp después no debe tocar el pipeline.
5. **No inventar calidad**: no subir bitrate ni hacer upsampling engañoso; mostrar en la UI el bitrate real de la fuente.
6. **Nombres de archivo** seguros para macOS y rekordbox: sin `/ : * ? " < > |`, sin espacios dobles, largo razonable; patrón por defecto `{artist} - {title}.aiff`.
7. **Limpiar títulos de YouTube** antes de taguear: quitar "(Official Video)", "[HD]", "(Audio)", "Lyrics", etc. Lista de patrones en `naming.py` con tests.
8. **Secretos** solo en `.env` (gitignored). Nunca commitear credenciales de Spotify.
9. **Localhost solamente.** Nada de `0.0.0.0`, nada de deploy.
10. Lo que el PRD marca como NO-objetivo (BPM/key, escribir en la DB de rekordbox, descargar desde Spotify) no se implementa aunque parezca fácil.

## Tests mínimos

- `naming.py`: limpieza de títulos y nombres de archivo (casos reales con acentos, feat., remix).
- `matching.py`: puntaje — prefiere canal "- Topic", penaliza "sped up"/"live"/"slowed" salvo que el original los tenga, respeta tolerancia de duración.
- `library.py`: ambos candados.
- Pipeline con descarga mockeada (sin red en tests).

## Prerrequisitos en la Mac

- `brew install ffmpeg uv`
- `cp .env.example .env` (las credenciales de Spotify son opcionales: sin ellas se lee la página pública del link)
- App de Spotify en developer.spotify.com (solo para links de Spotify) → copiar ID y secret a `.env`.
