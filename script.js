/* ============================================================
   MATTER — JAVASCRIPT
   All animations, canvas visualizations, scroll effects
   ============================================================ */

'use strict';

// ==================== UTILITY ====================
const qs  = (sel, parent = document) => parent.querySelector(sel);
const qsa = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp  = (a, b, t) => a + (b - a) * t;
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ==================== CUSTOM CURSOR ====================
(function initCursor() {
  if (window.innerWidth < 768) return;
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  const dot  = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  // Start cursors off-screen to avoid corner flash
  ring.style.left = '-100px'; ring.style.top = '-100px';
  dot.style.left  = '-100px'; dot.style.top  = '-100px';

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateCursor() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  })();

  const hoverEls = 'a, button, .tab-btn, .feat-card, .press-card, .team-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) ring.classList.remove('hover');
  });
})();

// ==================== NAVBAR ====================
(function initNavbar() {
  const nav     = qs('#navbar');
  const burger  = qs('#hamburger');
  const mobileM = qs('#mobile-menu');
  const lightSections = ['#robotics', '#applications', '#press', '#team'];

  // Scroll behavior
  let lastY = 0;
  function updateNav() {
    const y = window.scrollY;
    // Scrolled state
    if (y > 40) nav.classList.add('scrolled');
    else         nav.classList.remove('scrolled');

    // light/dark based on section
    let isLight = false;
    lightSections.forEach(sel => {
      const el = qs(sel);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom > 80) isLight = true;
    });
    if (isLight) nav.classList.add('light-nav');
    else          nav.classList.remove('light-nav');

    lastY = y;
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile hamburger
  burger.addEventListener('click', () => {
    const open = mobileM.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    // Animate bars
    const bars = burger.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  // Close on link click
  qsa('.mobile-link', mobileM).forEach(l => {
    l.addEventListener('click', () => {
      mobileM.classList.remove('open');
      burger.click(); burger.click(); // reset bars
    });
  });
})();

// ==================== SCROLL REVEAL ====================
(function initReveal() {
  const items = qsa('[data-reveal]');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        // Stagger siblings
        const siblings = qsa('[data-reveal]', e.target.parentElement);
        const idx = siblings.indexOf(e.target);
        const delay = idx * 0.08;
        e.target.style.transitionDelay = delay + 's';
        e.target.classList.add('revealed');
        // Animate tech bars
        const bar = e.target.querySelector('.tech-bar-fill');
        if (bar) {
          const w = bar.style.width;
          bar.style.setProperty('--target-width', w);
          bar.style.width = '0';
          requestAnimationFrame(() => {
            bar.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
            bar.style.width = w;
          });
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(it => io.observe(it));
})();

// ==================== STATS COUNT-UP ====================
(function initCountUp() {
  const nums = qsa('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const isFloat = target < 10;
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = target * eased;
        el.textContent = isFloat ? val.toFixed(2) : Math.round(val).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = isFloat ? target.toFixed(2) : target.toLocaleString();
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

// ==================== TABS ====================
(function initTabs() {
  const nav    = qs('#tabs-nav');
  const panels = qsa('.tab-panel');
  const btns   = qsa('.tab-btn');

  function activate(id) {
    btns.forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    panels.forEach(p => {
      const isActive = p.id === 'panel-' + id;
      p.classList.toggle('active', isActive);
    });
    // init canvas for active panel
    const canvas = qs('#canvas-' + id);
    if (canvas && !canvas._initialized) {
      initAppCanvas(canvas, id);
      canvas._initialized = true;
    }
  }

  btns.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
  // init first active
  activate('mining');
})();

// ==================== HERO CANVAS ====================
(function initHeroCanvas() {
  const canvas = qs('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], waveSeed = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create grid points
  const COLS = 64, ROWS = 40;
  const pts = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      pts.push({ r, c, phase: rand(0, Math.PI * 2) });
    }
  }

  function draw(ts) {
    requestAnimationFrame(draw);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    const t = ts * 0.0008;
    const cw = W / COLS, ch = H / ROWS;

    // Draw spectral wave grid
    ctx.strokeStyle = 'rgba(110,231,183,0.08)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pt = pts[r * COLS + c];
        const wave = Math.sin(c * 0.18 + t * 2 + pt.phase) * 0.5 +
                     Math.sin(r * 0.25 + t * 1.5) * 0.5;
        const alpha = clamp(0.04 + wave * 0.08, 0, 0.2);
        const x = c * cw + cw/2;
        const y = r * ch + ch/2 + wave * 6;

        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110,231,183,${alpha})`;
        ctx.fill();
      }
    }

    // Draw scan bands (spectral slices)
    for (let i = 0; i < 8; i++) {
      const offset = ((ts * 0.04 + i * (H / 8)) % H);
      const hue   = (i * 22 + t * 20) % 360;
      const alpha = 0.06 + Math.sin(i + t) * 0.03;
      ctx.fillStyle = `hsla(${hue},60%,60%,${alpha})`;
      ctx.fillRect(0, offset, W, 1);
    }

    // Binary data stream on right side
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(110,231,183,0.15)';
    const chars = '01';
    for (let row = 0; row < Math.floor(H / 16); row++) {
      for (let col = W - 120; col < W - 10; col += 14) {
        if (Math.random() < 0.02) {
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], col, row * 16);
        }
      }
    }

    // Animated corner brackets
    const bSize = 40, bThick = 1.5;
    ctx.strokeStyle = 'rgba(110,231,183,0.35)';
    ctx.lineWidth = bThick;
    const pad = 60;
    // TL
    ctx.beginPath(); ctx.moveTo(pad, pad + bSize); ctx.lineTo(pad, pad); ctx.lineTo(pad + bSize, pad); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(W - pad - bSize, pad); ctx.lineTo(W - pad, pad); ctx.lineTo(W - pad, pad + bSize); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(pad, H - pad - bSize); ctx.lineTo(pad, H - pad); ctx.lineTo(pad + bSize, H - pad); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(W - pad - bSize, H - pad); ctx.lineTo(W - pad, H - pad); ctx.lineTo(W - pad, H - pad - bSize); ctx.stroke();
  }
  requestAnimationFrame(draw);
})();

// ==================== SATELLITE CANVAS ====================
(function initSatelliteCanvas() {
  const canvas = qs('#satellite-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 580;
    H = canvas.height = canvas.offsetHeight || 480;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  // Globe parameters
  const ORBS = [
    { radius: 0.42, speed: 0.0004, phase: 0,           tilt: 20, color: 'rgba(110,231,183,0.7)' },
    { radius: 0.60, speed: 0.00025, phase: Math.PI/2,  tilt: -35, color: 'rgba(200,200,200,0.4)' },
    { radius: 0.78, speed: 0.00015, phase: Math.PI,    tilt: 12, color: 'rgba(150,180,255,0.3)' },
  ];

  function drawOrbit(cx, cy, rx, ry, alpha) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(240,240,240,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function draw(ts) {
    requestAnimationFrame(draw);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const globeR = Math.min(W, H) * 0.28;

    // Draw globe
    ctx.beginPath();
    ctx.arc(cx, cy, globeR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(240,240,240,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#0D0D0D';
    ctx.fill();

    // Draw longitude/latitude lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      ctx.beginPath();
      ctx.ellipse(cx, cy, globeR * Math.abs(Math.cos(angle + ts * 0.0002)), globeR, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(240,240,240,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    for (let i = -3; i <= 3; i++) {
      const lat = (i / 4) * globeR;
      const latR = Math.sqrt(Math.max(0, globeR * globeR - lat * lat));
      ctx.beginPath();
      ctx.ellipse(cx, cy + lat, latR, latR * 0.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(240,240,240,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw orbit paths
    ORBS.forEach(orb => {
      const rx = globeR * orb.radius;
      const ry = rx * Math.abs(Math.sin((orb.tilt * Math.PI) / 180)) + rx * 0.15;
      drawOrbit(cx, cy, rx, ry, 0.12);
    });

    // Draw satellites
    ORBS.forEach(orb => {
      const rx = globeR * orb.radius;
      const ry = rx * Math.abs(Math.sin((orb.tilt * Math.PI) / 180)) + rx * 0.15;
      const angle = ts * orb.speed + orb.phase;
      const sx = cx + rx * Math.cos(angle);
      const sy = cy + ry * Math.sin(angle);

      // Satellite body
      ctx.fillStyle = orb.color;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Solar panels (lines)
      ctx.strokeStyle = orb.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy);
      ctx.lineTo(sx + 12, sy);
      ctx.stroke();

      // Glow
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 20);
      grd.addColorStop(0, orb.color.replace('0.7', '0.2').replace('0.4', '0.1').replace('0.3', '0.08'));
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, 20, 0, Math.PI * 2);
      ctx.fill();

      // Scan line from satellite
      if (orb.radius < 0.5) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx + (sx - cx) * 0.3, cy + (sy - cy) * 0.3);
        ctx.strokeStyle = orb.color.replace('0.7', '0.15');
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });

    // Coverage footprint animation
    const footAngle = ts * 0.0003;
    const fx = cx + globeR * 0.35 * Math.cos(footAngle);
    const fy = cy + globeR * 0.18 * Math.sin(footAngle);
    ctx.beginPath();
    ctx.ellipse(fx, fy, 40 + Math.sin(ts * 0.002) * 5, 20, Math.cos(footAngle), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(110,231,183,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Data labels bottom
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(240,240,240,0.35)';
    ctx.fillText('ALT: 525 km', 20, H - 40);
    ctx.fillText('INC: 97.6°',  20, H - 24);
    const latVal = (Math.sin(ts * 0.001) * 45).toFixed(1);
    ctx.fillText(`LAT: ${latVal}°N`, W - 120, H - 40);
    ctx.fillText(`LON: ${(ts * 0.01 % 360).toFixed(1)}°E`, W - 120, H - 24);
  }
  requestAnimationFrame(draw);
})();

// ==================== ROBOTICS CANVAS ====================
(function initRoboticsCanvas() {
  const canvas = qs('#robotics-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 500;
    H = canvas.height = canvas.offsetHeight || 375;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  let mouseX = W / 2, mouseY = H / 2;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  // Depth map simulation
  const GRID = 20;
  const depths = [];
  for (let row = 0; row < GRID; row++) {
    depths.push([]);
    for (let col = 0; col < GRID; col++) {
      depths[row].push(rand(0.1, 1));
    }
  }

  function draw(ts) {
    requestAnimationFrame(draw);
    ctx.fillStyle = '#F5F5F0';
    ctx.fillRect(0, 0, W, H);

    const t = ts * 0.001;
    const cw = W / GRID, ch = H / GRID;

    // Draw depth map (point cloud)
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const depth = depths[row][col];
        const wave  = Math.sin(col * 0.3 + t) * 0.1 + Math.cos(row * 0.25 + t * 0.7) * 0.1;
        const d     = clamp(depth + wave, 0, 1);
        const x = col * cw + cw/2;
        const y = row * ch + ch/2;

        // Spectral color: near (warm/light) → far (cool/dark) — scientific depth palette
        // near: light teal, far: dark blue-gray (all muted, scientific)
        const r = Math.round(lerp(180, 30, d));
        const g = Math.round(lerp(220, 80, d));
        const b = Math.round(lerp(200, 160, d));
        const size = 1.5 + d * 3.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.globalAlpha = 0.55 + d * 0.45;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Mouse-interactive highlight
    const mx = mouseX, my = mouseY;
    const radius = 80;
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const x = col * cw + cw/2;
        const y = row * ch + ch/2;
        const dist = Math.hypot(x - mx, y - my);
        if (dist < radius) {
          const intensity = 1 - dist / radius;
          ctx.beginPath();
          ctx.arc(x, y, 4 + intensity * 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(110,231,183,${intensity * 0.6})`;
          ctx.fill();
        }
      }
    }

    // Scan cross at mouse
    ctx.strokeStyle = 'rgba(17,17,17,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(W, my); ctx.stroke();

    // Info box
    const depthAtCursor = clamp((mx / W), 0, 1);
    ctx.fillStyle = 'rgba(17,17,17,0.85)';
    ctx.fillRect(mx + 12, my - 30, 110, 24);
    ctx.fillStyle = '#F5F5F0';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`D: ${(depthAtCursor * 8.4).toFixed(2)}m`, mx + 19, my - 13);

    // Spec values animation
    const fps = qs('#spec-fps');
    if (fps) fps.textContent = `${(118 + Math.sin(t) * 2).toFixed(0)} Hz`;
    const lat = qs('#spec-lat');
    if (lat) lat.textContent = `${(2.0 + Math.random() * 0.3).toFixed(1)} ms`;
  }
  requestAnimationFrame(draw);
})();

// ==================== APP CANVASES ====================
function initAppCanvas(canvas, type) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || 500;
    H = canvas.height = canvas.offsetHeight || 375;
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  let hovered = false;
  canvas.parentElement.addEventListener('mouseenter', () => hovered = true);
  canvas.parentElement.addEventListener('mouseleave', () => hovered = false);

  const palettes = {
    mining:        [[200,160,80],[180,120,60],[160,140,100],[120,100,80],[100,80,60]],
    agriculture:   [[80,160,80],[100,180,60],[60,140,100],[140,180,80],[80,200,100]],
    infrastructure:[[80,100,160],[100,120,180],[70,90,140],[90,110,170],[60,80,150]],
    defense:       [[50,60,50],[70,80,60],[60,70,50],[80,90,70],[40,50,40]],
    climate:       [[80,140,200],[60,160,180],[100,120,220],[80,160,210],[60,140,190]],
  };

  const pal = palettes[type] || palettes.mining;
  const GRID = 24;
  const cells = [];
  for (let r = 0; r < GRID; r++) {
    cells.push([]);
    for (let c = 0; c < GRID; c++) {
      cells[r].push({
        base: pal[randInt(0, pal.length - 1)],
        noise: rand(0.8, 1.2),
        phase: rand(0, Math.PI * 2),
      });
    }
  }

  let revealProgress = 0;

  function draw(ts) {
    requestAnimationFrame(draw);
    const t = ts * 0.0006;
    ctx.clearRect(0, 0, W, H);

    const cw = W / GRID, ch = H / GRID;

    // Reveal effect on hover
    if (hovered) revealProgress = Math.min(revealProgress + 0.03, 1);
    else          revealProgress = Math.max(revealProgress - 0.02, 0);

    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const cell = cells[r][c];
        const [br, bg, bb] = cell.base;

        // Normal (grayscale) vs spectral (color) based on reveal
        const wave = Math.sin(c * 0.2 + t + cell.phase) * 0.1;
        const bright = clamp(cell.noise + wave, 0.6, 1.4);

        const gray = ((br + bg + bb) / 3) * bright;
        const nr = lerp(gray, br * bright, revealProgress);
        const ng = lerp(gray, bg * bright * 1.3, revealProgress);
        const nb = lerp(gray, bb * bright * 1.1, revealProgress);

        ctx.fillStyle = `rgb(${~~nr},${~~ng},${~~nb})`;
        ctx.fillRect(c * cw, r * ch, cw + 0.5, ch + 0.5);

        // Spectral overlay lines on reveal
        if (revealProgress > 0.5 && Math.random() < 0.001) {
          ctx.fillStyle = 'rgba(110,231,183,0.8)';
          ctx.fillRect(c * cw, r * ch, cw, 1);
        }
      }
    }

    // Cursor crosshair (for hover effect)
    if (hovered && revealProgress > 0.3) {
      ctx.strokeStyle = `rgba(110,231,183,${revealProgress * 0.7})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(W * 0.35, 0);
      ctx.lineTo(W * 0.35, H);
      ctx.stroke();
    }

    // Overlay labels
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = `rgba(240,240,240,${0.4 + revealProgress * 0.4})`;
    const labels = { mining: 'Fe2O3 | SiO2 | MgO', agriculture: 'NDVI | NDRE | LAI', infrastructure: 'ΔT | RMS | σ', defense: 'SWIR BLEND | TIR', climate: 'CO₂ | CH₄ | SST' };
    ctx.fillText(labels[type] || '', 12, H - 12);
  }
  requestAnimationFrame(draw);
}

// ==================== SMOOTH SECTION PARALLAX ====================
(function initParallax() {
  const hero = qs('#hero');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (hero) {
      const canvas = hero.querySelector('#hero-canvas');
      if (canvas) canvas.style.transform = `translateY(${sy * 0.3}px)`;
    }
  }, { passive: true });
})();

// ==================== FORM ====================
(function initForm() {
  const form = qs('#access-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = qs('#form-submit');
    btn.textContent = 'Submitted ✓';
    btn.style.background = '#6EE7B7';
    btn.style.color = '#0A0A0A';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Request Access';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
})();

// ==================== SMOOTH ANCHOR SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==================== REVEAL TECH BAR WIDTHS ====================
// Initial target width storage (before animation resets width)
qsa('.tech-bar-fill').forEach(bar => {
  bar.dataset.targetWidth = bar.style.width;
});
