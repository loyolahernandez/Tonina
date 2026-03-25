#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add landing-tonina/src/app/globals.css landing-tonina/src/app/layout.tsx landing-tonina/src/app/page.tsx
git commit -m "style: align landing page with brand design system

- layout.tsx: título Tonina, lang=es
- globals.css: foreground → #0E1330, variables CSS de marca, sin dark mode override
- page.tsx: clases indigo-* reemplazadas por hex de marca #4976FF

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
echo "✅ Deploy completado"
