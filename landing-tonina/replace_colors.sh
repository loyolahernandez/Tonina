#!/bin/bash
FILES="src/app/page.tsx src/app/links/page.tsx"

for file in $FILES; do
  sed -i 's/bg-indigo-600/bg-\\[#4976FF\\]/g' $file
  sed -i 's/text-indigo-600/text-\\[#4976FF\\]/g' $file
  sed -i 's/border-indigo-600/border-\\[#4976FF\\]/g' $file
  sed -i 's/ring-indigo-600/ring-\\[#4976FF\\]/g' $file
  sed -i 's/shadow-indigo-600/shadow-\\[#4976FF\\]/g' $file

  sed -i 's/bg-indigo-700/bg-\\[#3a5edb\\]/g' $file
  sed -i 's/hover:bg-indigo-700/hover:bg-\\[#3a5edb\\]/g' $file
  sed -i 's/hover:bg-indigo-500/hover:bg-\\[#5a83ff\\]/g' $file

  sed -i 's/bg-slate-900/bg-\\[#0E1330\\]/g' $file
  sed -i 's/text-slate-900/text-\\[#0E1330\\]/g' $file
  sed -i 's/bg-indigo-900/bg-\\[#0E1330\\]/g' $file
  sed -i 's/text-indigo-900/text-\\[#0E1330\\]/g' $file
  sed -i 's/shadow-slate-900/shadow-\\[#0E1330\\]/g' $file
  sed -i 's/shadow-indigo-900/shadow-\\[#0E1330\\]/g' $file

  sed -i 's/bg-slate-800/bg-\\[#27314D\\]/g' $file
  sed -i 's/border-slate-800/border-\\[#27314D\\]/g' $file
  sed -i 's/text-slate-800/text-\\[#27314D\\]/g' $file
done
