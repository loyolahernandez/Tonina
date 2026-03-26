import re

with open('src/app/links/page.tsx', 'r') as f:
    content = f.read()

# Update state
content = content.replace(
    'const [toninaData, setToninaData] = useState({ name: "", business: "", bottleneck: "", budget: "" });',
    'const [toninaData, setToninaData] = useState({ name: "", email: "", phone: "", business: "", bottleneck: "", budget: "" });'
)

# Update reset state
content = content.replace(
    'setToninaData({ name: "", business: "", bottleneck: "", budget: "" });',
    'setToninaData({ name: "", email: "", phone: "", business: "", bottleneck: "", budget: "" });'
)

# Update supabase insert
old_insert = """      await supabase.from('tonina_leads').insert([
        { 
          name: toninaData.name, 
          business: toninaData.business, 
          bottleneck: toninaData.bottleneck, 
          budget: toninaData.budget 
        }
      ]);"""

new_insert = """      await supabase.from('tonina_leads').insert([
        { 
          name: toninaData.name,
          email: toninaData.email,
          phone: toninaData.phone,
          business: toninaData.business, 
          bottleneck: toninaData.bottleneck, 
          budget: toninaData.budget 
        }
      ]);"""
content = content.replace(old_insert, new_insert)

# Add JSX fields
old_jsx = """              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  Tu nombre
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                  placeholder="Ej. Juan Pérez"
                  value={toninaData.name}
                  onChange={(e) => setToninaData({ ...toninaData, name: e.target.value })}
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  ¿A qué se dedica tu empresa?"""

new_jsx = """              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  Tu nombre
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                  placeholder="Ej. Juan Pérez"
                  value={toninaData.name}
                  onChange={(e) => setToninaData({ ...toninaData, name: e.target.value })}
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                    Correo
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                    placeholder="juan@empresa.com"
                    value={toninaData.email}
                    onChange={(e) => setToninaData({ ...toninaData, email: e.target.value })}
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                    Teléfono (WhatsApp)
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                    placeholder="+569..."
                    value={toninaData.phone}
                    onChange={(e) => setToninaData({ ...toninaData, phone: e.target.value })}
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  ¿A qué se dedica tu empresa?"""
content = content.replace(old_jsx, new_jsx)

with open('src/app/links/page.tsx', 'w') as f:
    f.write(content)
