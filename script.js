{
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  $('#year').textContent = new Date().getFullYear();

  /* Section highlight in top bar */
  const navLinks = $$('#tbNav a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean).forEach(s => spy.observe(s));
  }


  /* Hero: rotating role, grid spotlight, console tilt */
  const rws = $$('.rw');
  if (rws.length && !reduced) {
    let ri = 0;
    setInterval(() => {
      const cur = rws[ri]; cur.classList.remove('on'); cur.classList.add('out');
      setTimeout(() => cur.classList.remove('out'), 600);
      ri = (ri + 1) % rws.length; rws[ri].classList.add('on');
    }, 2600);
  }
  const heroEl = $('.hero'), grid = $('#hxGrid'), consoleEl = $('#console');
  if (heroEl && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    heroEl.addEventListener('pointermove', e => {
      const r = heroEl.getBoundingClientRect();
      grid.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      grid.style.setProperty('--my', (e.clientY - r.top) + 'px');
      const c = consoleEl.getBoundingClientRect();
      const px = (e.clientX - (c.left + c.width / 2)) / r.width, py = (e.clientY - (c.top + c.height / 2)) / r.height;
      consoleEl.style.transform = `perspective(1200px) rotateY(${(px * 8).toFixed(2)}deg) rotateX(${(-py * 8).toFixed(2)}deg)`;
    });
    heroEl.addEventListener('pointerleave', () => { consoleEl.style.transform = ''; });
  }


  /* Site-wide connected dots that link to the cursor */
  const net = document.getElementById('net');
  if (net && !reduced) {
    const ctx = net.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, pts = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let col = [74, 222, 155], target = [74, 222, 155];
    const resize = () => {
      W = innerWidth; H = innerHeight;
      net.width = W * dpr; net.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.max(28, Math.min(95, (W * H) / 15000)));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.5 + .7 }));
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });
    window.addEventListener('pointerdown', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.active = false; });
    // follow the accent colour of the section in view
    const secs = $$('.sec');
    const pickColour = () => {
      const mid = innerHeight / 2; let found = null;
      for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) { found = s; break; } }
      const v = found ? getComputedStyle(found).getPropertyValue('--sa').trim() : '';
      target = v ? v.split(',').map(Number) : [74, 222, 155];
    };
    window.addEventListener('scroll', pickColour, { passive: true }); pickColour();
    const LINK = 125, MLINK = 190;
    const frame = () => {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      col = col.map((c, i) => c + (target[i] - c) * .05);
      const c = col.map(Math.round).join(',');
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
          if (d < MLINK && d > 30) { p.vx += dx / d * .012; p.vy += dy / d * .012; }
        }
        p.vx = Math.max(-.6, Math.min(.6, p.vx * .99 + (Math.random() - .5) * .015));
        p.vy = Math.max(-.6, Math.min(.6, p.vy * .99 + (Math.random() - .5) * .015));
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; } if (p.x > W) { p.x = W; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; } if (p.y > H) { p.y = H; p.vy *= -1; }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let k = i + 1; k < pts.length; k++) {
          const b = pts[k], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) { ctx.strokeStyle = `rgba(${c},${(1 - d / LINK) * .18})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        if (mouse.active) {
          const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (md < MLINK) { ctx.strokeStyle = `rgba(${c},${(1 - md / MLINK) * .5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        }
        ctx.fillStyle = `rgba(${c},.75)`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (mouse.active) { ctx.fillStyle = `rgba(${c},.9)`; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 2.4, 0, Math.PI * 2); ctx.fill(); }
    };
    requestAnimationFrame(frame);
  }

  /* Reading progress */
  const progress = $('#progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();

  /* Gentle reveal (content is always in the HTML for scanners) */
  if (!reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const rev = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
    }), { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; rev.observe(el); });
    setTimeout(() => $$('.reveal').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }), 4000);
    window.addEventListener('beforeprint', () => $$('.reveal').forEach(el => el.classList.add('in')));
  }


  /* Per-section animations: each card type gets its own entrance */
  if (!reduced && 'IntersectionObserver' in window) {
    const plan = [
      ['.kpi', 'pop'], ['.job', 'slide-left'], ['.proj', 'flip'], ['.skill', 'zoom'],
      ['.techskills', 'slide-right'], ['.lp', 'rise'], ['.edu', 'blur'], ['.target', 'rise'],
      ['.sub-title', 'slide-right'], ['.form', 'rise'], ['.c-list', 'slide-left'], ['.factbar li', 'rise']
    ];
    const animEls = [];
    plan.forEach(([sel, kind]) => $$(sel).forEach((el, i) => {
      el.classList.remove('reveal');
      el.dataset.anim = kind;
      const sibs = [...el.parentElement.children].filter(c => c.matches(sel));
      el.style.setProperty('--d', (sibs.indexOf(el) % 4) * 110 + 'ms');
      animEls.push(el);
    }));
    $$('.certs li').forEach((el, i) => { el.classList.remove('reveal'); el.dataset.anim = i % 2 ? 'alt-r' : 'alt-l'; el.style.setProperty('--d', (i % 4) * 90 + 'ms'); animEls.push(el); });
    // stagger children
    $$('[data-anim]').forEach(el => {
      $$('ul > li, .techskills dl > div, .tags span', el).forEach((c, i) => { c.classList.add('stg'); c.style.setProperty('--i', Math.min(i, 12)); });
    });
    $$('.sec-title').forEach(t => animEls.push(t));
    const animObs = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { const t = e.target; t.classList.add('in'); animObs.unobserve(t); setTimeout(() => t.classList.add('done'), 1600); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(el => animObs.observe(el));
    // No blanket timeout: each card animates only when scrolled into view (IntersectionObserver).
    window.addEventListener('beforeprint', () => animEls.forEach(el => el.classList.add('in')));
  }

  /* Mouse-follow glare on cards */
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.kpi,.job,.proj,.skill,.edu,.techskills,.lp,.form,.certs li').forEach(card => {
      card.classList.add('glare');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Count-up on achievements */
  const runCount = el => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 1100, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-GB') + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!reduced && 'IntersectionObserver' in window) {
    const cnt = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { runCount(e.target); cnt.unobserve(e.target); }
    }), { threshold: .6 });
    $$('[data-count]').forEach(c => cnt.observe(c));
  }

  /* Contact form: opens the visitor's own email app, addressed to jagapathibanoth6@gmail.com */
  const TO = 'jagapathibanoth6@gmail.com';
  const form = $('#contactForm'), fb = $('.form-feedback', form);
  const show = (t, m) => { fb.className = 'form-feedback ' + t; fb.textContent = m; };
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const miss = ['name', 'email', 'message'].filter(k => !String(d[k] || '').trim());
    if (miss.length) return show('err', 'Please fill in: ' + miss.join(', ') + '.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return show('err', 'Please enter a valid email address.');
    const subject = String(d.subject || '').trim() ? 'Opportunity: ' + d.subject.trim() : 'Opportunity for Jagapathi Nayak Banoth';
    const body = `${d.message.trim()}\n\n—\n${d.name.trim()}\n${d.email.trim()}`;
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    show('ok', 'Your email app should now be open with the message ready. If nothing opened, email ' + TO + ' directly.');
  });
}
