# PRD — getit: descarga de música lista para rekordbox

## 0 · ENCABEZADO

```
PRD — getit: pegar un link, obtener un AIFF etiquetado listo para rekordbox
Estado: Borrador · Dueño: Ignacio Loyola · Creado: 06-10-2026
Alcance: app web local (corre solo en mi Mac) que descarga audio desde
         YouTube / YouTube Music y usa links de Spotify solo como fuente
         de metadata para encontrar el tema en YouTube.
         — NO toca rekordbox directamente (no escribe su base de datos),
           NO descarga desde Spotify, NO se expone a internet,
           NO tiene usuarios ni uso comercial.
Tamaño: una funcionalidad (MVP). Fases posteriores = PRDs anidados aparte.
```

## 1 · RESUMEN

```
Hoy: armar un set implica buscar cada tema a mano, bajarlo con
     herramientas sueltas, convertirlo, renombrarlo y arreglar tags uno a uno.
Después: pego un link (tema, playlist de YouTube o playlist de Spotify),
     y getit deja en una carpeta AIFFs con artista, título, carátula y
     nombre de archivo consistentes, listos para arrastrar a rekordbox.
```

## 2 · LA HISTORIA

```
ANTES    Es jueves en la noche y tengo una playlist de Spotify con 25
         temas que quiero practicar el sábado en el DDJ. Para cada uno:
         lo busco en YouTube, elijo entre el video oficial, un lyric video
         y un "sped up", lo bajo con una web llena de publicidad, sale un
         .webm o un MP3 con nombre "Artista - Tema (Official Video) [HD]",
         sin carátula, y rekordbox lo muestra con artista vacío. Me toma
         más de una hora y la mitad de la colección queda desordenada.
         Algunos temas los bajo dos veces sin darme cuenta.

DESPUÉS  Pego el link de la playlist de Spotify en getit. La app me
         muestra los 25 temas, con el candidato de YouTube que eligió
         para cada uno y su duración comparada con la original. Corrijo
         dos que eligió mal, aprieto "Descargar" y me voy a hacer otra
         cosa. Al volver tengo 25 AIFF en ~/Music/getit/, con nombre
         "Artista - Título (Mix).aiff", tags y carátula. Los 3 que ya
         tenía fueron saltados. Arrastro la carpeta a rekordbox, analiza
         BPM y key, y estoy mezclando.
```

## 3 · OBJETIVOS / NO-OBJETIVOS

```
O1   un link de tema o playlist de YouTube/YT Music → AIFF(s) en la
     carpeta de salida, sin pasos manuales intermedios
O2   un link de playlist o tema de Spotify → se lee su metadata y se
     propone un candidato de YouTube por tema, que puedo revisar y
     cambiar ANTES de descargar
O3   cada AIFF sale con: artista, título, álbum (si existe), año (si
     existe), carátula embebida y nombre de archivo normalizado,
     legible correctamente en rekordbox
O4   nunca descarga dos veces el mismo tema (ver candados en §5)
O5   la cola es visible: veo por tema si está pendiente, descargando,
     listo, saltado o con error — y el motivo del error
O6   si una descarga falla, las demás siguen; puedo reintentar las fallidas
O7   la app corre 100% local, levanta con un solo comando y solo
     escucha en localhost

NO1  no analiza BPM, key ni beatgrid — eso lo hace rekordbox
NO2  no escribe en la base de datos ni en el XML de rekordbox (fase 2 posible)
NO3  no descarga audio desde Spotify ni intenta saltar su DRM
NO4  no "mejora" la calidad: AIFF es el contenedor, la calidad real es la
     de la fuente (YouTube ≈ 128–160 kbps con pérdida); la app lo dice
     explícitamente en la UI
NO5  sin cuentas, sin login, sin deploy en la nube, sin multiusuario
NO6  no SoundCloud ni Bandcamp en este PRD (quedan como fuentes futuras)
```

## 4 · CÓMO FUNCIONA HOY → CÓMO VA A FUNCIONAR

```
HOY                                  DESPUÉS
buscar tema a mano en YouTube        pegar link en getit (localhost)
 └─ web de descarga con ads            └─ getit detecta tipo de link:
 └─ archivo .webm / mp3 mal nombrado        · YouTube tema / playlist
 └─ convertir a mano (o no)                 · Spotify tema / playlist
 └─ renombrar y taguear a mano          └─ si es Spotify: lee metadata y
 └─ arrastrar a rekordbox                    busca candidato en YouTube
 └─ descubrir duplicados después        └─ pantalla de REVISIÓN:
                                             tema · candidato · duración ·
                                             estado (nuevo / ya lo tengo)
                                        └─ "Descargar" → cola
                                        └─ por tema: bajar mejor audio →
                                             convertir a AIFF → tags +
                                             carátula → mover a carpeta
                                        └─ resumen: N listos, M saltados,
                                             K con error (reintentar)
                                        └─ arrastrar carpeta a rekordbox
```

### Cómo elige el candidato de YouTube (para links de Spotify)

```
para cada tema de Spotify (artista, título, duración):
  buscar en YouTube "artista - título"
  puntuar los primeros resultados:
    + canal "Artista - Topic" o canal oficial del artista
    + duración dentro de ±5 s de la original
    − palabras en título que no estaban en el original:
        "live", "sped up", "slowed", "remix", "cover", "karaoke",
        "8d", "nightcore", "reverb"   (salvo que el original las tenga)
  proponer el de mayor puntaje; mostrar alternativas para cambiarlo
  si ninguno supera un umbral → marcar "revisar" en vez de elegir a ciegas
```

## 5 · LOS DATOS

```
disparador    el usuario pega un link y aprieta "Analizar"
              (descargar solo ocurre al apretar "Descargar" tras revisar)

Lote          origen: 'youtube' | 'spotify'
              link_original
              creado_en
              estado: 'analizando' | 'en_revision' | 'descargando' | 'terminado'

Tema          lote
              artista, título, álbum?, año?, duración_original?
              url_carátula?
              id_spotify?                     ← solo si vino de Spotify
              id_youtube_elegido              ← lo que se va a descargar
              candidatos: lista de {id_youtube, título, canal, duración, puntaje}
              estado: 'pendiente' | 'revisar' | 'descargando' | 'listo'
                      | 'saltado_duplicado' | 'error'
              motivo_error?
              ruta_archivo?

Biblioteca    registro persistente (local) de todo lo ya descargado:
              id_youtube           ← CANDADO 1: un video = un archivo
              clave_normalizada    ← CANDADO 2: artista+título normalizados
                                     (minúsculas, sin acentos, sin
                                     "official video", "(audio)", etc.)
              ruta_archivo, descargado_en

Ajustes       carpeta_salida: ruta (default ~/Music/getit)
              formato_salida: 'aiff'          ← fijo en el MVP
              patrón_nombre: "{artista} - {título}"
              descargas_simultáneas: número (default 3)
              modo_prueba: sí | no            ← INTERRUPTOR: analiza y
                                                 muestra todo, no descarga
```

## 6 · PSEUDO-CÓDIGO — EL ACUERDO

```
CUANDO pego un link y aprieto "Analizar"

  ¿el link es de YouTube, YT Music o Spotify?   → si no, digo cuál
                                                   no soporto y paro
  ¿es Spotify y no puedo leer su metadata?       → si no, explico por
                                                   qué (credenciales,
                                                   playlist privada) y paro

  ENTONCES armo el Lote con un Tema por canción; si vino de Spotify,
  busco y puntúo candidatos de YouTube; marco cada Tema como
  'saltado_duplicado' si ya está en la Biblioteca (candado 1 o 2);
  y muestro la pantalla de revisión.

CUANDO aprieto "Descargar" en un Lote en revisión

  ¿modo_prueba está activo?                      → si sí, no descargo nada
  para cada Tema 'pendiente' (máx. N en paralelo):
    ¿ya existe en la Biblioteca?                 → si sí, lo salto
    ¿ya existe un archivo con el mismo nombre?   → si sí, lo salto y aviso
    ENTONCES bajo el mejor audio disponible, lo convierto a AIFF,
    escribo tags y carátula, lo dejo en carpeta_salida con el nombre
    normalizado y lo registro en la Biblioteca.

Promesas: nunca dos archivos del mismo video · nunca sobrescribo un
archivo existente · un tema que falla no detiene el lote y queda con
su motivo visible y botón "reintentar" · ningún archivo a medio
escribir queda en carpeta_salida (se trabaja en temporal y se mueve
al final) · la app solo escucha en localhost.
```

## 7 · RIESGOS Y SUPUESTOS (a validar antes o durante la implementación)

```
R1  CALIDAD: YouTube entrega audio con pérdida (~128–160 kbps). En un
    sistema de club se puede notar. Es una limitación de la fuente, no
    de la app. Alternativa de calidad: comprar en Bandcamp/Beatport.
R2  LEGAL / ToS: descargar de YouTube va contra sus términos de uso.
    En Chile, la Ley 17.336 no tiene una excepción amplia de copia
    privada como otros países — no está claro que bajar para uso
    personal esté cubierto (no verificado con abogado; tómalo como
    zona gris). Si tocas en público, la licencia de comunicación
    pública (SCD) es otro tema, normalmente del local.
R3  SPOTIFY API: Spotify ha ido restringiendo su Web API para apps
    nuevas en modo desarrollo. Hay que verificar al implementar que
    leer playlists públicas con credenciales propias sigue funcionando;
    si no, plan B = extraer metadata de la página pública del link.
    (Supuesto no verificado a la fecha de este PRD.)
R4  FRAGILIDAD: YouTube cambia seguido; el descargador debe poder
    actualizarse fácil (un comando) y los errores deben ser legibles.
R5  MATCHING: el puntaje de candidatos va a fallar en remixes, edits y
    temas poco conocidos. Por eso existe la pantalla de revisión y el
    estado 'revisar' — no es opcional.
```

## 8 · FASES FUTURAS (cada una, su propio PRD)

```
F2  exportar XML de rekordbox con playlists armadas desde cada Lote
F3  fuentes adicionales: SoundCloud, compras de Bandcamp
F4  normalización de volumen / recorte de silencios iniciales
F5  buscador libre ("artista - tema") sin necesidad de link
```

> **Sin código. Solo pseudo-código.** Implementación según `CLAUDE.md`.
