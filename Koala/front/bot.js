const SUPABASE_URL = "https://qzwsgodolcvzldbgaggq.supabase.co";
// NOTE: This is a public anon key, it's safe to expose on frontend for row-level security.
const p1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3Nnb2RvbGN2emxkYmdhZ2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTk4MTcsImV4cCI6MjA4OTE3NTgxN30.";
const p2 = "GIg_c9jIf5jG4Qrr1kVPWy7nt6ONbNEgu3-Wem6QLLA";
const SUPABASE_ANON_KEY = p1 + p2;

document.addEventListener("DOMContentLoaded", () => {
  // Ocultar el botón original de WhatsApp flotante
  const oldWhatsapp = document.querySelector(".whatsapp-float");
  if (oldWhatsapp) oldWhatsapp.style.display = "none";

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes koala-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(255, 138, 0, 0.55), 0 6px 20px rgba(255, 106, 0, 0.35); }
      70%  { box-shadow: 0 0 0 18px rgba(255, 138, 0, 0), 0 6px 20px rgba(255, 106, 0, 0.35); }
      100% { box-shadow: 0 0 0 0 rgba(255, 138, 0, 0), 0 6px 20px rgba(255, 106, 0, 0.35); }
    }

    @keyframes koala-fade-up {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes koala-fade-out {
      from { opacity: 1; transform: translateY(0); }
      to   { opacity: 0; transform: translateY(6px); }
    }

    #koala-bot-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1100;
      font-family: 'Nunito', sans-serif;
    }

    #koala-bot-bubble {
      width: 62px;
      height: 62px;
      background: linear-gradient(140deg, #ff9a1a 0%, #ff6a00 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(255, 106, 0, 0.35);
      cursor: pointer;
      transition: transform 0.2s ease;
      animation: koala-pulse 2.4s ease-in-out infinite;
      position: relative;
    }

    #koala-bot-bubble.bot-opened {
      animation: none;
      box-shadow: 0 6px 20px rgba(255, 106, 0, 0.35);
    }

    #koala-bot-bubble:hover {
      transform: scale(1.08);
    }

    #koala-bot-bubble svg {
      width: 30px;
      height: 30px;
      fill: currentColor;
    }

    .koala-notif-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      border-radius: 50%;
      border: 2.5px solid white;
      font-size: 10px;
      font-weight: 800;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      font-family: 'Nunito', sans-serif;
    }

    .koala-teaser {
      position: absolute;
      bottom: 76px;
      right: 0;
      background: white;
      border-radius: 14px 14px 0 14px;
      padding: 10px 16px;
      font-size: 13.5px;
      font-weight: 700;
      color: #1e293b;
      box-shadow: 0 6px 24px rgba(0,0,0,0.13);
      white-space: nowrap;
      border: 1px solid rgba(0,0,0,0.07);
      animation: koala-fade-up 0.35s ease forwards;
      pointer-events: none;
    }

    .koala-teaser.hiding {
      animation: koala-fade-out 0.3s ease forwards;
    }

    .koala-teaser::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 20px;
      width: 11px;
      height: 11px;
      background: white;
      border-right: 1px solid rgba(0,0,0,0.07);
      border-bottom: 1px solid rgba(0,0,0,0.07);
      transform: rotate(45deg);
      clip-path: polygon(0 0, 100% 100%, 0 100%);
    }

    #koala-bot-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 345px;
      background: white;
      border-radius: 22px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06);
      overflow: hidden;
      display: none;
      flex-direction: column;
      transform-origin: bottom right;
      transition: opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1);
      opacity: 0;
      transform: scale(0.9) translateY(10px);
      border: 1px solid rgba(0,0,0,0.06);
    }

    #koala-bot-window.open {
      display: flex;
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    .koala-bot-header {
      background: linear-gradient(135deg, #ff9a1a 0%, #ff6a00 100%);
      color: white;
      padding: 15px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .koala-bot-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .koala-bot-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.35);
    }

    .koala-bot-header-text h3 {
      margin: 0 0 1px;
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.01em;
    }

    .koala-bot-header-text p {
      margin: 0;
      font-size: 11.5px;
      opacity: 0.85;
      font-weight: 600;
    }

    .koala-bot-online {
      display: inline-block;
      width: 7px;
      height: 7px;
      background: #4ade80;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
    }

    .koala-bot-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 17px;
      cursor: pointer;
      line-height: 1;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      flex-shrink: 0;
    }

    .koala-bot-close:hover {
      background: rgba(255,255,255,0.35);
    }

    .koala-bot-body {
      padding: 16px;
      background: #fafafa;
      max-height: 390px;
      overflow-y: auto;
    }

    .koala-bot-body::-webkit-scrollbar {
      width: 4px;
    }

    .koala-bot-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .koala-bot-body::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 99px;
    }

    .bot-message {
      background: white;
      padding: 12px 14px;
      border-radius: 16px;
      border-top-left-radius: 3px;
      font-size: 14px;
      color: #374151;
      margin-bottom: 14px;
      line-height: 1.55;
      border: 1px solid #f0f0f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .koala-bot-form {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .koala-bot-form input,
    .koala-bot-form select {
      width: 100%;
      padding: 11px 13px;
      border: 1.5px solid #e9ecef;
      border-radius: 11px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;
      background: white;
      color: #111827;
      transition: border-color 0.18s, box-shadow 0.18s;
      -webkit-appearance: none;
    }

    .koala-bot-form input::placeholder {
      color: #b0b7c3;
    }

    .koala-bot-form input:focus,
    .koala-bot-form select:focus {
      border-color: #ff8a00;
      box-shadow: 0 0 0 3px rgba(255,138,0,0.12);
    }

    .koala-bot-trust {
      font-size: 11.5px;
      color: #b0b7c3;
      text-align: center;
      margin: 2px 0 0;
      line-height: 1.4;
    }

    .koala-bot-submit {
      background: linear-gradient(135deg, #4bb5a2 0%, #379483 100%);
      color: white;
      border: none;
      padding: 13px;
      border-radius: 11px;
      font-weight: 800;
      cursor: pointer;
      font-size: 14.5px;
      transition: opacity 0.2s, transform 0.15s;
      letter-spacing: 0.015em;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(75, 181, 162, 0.32);
    }

    .koala-bot-submit:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .koala-bot-submit:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .bot-success {
      text-align: center;
      padding: 10px 6px 6px;
    }

    .bot-success-icon {
      font-size: 46px;
      margin-bottom: 10px;
      line-height: 1;
      display: block;
    }

    .bot-success h3 {
      margin: 0 0 8px;
      font-size: 17px;
      color: #111827;
      font-weight: 800;
    }

    .bot-success p {
      font-size: 13.5px;
      color: #6b7280;
      margin: 0 0 18px;
      line-height: 1.55;
    }

    .btn-whatsapp-direct {
      background: #25d366;
      color: white;
      text-decoration: none;
      padding: 13px 22px;
      border-radius: 11px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      box-shadow: 0 5px 16px rgba(37, 211, 102, 0.32);
      transition: background 0.2s, transform 0.15s;
      font-family: inherit;
    }

    .btn-whatsapp-direct:hover {
      background: #20b858;
      transform: translateY(-1px);
    }

    .btn-whatsapp-direct svg {
      flex-shrink: 0;
    }

    @media (max-width: 480px) {
      #koala-bot-window {
        width: calc(100vw - 36px);
        right: 0;
        bottom: 76px;
        border-radius: 18px;
      }

      #koala-bot-container {
        bottom: 18px;
        right: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.id = "koala-bot-container";

  const koalaIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.3-.4a2.5 2.5 0 1 0-3.6 3.5l3.9 3.9 3.9-3.9a2.5 2.5 0 0 0 0-3.5Z"/></svg>`;
  const waIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

  container.innerHTML = `
    <div id="koala-bot-window">
      <div class="koala-bot-header">
        <div class="koala-bot-header-info">
          <div class="koala-bot-avatar">🐨</div>
          <div class="koala-bot-header-text">
            <h3>Tía Paz · Directora</h3>
            <p><span class="koala-bot-online"></span>Jardín Infantil Koala</p>
          </div>
        </div>
        <button class="koala-bot-close" aria-label="Cerrar">&times;</button>
      </div>
      <div class="koala-bot-body" id="koala-bot-content">
        <div class="bot-message">
          ¡Hola! Estoy con los niños en este momento 🌟 Deja tus datos y te escribo en el día para mostrarte el jardín y revisar si hay cupos disponibles.
        </div>
        <form class="koala-bot-form" id="koala-lead-form">
          <input type="text" id="lead_nombre" placeholder="Tu nombre" required autocomplete="name">
          <input type="tel" id="lead_telefono" placeholder="Tu celular (+569...)" required autocomplete="tel">
          <input type="text" id="lead_nino" placeholder="Nombre de tu hijo/a" required>
          <select id="lead_nivel" required>
            <option value="" disabled selected>¿Qué nivel te interesa?</option>
            <option value="Sala Cuna">Sala Cuna (0–2 años)</option>
            <option value="Jardín Infantil">Jardín Infantil (2–4 años)</option>
            <option value="After School">After School</option>
          </select>
          <button type="submit" class="koala-bot-submit" id="lead_submit">Guardar mi lugar →</button>
          <p class="koala-bot-trust">🔒 Tus datos son privados. Solo te contactamos nosotros.</p>
        </form>
      </div>
    </div>
    <div id="koala-bot-bubble" aria-label="Abrir chat">
      <span class="koala-notif-dot">1</span>
      ${koalaIcon}
    </div>
  `;
  document.body.appendChild(container);

  const bubble = document.getElementById("koala-bot-bubble");
  const win = document.getElementById("koala-bot-window");
  const closeBtn = container.querySelector(".koala-bot-close");
  const notifDot = container.querySelector(".koala-notif-dot");

  let isOpen = false;

  const openBot = () => {
    if (isOpen) return;
    isOpen = true;
    win.style.display = "flex";
    win.offsetHeight; // reflow
    win.classList.add("open");
    bubble.classList.add("bot-opened");
    if (notifDot && notifDot.parentNode) notifDot.remove();
    const teaser = document.getElementById("koala-teaser");
    if (teaser) {
      teaser.classList.add("hiding");
      setTimeout(() => { if (teaser.parentNode) teaser.remove(); }, 300);
    }
  };

  const closeBot = () => {
    if (!isOpen) return;
    isOpen = false;
    win.classList.remove("open");
    setTimeout(() => { if (!isOpen) win.style.display = "none"; }, 280);
  };

  bubble.addEventListener("click", () => {
    if (isOpen) {
      closeBot();
    } else {
      openBot();
    }
  });

  closeBtn.addEventListener("click", closeBot);

  // Teaser tooltip a los 2s
  setTimeout(() => {
    if (!isOpen) {
      const teaser = document.createElement("div");
      teaser.className = "koala-teaser";
      teaser.id = "koala-teaser";
      teaser.textContent = "¿Hay cupos disponibles? 🐨";
      container.appendChild(teaser);
      setTimeout(() => {
        if (teaser.parentNode && !isOpen) {
          teaser.classList.add("hiding");
          setTimeout(() => { if (teaser.parentNode) teaser.remove(); }, 300);
        }
      }, 3800);
    }
  }, 2000);

  // Auto-open a los 5s
  setTimeout(() => {
    if (!isOpen) openBot();
  }, 5000);

  // Envío del formulario a Supabase
  const form = document.getElementById("koala-lead-form");
  const submitBtn = document.getElementById("lead_submit");
  const contentDiv = document.getElementById("koala-bot-content");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "Guardando...";

    const nombreCompleto = document.getElementById("lead_nombre").value.trim();
    const primerNombre = nombreCompleto.split(" ")[0];

    const data = {
      nombre_apoderado: nombreCompleto,
      telefono: document.getElementById("lead_telefono").value.trim(),
      nombre_nino: document.getElementById("lead_nino").value.trim(),
      nivel_interes: document.getElementById("lead_nivel").value || "No especificado",
      estado: "NUEVO"
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error("API: " + response.status + " " + errText);
      }

      const waMsg = `Hola Tía Paz, soy ${data.nombre_apoderado}. Acabo de dejar mis datos en la página del jardín y me gustaría saber más sobre el nivel ${data.nivel_interes}.`;

      contentDiv.innerHTML = `
        <div class="bot-success">
          <span class="bot-success-icon">🎉</span>
          <h3>¡Listo, ${primerNombre}!</h3>
          <p>Tus datos quedaron guardados. La Tía Paz te escribirá hoy para mostrarte el jardín y confirmar tu cupo.</p>
          <a href="https://wa.me/56982091551?text=${encodeURIComponent(waMsg)}" target="_blank" class="btn-whatsapp-direct">
            ${waIcon}
            Escribir ahora por WhatsApp
          </a>
        </div>
      `;
    } catch (error) {
      console.error("Error guardando lead:", error);
      submitBtn.disabled = false;
      submitBtn.innerText = "Reintentar";
    }
  });
});
