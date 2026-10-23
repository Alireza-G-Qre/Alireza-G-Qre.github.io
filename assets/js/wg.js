// Flatmate profile: DE/EN switch and photo carousel.
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const slides = document.getElementById('slides');
  const imgs = Array.from(slides.querySelectorAll('img'));
  imgs.forEach((img) => { img.dataset.de = img.alt; });
  const dots = document.getElementById('dots');
  const swipe = document.querySelector('.swipe');
  let lang = store.get('wg-lang') === 'en' ? 'en' : 'de';

  imgs.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => go(i));
    dots.appendChild(b);
  });
  const go = (i) => slides.scrollTo({ left: i * slides.clientWidth, behavior: 'smooth' });
  const current = () => Math.round(slides.scrollLeft / Math.max(1, slides.clientWidth));
  function mark() {
    const c = current();
    Array.from(dots.children).forEach((d, i) => {
      d.setAttribute('aria-current', String(i === c));
      d.setAttribute('aria-label', (lang === 'de' ? 'Foto ' : 'Photo ') + (i + 1) + ' / ' + imgs.length);
    });
  }
  slides.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
  document.getElementById('prev').addEventListener('click', () => go(Math.max(0, current() - 1)));
  document.getElementById('next').addEventListener('click', () => go(Math.min(imgs.length - 1, current() + 1)));
  slides.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(imgs.length - 1, current() + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, current() - 1)); }
  });

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('[data-lang-block]').forEach((el) => { el.hidden = el.dataset.langBlock !== l; });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    imgs.forEach((img) => { img.alt = img.dataset[l]; });
    swipe.textContent = swipe.dataset[l];
    document.getElementById('prev').setAttribute('aria-label', l === 'de' ? 'Vorheriges Foto' : 'Previous photo');
    document.getElementById('next').setAttribute('aria-label', l === 'de' ? 'Nächstes Foto' : 'Next photo');
    mark();
    store.set('wg-lang', l);
  }
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  applyLang(lang);
})();
