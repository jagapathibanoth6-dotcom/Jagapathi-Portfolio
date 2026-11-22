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

  /* Count-up on achievements */
  const runCount = el => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 1100, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
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
