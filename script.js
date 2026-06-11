/* ====== GOLD SPARKLE PARTICLES (full page canvas) ====== */
(function(){
  const canvas = document.getElementById('sparkleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, {passive:true});

  let mx = -100, my = -100;
  let particles = [];
  const TRAIL_COUNT = 8;
  const trail = Array.from({length:TRAIL_COUNT}, ()=>({x:-100,y:-100}));
  const LAG = [0.85, 0.35, 0.26, 0.19, 0.14, 0.10, 0.07, 0.05];

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, {passive:true});

  // Click burst
  document.addEventListener('click', e => {
    for(let i=0;i<10;i++){
      particles.push({
        x:e.clientX, y:e.clientY,
        vx:(Math.random()-0.5)*8, vy:(Math.random()-0.5)*8 - 3,
        life:1, decay:0.02+Math.random()*0.02,
        size:2+Math.random()*3,
        color:`rgba(200,134,10,${0.6+Math.random()*0.4})`
      });
    }
  });

  // Hover gravity targets
  let gravTarget = null;
  document.querySelectorAll('.spotlight-card, .contact-island__card, .p-card').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{ gravTarget = el; });
    el.addEventListener('mouseleave', ()=>{ gravTarget = null; });
  });

  function animate(){
    ctx.clearRect(0,0,W,H);

    // Draw trailing dots
    trail[0].x += (mx - trail[0].x) * LAG[0];
    trail[0].y += (my - trail[0].y) * LAG[0];
    for(let i=1;i<TRAIL_COUNT;i++){
      trail[i].x += (trail[i-1].x - trail[i].x) * LAG[i];
      trail[i].y += (trail[i-1].y - trail[i].y) * LAG[i];
    }

    // Check if pointer fine (desktop)
    if(window.matchMedia('(pointer:fine)').matches){
      trail.forEach((p,i)=>{
        const size = 4.5 - i*0.45;
        const alpha = 1 - i*0.12;
        ctx.save();
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.fillStyle = '#C8860A';
        ctx.shadowColor = 'rgba(200,134,10,0.5)';
        ctx.shadowBlur = 6 - i;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(size,0.5), 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
    }

    // Burst particles
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= p.decay;

      // Gravity toward hovered card
      if(gravTarget){
        const rect = gravTarget.getBoundingClientRect();
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        const dx = cx - p.x, dy = cy - p.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 300){
          p.vx += dx/dist * 0.4;
          p.vy += dy/dist * 0.4;
        }
      }

      if(p.life <= 0){ particles.splice(i,1); continue; }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = 'rgba(200,134,10,0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }
  animate();

  // Hide system cursor on desktop
  if(window.matchMedia('(pointer:fine)').matches){
    document.body.style.cursor = 'none';
    document.querySelectorAll('a,button').forEach(el=>{ el.style.cursor='none'; });
  }
})();

/* ====== TEXT SCRAMBLE (hero) ====== */
(function(){
  const el = document.querySelector('.text-scramble');
  if(!el) return;
  const finalText = el.getAttribute('data-final') || el.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let frame = 0;
  const totalFrames = 25;

  function scramble(){
    if(frame >= totalFrames){ el.textContent = finalText; return; }
    let out = '';
    for(let i=0;i<finalText.length;i++){
      if(i < (frame/totalFrames)*finalText.length){
        out += finalText[i];
      } else {
        out += chars[Math.floor(Math.random()*chars.length)];
      }
    }
    el.textContent = out;
    frame++;
    requestAnimationFrame(scramble);
  }

  // Start after short delay
  setTimeout(scramble, 600);
})();

/* ====== SPOTLIGHT BORDER (cards) ====== */
(function(){
  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    });
  });
})();

/* ====== CLIP REVEAL (section headers) ====== */
(function(){
  const els = document.querySelectorAll('.clip-reveal');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, {threshold:0.3});
  els.forEach(el=>obs.observe(el));
})();

/* ====== SCROLL REVEAL ====== */
(function(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(()=> entry.target.classList.add('visible'), Math.min(idx*70, 350));
      io.unobserve(entry.target);
    });
  },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
  items.forEach(el=>io.observe(el));
})();

/* ====== NAV ====== */
(function(){
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('navOverlay');
  if(!nav||!burger||!overlay) return;

  window.addEventListener('scroll',()=>{
    nav.style.top = window.scrollY > 20 ? '8px' : '16px';
  },{passive:true});

  burger.addEventListener('click',()=>{
    const open = overlay.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  overlay.querySelectorAll('.nav-ol').forEach(link=>{
    link.addEventListener('click',()=>{
      overlay.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    });
  });
})();

/* ====== FAQ ====== */
function toggleFaq(btn){
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el=>{
    el.classList.remove('open');
    el.querySelector('.faq-q').setAttribute('aria-expanded','false');
  });
  if(!isOpen){ item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
}

/* ====== SMOOTH SCROLL ====== */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t = document.querySelector(a.getAttribute('href'));
    if(!t) return;
    e.preventDefault();
    window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-70,behavior:'smooth'});
  });
});


/* ====== PRICING CAROUSEL (removed — replaced by momentum carousel) ====== */

/* ====== HERO 3D TILT (toàn hero nghiêng theo chuột) ====== */
(function(){
  const hero = document.querySelector('[data-hero3d]');
  const tiltEl = document.getElementById('heroTilt');
  if(!hero || !tiltEl) return;

  hero.addEventListener('mousemove', e=>{
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / (rect.width/2);   // -1 to 1
    const dy = (e.clientY - cy) / (rect.height/2);  // -1 to 1
    const rotY = dx * 4;   // max 4 deg
    const rotX = -dy * 3;  // max 3 deg
    tiltEl.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
  },{passive:true});

  hero.addEventListener('mouseleave', ()=>{
    tiltEl.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
  });
})();


/* ====== INFINITE MOMENTUM CAROUSEL — Stacked, physics-based ====== */
(function(){
  const viewport = document.getElementById('pcViewport');
  const track = document.getElementById('pcTrack');
  if(!viewport || !track) return;

  const slides = Array.from(track.querySelectorAll('.pc-slide'));
  const TOTAL = slides.length; // 4 original
  if(TOTAL === 0) return;

  // Clone slides 20 times for infinite loop (80 slides total)
  const CLONES = 20;
  for(let c = 0; c < CLONES; c++){
    slides.forEach(s => {
      track.appendChild(s.cloneNode(true));
    });
  }
  const allSlides = Array.from(track.querySelectorAll('.pc-slide'));

  // State
  let position = 0;
  let velocity = 0;
  let isDragging = false;
  let startX = 0;
  let startPos = 0;
  let lastX = 0;
  let lastTime = 0;
  let animId;

  // Stacked cards: each card width minus overlap
  const OVERLAP = 40; // px overlap between cards
  function getSlideWidth(){
    return allSlides[0].offsetWidth;
  }
  function getEffectiveSlideWidth(){
    return getSlideWidth() - OVERLAP; // visible portion per card
  }
  function getTotalWidth(){
    return getEffectiveSlideWidth() * TOTAL;
  }

  function wrapPosition(){
    const totalW = getTotalWidth();
    const halfTotal = totalW * (CLONES / 2);
    if(position < -halfTotal - totalW) position += totalW * CLONES;
    if(position > -halfTotal + totalW * CLONES) position -= totalW * CLONES;
  }

  function updateVisuals(){
    track.style.transform = `translateX(${position}px)`;
    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.left + viewportRect.width / 2;
    const effectiveW = getEffectiveSlideWidth();

    // Find the closest slide to center
    let closestIdx = 0;
    let closestDist = Infinity;
    allSlides.forEach((s, i) => {
      const rect = s.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const dist = Math.abs(slideCenter - centerX);
      if(dist < closestDist){
        closestDist = dist;
        closestIdx = i;
      }
    });

    // Only show 3: active (center) + 1 left + 1 right
    allSlides.forEach((s, i) => {
      s.classList.remove('active', 'adjacent');
      if(i === closestIdx){
        s.classList.add('active');
      } else if(i === closestIdx - 1 || i === closestIdx + 1){
        s.classList.add('adjacent');
      }
      // All others stay hidden via CSS (opacity:0, visibility:hidden)
    });
  }

  // Physics loop — friction 0.96
  function physicsLoop(){
    if(!isDragging){
      position += velocity;
      velocity *= 0.96; // friction: vuốt nhẹ dừng nhanh, vuốt mạnh lướt nhiều
      if(Math.abs(velocity) < 0.2) velocity = 0;
      wrapPosition();
    }
    updateVisuals();
    animId = requestAnimationFrame(physicsLoop);
  }

  // Center initially on middle set
  function calcInitialOffset(){
    return -(getTotalWidth() * (CLONES / 2)) + viewport.offsetWidth / 2 - getSlideWidth() / 2;
  }
  position = calcInitialOffset();
  physicsLoop();

  // Mouse drag
  viewport.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    startPos = position;
    lastX = e.clientX;
    lastTime = Date.now();
    velocity = 0;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if(!isDragging) return;
    const dx = e.clientX - startX;
    position = startPos + dx;
    const now = Date.now();
    const dt = now - lastTime;
    if(dt > 0){
      velocity = (e.clientX - lastX) / dt * 16; // 16ms frame-normalized
    }
    lastX = e.clientX;
    lastTime = now;
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  // Touch swipe
  viewport.addEventListener('touchstart', e => {
    isDragging = true;
    startX = e.touches[0].clientX;
    startPos = position;
    lastX = startX;
    lastTime = Date.now();
    velocity = 0;
  }, {passive:true});
  viewport.addEventListener('touchmove', e => {
    if(!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    position = startPos + dx;
    const now = Date.now();
    const dt = now - lastTime;
    if(dt > 0){
      velocity = (e.touches[0].clientX - lastX) / dt * 16;
    }
    lastX = e.touches[0].clientX;
    lastTime = now;
  }, {passive:true});
  viewport.addEventListener('touchend', () => { isDragging = false; }, {passive:true});

  // Resize reset
  window.addEventListener('resize', () => {
    position = calcInitialOffset();
  }, {passive:true});
})();
