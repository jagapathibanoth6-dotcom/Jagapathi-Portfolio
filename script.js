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
    setTimeout(() => $$('.reveal').forEach(el => el.classList.add('in')), 4000);
    window.addEventListener('beforeprint', () => $$('.reveal').forEach(el => el.classList.add('in')));
  }


  /* Per-section animations: each card type gets its own entrance */
  if (!reduced && 'IntersectionObserver' in window) {
    const plan = [
      ['.kpi', 'pop'], ['.job', 'slide-left'], ['.proj', 'flip'], ['.skill', 'zoom'],
      ['.techskills', 'slide-right'], ['.lp', 'rise'], ['.edu', 'blur'], ['.target', 'rise'],
      ['.sub-title', 'curtain'], ['.form', 'rise'], ['.c-list', 'slide-left'], ['.profile', 'blur']
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
    setTimeout(() => animEls.forEach(el => { el.classList.add('in'); setTimeout(() => el.classList.add('done'), 1600); }), 6000);
    window.addEventListener('beforeprint', () => animEls.forEach(el => el.classList.add('in')));
  }

  /* Mouse-follow glare on cards */
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.kpi,.job,.proj,.skill,.edu,.techskills,.lp,.form,.profile,.certs li').forEach(card => {
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
