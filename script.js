/* =========================================================
   J CRUZ STUDIO · scroll & motion
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');

  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Fade/slide sections in as they enter the screen ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Mission statement: words light up as you scroll ---------- */
  const statement = document.querySelector('[data-words]');
  let words = [];
  if (statement) {
    const text = statement.textContent.trim().replace(/\s+/g, ' ');
    statement.innerHTML = text.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
    words = [...statement.querySelectorAll('.w')];
    if (reduceMotion) words.forEach((w) => w.classList.add('on'));
  }

  /* ---------- Scroll-driven motion ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-speed]')];  // move vertically with scroll
  const driftEls    = [...document.querySelectorAll('[data-drift]')];  // move sideways with scroll
  const blobs       = [...document.querySelectorAll('[data-wander]')]; // background paint wanders

  let ticking = false;

  // Remember where each parallax item sits on the page (without any movement applied),
  // so items far down the page only move a little around their own spot.
  function measure() {
    parallaxEls.forEach((el) => {
      el.style.translate = '';
      const r = el.getBoundingClientRect();
      el._center = r.top + window.scrollY + r.height / 2;
      el._inHero = !!el.closest('.hero');
    });
  }

  function update() {
    const y = window.scrollY;
    const vh = window.innerHeight;

    nav.classList.toggle('scrolled', y > 40);

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.speed);
        const dist = el._inHero ? y : y + vh / 2 - el._center;
        el.style.translate = `0 ${dist * speed}px`;
      });

      driftEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        const offset = r.top + r.height / 2 - vh / 2;
        el.style.translate = `${offset * parseFloat(el.dataset.drift)}px 0`;
      });

      blobs.forEach((el) => {
        const seed = parseFloat(el.dataset.wander);
        const x = Math.sin(y / 900 + seed) * 90;
        const yy = Math.cos(y / 700 + seed) * 110;
        el.style.translate = `${x}px ${yy}px`;
      });

      if (words.length) {
        const r = statement.getBoundingClientRect();
        const progress = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
        const lit = Math.round(Math.min(Math.max(progress, 0), 1) * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < lit));
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); });
  window.addEventListener('load', () => { measure(); update(); });
  measure();
  update();

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();