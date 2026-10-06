# PRD — Conectar mi cuenta de Spotify para leer playlists completas

_Sub-PRD de [getit-descarga-musica-dj](getit-descarga-musica-dj.md). Resuelve el tope de 100 temas (riesgo R3)._

## 0 · ENCABEZADO

```
PRD — Conectar mi cuenta de Spotify para leer playlists completas
Estado: Borrador · Dueño: Ignacio Loyola · Creado: 06-10-2026
Alcance: login con mi cuenta de Spotify (una sola cuenta, local) para leer
         por API las playlists que son mías o colaborativas, sin tope de 100;
         y aviso visible cuando una lista pudo llegar cortada.
         — NO toca la descarga, el matching ni el formato de salida;
           NO lee playlists ajenas por API (Spotify no lo permite desde 2026);
           NO modifica nada en mi cuenta de Spotify (solo lectura).
Tamaño: una funcionalidad chica.
```

## 1 · RESUMEN

```
Hoy: pego una playlist de 158 temas y getit trae 100, sin avisarme.
Después: conecto mi Spotify una vez; mis playlists llegan completas, y si
         alguna lista igual viene cortada (no es mía), getit me lo dice.
```

## 2 · LA HISTORIA

```
ANTES    Pegué mi playlist de 158 temas para el set. getit me mostró 95
         listos y yo pensé que estaba todo. Recién al revisar en rekordbox
         me di cuenta de que faltaban 58 temas.

DESPUÉS  En getit aparece "Conectar Spotify". Lo apreto, Spotify me pide
         permiso para leer mis playlists, acepto y vuelvo a getit con
         "Conectado como Ignacio". Pego la misma playlist y llegan los
         158. Cuando pego la playlist de un amigo, que no es mía, getit
         me avisa que solo pudo leer 100 y me sugiere dividirla.
```

## 3 · OBJETIVOS / NO-OBJETIVOS

```
O1   con la cuenta conectada, una playlist propia o colaborativa llega
     completa (sin tope de 100)
O2   conectar es un clic + aceptar en Spotify; queda conectado entre
     reinicios de la app (no hay que volver a loguearse)
O3   puedo desconectar con un clic, y getit olvida el acceso
O4   si una lista llega con exactamente 100 temas por la página pública,
     el lote muestra un aviso de "posiblemente cortada"
O5   si la playlist no es mía, se usa la página pública y se explica por qué
NO1  no pide permisos de escritura (no crea ni modifica playlists)
NO2  no soporta varias cuentas de Spotify
NO3  no intenta saltarse la regla de Spotify para playlists ajenas
```

## 4 · CÓMO FUNCIONA HOY → CÓMO VA A FUNCIONAR

```
HOY                                 DESPUÉS
link de playlist                    link de playlist
 └─ ¿credenciales de app?            └─ ¿cuenta conectada?
     └─ API (falla: no es tuya)          └─ API como yo → completa (si es mía)
 └─ página pública → máx. 100        └─ si no es mía / no conectado:
 └─ (sin aviso)                          página pública → máx. 100
                                         └─ si llegaron 100: AVISO en el lote
```

## 5 · LOS DATOS

```
disparador   apretar "Conectar Spotify" (login) · pegar un link de Spotify (uso)
Ajustes      spotify_token: acceso + renovación ← vive solo en la DB local
             spotify_user: nombre visible de la cuenta conectada
Lote         aviso?: texto ← "posiblemente cortada", "no es tuya", etc.
candado      'state' aleatorio por intento de login ← el retorno de Spotify
             solo se acepta si trae el mismo 'state' (anti-CSRF)
interruptor  conectado / desconectado (botón)
```

## 6 · PSEUDO-CÓDIGO — EL ACUERDO

```
CUANDO aprieto "Conectar Spotify"
  ¿hay client id/secret en .env?        → si no, explico cómo obtenerlos y paro
  ENTONCES voy a Spotify pidiendo SOLO lectura de mis playlists.

CUANDO Spotify me devuelve a getit
  ¿el 'state' coincide con el que generé? → si no, rechazo y no guardo nada
  ¿Spotify devolvió error / no acepté?   → si sí, lo digo y no guardo nada
  ENTONCES guardo el acceso y el nombre de la cuenta.

CUANDO analizo un link de Spotify
  ¿cuenta conectada?  → leo por API como yo
     ¿Spotify dice que no tengo acceso?  → página pública + aviso "no es tuya"
     ¿el acceso expiró y no se renueva?  → me desconecto, página pública + aviso
  ¿no conectada?      → como hoy (credenciales de app → página pública)
  ¿la página pública entregó exactamente 100?  → aviso "posiblemente cortada"

Promesas: solo permisos de lectura · el acceso nunca sale de mi Mac ·
nunca se pierde un tema en silencio: si la lista pudo venir cortada, se avisa.
```

## 7 · SUPUESTOS

```
S1  requiere Spotify Premium del dueño de la app (regla de Development Mode 2026)
S2  la Redirect URI registrada en el dashboard debe ser exactamente
    http://127.0.0.1:8765/callback (o el puerto configurado)
S3  la página pública no informa el total real de la playlist; por eso el
    aviso se basa en "llegaron exactamente 100" (verificado 06-10-2026
    con dos playlists públicas de >100 temas)
```
