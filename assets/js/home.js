// Home page behaviour: language switch, Bonn clock, altimeter, ridge animation, gallery, "ask me".
(function () {
  const $ = (s) => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */
  const DE = {
    'skip': 'Zum Inhalt springen',
    'nav.about': 'Über mich', 'nav.exp': 'Erfahrung', 'nav.research': 'Forschung', 'nav.life': 'Freizeit',
    'card.role': 'ML-Engineer · Suche &amp; Empfehlungssysteme<br>Informatik-Master, Uni Bonn',
    'hero.email': 'E-Mail', 'hero.cv': 'Lebenslauf',
    'open.k': 'Offen für', 'open.1': 'Werkstudent', 'open.2': 'HiWi', 'open.3': 'Forschung', 'open.4': 'Praktikum',
    'wg.t': 'Auf Zimmersuche?', 'wg.s': 'Bonn oder Köln · WG-Profil',
    'about.k': 'Über mich', 'about.h': 'Hallo! Ich bringe Maschinen bei, das Richtige zu finden.',
    'about.t': 'Seit 2022 entwickle ich Ranking-, Such- und Empfehlungssysteme, unter anderem bei Snapp, Yektanet und Digikala, und habe drei Paper bei SemEval veröffentlicht. Im Oktober 2026 bin ich für meinen Informatik-Master nach Bonn gezogen.',
    'st.1b': '4 Jahre', 'st.1': 'ML in der Praxis', 'st.2': 'SemEval-Paper', 'st.3': 'Kurse als Tutor', 'st.4b': '5.610 m', 'st.4': 'höchster Gipfel',
    'exp.k': 'Berufserfahrung',
    'exp.1h': 'Data Scientist · Snapp', 'exp.1': 'Retrieval-System, das Antworten auf ca. 3.000 Fahrer-Tickets pro Tag vorschlägt.',
    'exp.2h': 'ML Engineer · Yektanet', 'exp.2': 'Klick- und Konversionsprognosen für ca. 1 Mrd. Werbe-Events pro Tag.',
    'exp.3h': 'Data Scientist · Digikala', 'exp.3': 'Startseiten-Empfehlungen und semantische Suche mit CLIP-artigen Embeddings.',
    'exp.nowk': 'jetzt', 'exp.4h': 'Eigenes Projekt · LLM-Agenten', 'exp.4': 'LangGraph-System, das mit Tools Informationen sammelt, prüft und zusammenführt.',
    'res.k': 'Forschung', 'res.2': 'SemEval 2024 · Erstautor', 'res.more': 'Alle auf Google Scholar ↗',
    'edu.k': 'Studium &amp; Lehre', 'edu.1h': 'M.Sc. Informatik', 'edu.1': 'Universität Bonn · seit 2026',
    'edu.2h': 'B.Sc. Computer Engineering', 'edu.2': 'Sharif University · Abschlussarbeit 19,8/20',
    'edu.ta': 'Tutor für Reinforcement Learning, Medical Image Analysis, Compilerbau, Computersimulation und Lineare Algebra.',
    'life.k': 'Abseits des Schreibtischs', 'life.h': 'Höchster Punkt bisher: <em>5.610 m</em>',
    'life.t': 'Damavand, 2025. Wandern, Bergsteigen und Klettern, ab und zu Canyoning und Snowboarden. Für Touren im Siebengebirge suche ich noch Mitstreiter.',
    'ask.h': 'Frag mich etwas', 'ask.sub': 'Antworten aus meinen eigenen Notizen', 'ask.label': 'Deine Frage',
    'foot.t': 'Gipfel erreicht. Schreib mir!',
    'legal': 'Statisches HTML auf GitHub Pages, keine Cookies, kein Tracking.'
  };
  const EN = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => { EN[el.dataset.i18n] = el.innerHTML; });

  const T = {
    en: {
      placeholder: 'e.g. what did you do at Digikala?', idle: 'Ask about my work, thesis, papers, what I’m open to, or hobbies.',
      none: 'No good match yet. Try another question, or just email me.',
      sugg: ['what did you do at Digikala?', 'what are you building now?', 'open to jobs?', 'hobbies?'],
      more: (n) => 'Show all photos & clips (' + n + ' more) ↓', less: 'Show fewer ↑', locale: 'en-GB', local: 'local time'
    },
    de: {
      placeholder: 'z. B. was hast du bei Digikala gemacht?', idle: 'Frag nach meiner Arbeit, Abschlussarbeit, Papern, Jobwünschen oder Hobbys.',
      none: 'Noch keine passende Antwort. Versuch eine andere Frage oder schreib mir einfach.',
      sugg: ['was hast du bei Digikala gemacht?', 'woran arbeitest du gerade?', 'offen für Jobs?', 'Hobbys?'],
      more: (n) => 'Alle Fotos &amp; Clips zeigen (' + n + ' weitere) ↓', less: 'Weniger zeigen ↑', locale: 'de-DE', local: 'Ortszeit'
    }
  };
  let lang = store.get('lang') === 'de' ? 'de' : 'en';

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = (l === 'de' ? DE : EN)[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    $('#q').placeholder = T[l].placeholder;
    renderSugg(); answer(); tick(); renderGallery(); setToggle();
    store.set('lang', l);
  }
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- clock on the profile card ---------- */
  function tick() {
    try {
      const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
      $('#clock').textContent = 'Bonn · ' + t + ' ' + T[lang].local;
    } catch (e) {}
  }
  setInterval(tick, 15000);

  /* ---------- altimeter ---------- */
  const altEl = $('#alt');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const el = document.scrollingElement || document.documentElement;
      const f = Math.min(1, Math.max(0, window.scrollY / Math.max(1, el.scrollHeight - innerHeight)));
      altEl.textContent = (Math.round(f * 561) * 10).toLocaleString(lang === 'de' ? 'de-DE' : 'en-US');
      ticking = false;
    });
  }, { passive: true });

  /* ---------- draw the ridge when visible ---------- */
  const life = $('#life');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { life.classList.add('in-view'); o.disconnect(); } }), { threshold: 0.3 }).observe(life);
  } else life.classList.add('in-view');

  /* ---------- gallery: 4 shown, rest on demand ---------- */
  const SHOWN = [
    ['hiker-ridge', 'A hiker silhouetted against the sun on a grassy ridge', 'The last metres before the top.', 'Die letzten Meter vor dem Gipfel.', '50% 50%'],
    ['canyoning', 'Alireza canyoning in a turquoise canyon, orange helmet', 'Canyoning: hiking, but wetter.', 'Canyoning: Wandern, nur nasser.', '50% 40%'],
    ['tent-moon', 'Full moon over the clouds, seen from a tent', 'A night above the clouds.', 'Eine Nacht über den Wolken.', '50% 50%'],
    ['snowboard', 'Alireza leaning on his snowboard in the snow', 'Snowboarding. Mostly upright.', 'Snowboarden. Meistens aufrecht.', '40% 50%']
  ];
  const MORE = [
    ['peak-2502', 'Alireza next to a summit sign on a rocky peak', 'Another peak, another sign.', 'Noch ein Gipfel, noch ein Schild.', '50% 35%'],
    ['v:clip4', 'Waterfall running down a rock face', 'Waterfalls are better in motion.', 'Wasserfälle sind bewegt schöner.'],
    ['damavand-sunset-tall', 'Damavand at sunset', 'Damavand at sunset.', 'Der Damavand im Sonnenuntergang.', '30% 70%'],
    ['v:clip6', 'Fog rolling over a green meadow', 'Fog rolling in over the meadow.', 'Nebel zieht über die Wiese.'],
    ['campfire-dance', 'People dancing around a campfire at night, black and white', 'Dancing around the fire at camp.', 'Tanzen ums Feuer im Camp.', '50% 55%'],
    ['milky-way', 'The Milky Way in a dark sky', 'Up high, the stars come out.', 'Weiter oben kommen die Sterne raus.', '50% 50%'],
    ['v:clip5', 'Looking up into a misty forest', 'Fog days in the forest are the best days.', 'Nebeltage im Wald sind die besten Tage.'],
    ['tbilisi-bridge', 'The glass Bridge of Peace in Tbilisi', 'Tbilisi, Bridge of Peace.', 'Tiflis, Friedensbrücke.', '50% 50%'],
    ['sea-sunset', 'Sunset over the sea with mountains behind', 'Sea, mountains, sunset.', 'Meer, Berge, Sonnenuntergang.', '60% 50%'],
    ['blue-mosque', 'The Blue Mosque in Istanbul lit up at night', 'Istanbul at night.', 'Istanbul bei Nacht.', '50% 40%'],
    ['cat-poster', 'Poster of a cat: you work, I watch and judge', 'My desk supervisor at Snapp.', 'Mein Schreibtisch-Aufseher bei Snapp.', '50% 50%'],
    ['toast', 'A smiling toast plush on a desk', 'Snapp office mascot. Never burnt.', 'Büro-Maskottchen bei Snapp. Nie verbrannt.', '50% 55%'],
    ['spongebob', 'A SpongeBob-shaped playground slide', 'Questionable playground design.', 'Fragwürdiges Spielplatzdesign.', '50% 40%']
  ];
  const io = (!reduce && 'IntersectionObserver' in window) ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: 0.5 }) : null;
  function fill(box, items) {
    box.innerHTML = '';
    items.forEach(([f, alt, en, de, pos]) => {
      const fig = document.createElement('figure');
      if (f.startsWith('v:')) {
        fig.innerHTML = '<div class="frame"><video muted loop playsinline preload="none"></video><span class="clip-tag" aria-hidden="true">● clip</span></div><figcaption></figcaption>';
        const v = fig.querySelector('video');
        v.src = 'assets/video/' + f.slice(2) + '.mp4#t=0.5'; v.setAttribute('aria-label', alt);
        if (io) io.observe(v);
      } else {
        fig.innerHTML = '<div class="frame"><img loading="lazy" alt=""></div><figcaption></figcaption>';
        const img = fig.querySelector('img');
        img.src = 'assets/img/' + f + '-sm.jpg'; img.alt = alt; img.style.objectPosition = pos;
      }
      fig.querySelector('figcaption').textContent = lang === 'de' ? de : en;
      box.appendChild(fig);
    });
  }
  const more = $('#galleryMore'), btn = $('#galleryBtn');
  function renderGallery() {
    if (io) io.disconnect();
    fill($('#gallery'), SHOWN);
    if (!more.hidden) fill(more, MORE);
  }
  function setToggle() { btn.innerHTML = more.hidden ? T[lang].more(MORE.length) : T[lang].less; btn.setAttribute('aria-expanded', String(!more.hidden)); }
  btn.addEventListener('click', () => {
    more.hidden = !more.hidden;
    if (!more.hidden) fill(more, MORE); else { if (io) io.disconnect(); more.innerHTML = ''; life.scrollIntoView({ block: 'nearest' }); }
    setToggle();
  });

  /* ---------- ask me (keyword retrieval over a small Q&A set) ---------- */
  const QA = [
    { k: 'digikala recommendation recs search ecommerce products empfehlung suche produkte', en: 'At Digikala I built personalised homepage recommendations and semantic product search over 10M+ products, using CLIP-style embeddings and offline contextual bandits.', de: 'Bei Digikala habe ich personalisierte Empfehlungen für die Startseite und eine semantische Produktsuche über 10 Mio.+ Produkte gebaut, mit CLIP-artigen Embeddings und Offline-Contextual-Bandits.' },
    { k: 'yektanet ads ctr click conversion prediction werbung klick', en: 'At Yektanet I trained click and conversion prediction models on about a billion ad events a day: +6% CTR and +8% conversions.', de: 'Bei Yektanet habe ich Klick- und Konversionsmodelle auf rund einer Milliarde Werbeereignissen pro Tag trainiert: +6 % CTR, +8 % Konversionen.' },
    { k: 'snapp support rag retrieval llm tickets driver fahrer', en: 'At Snapp I built a retrieval system that suggests answers to ~3,000 driver tickets a day. Driver satisfaction rose from 20% to 28%.', de: 'Bei Snapp habe ich ein Retrieval-System gebaut, das Antworten auf ca. 3.000 Fahrer-Tickets pro Tag vorschlägt. Die Zufriedenheit stieg von 20 % auf 28 %.' },
    { k: 'thesis bachelor sharif generative recommender abschlussarbeit bachelorarbeit', en: 'My B.Sc. thesis at Sharif (19.8/20): a decoder-based generative recommender raised Precision@1 from 0.12 to 0.37 over ALS.', de: 'Meine Bachelorarbeit an der Sharif (19,8/20): Ein decoderbasiertes generatives Empfehlungsmodell steigerte Precision@1 gegenüber ALS von 0,12 auf 0,37.' },
    { k: 'papers paper research publications semeval forschung veröffentlichungen', en: 'Three SemEval papers in the ACL Anthology: crosslingual fact-check retrieval (2025) and two emotion-analysis systems (2024, one as first author).', de: 'Drei SemEval-Paper in der ACL Anthology: sprachübergreifendes Retrieval geprüfter Behauptungen (2025) und zwei Systeme zur Emotionsanalyse (2024, eines als Erstautor).' },
    { k: 'bonn master msc study courses why studium', en: 'I’m doing my MSc in Computer Science at the University of Bonn, since winter semester 2026/27.', de: 'Ich mache meinen Master in Informatik an der Uni Bonn, seit dem Wintersemester 2026/27.' },
    { k: 'hobbies hobbys hiking mountains mountaineering climbing canyoning rafting snowboard snowboarding sport free time wandern berge klettern freizeit', en: 'Hiking, mountaineering and climbing (Damavand, 5,610 m, in 2025), plus canyoning, rafting and snowboarding when I can. Indoors: board games and horror films.', de: 'Wandern, Bergsteigen und Klettern (Damavand, 5.610 m, 2025), dazu Canyoning, Rafting und Snowboarden. Drinnen: Brettspiele und Horrorfilme.' },
    { k: 'project now building currently working llm agent langgraph projekt gerade arbeitest jetzt baust', en: 'Right now I’m building LLM agents with LangGraph that collect information with tools, then check and combine it step by step.', de: 'Gerade baue ich LLM-Agenten mit LangGraph, die mit Tools Informationen sammeln und sie Schritt für Schritt prüfen und zusammenführen.' },
    { k: 'job jobs work werkstudent hiwi internship praktikum available open hire offen', en: 'I’m open to working-student and HiWi positions, research collaborations and internships in ML, search and recommender systems.', de: 'Ich bin offen für Werkstudenten- und HiWi-Stellen, Forschungskooperationen und Praktika in ML, Suche und Empfehlungssystemen.' },
    { k: 'contact email reach kontakt', en: 'Email alireza.g.qre@gmail.com or message me on LinkedIn.', de: 'Schreib an alireza.g.qre@gmail.com oder über LinkedIn.' }
  ];
  const qEl = $('#q'), ansEl = $('#answer'), suggEl = $('#sugg');
  function answer() {
    const q = qEl.value.toLowerCase().trim();
    if (!q) { ansEl.textContent = T[lang].idle; return; }
    let best = null, bs = 0;
    QA.forEach((x) => {
      let s = 0;
      q.split(/[^a-z0-9äöüß]+/).filter((w) => w.length > 2).forEach((w) => { if (x.k.indexOf(w) >= 0) s++; });
      if (s > bs) { bs = s; best = x; }
    });
    ansEl.textContent = best ? best[lang] : T[lang].none;
  }
  function renderSugg() {
    suggEl.innerHTML = '';
    T[lang].sugg.forEach((s) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = s;
      b.addEventListener('click', () => { qEl.value = s; answer(); });
      suggEl.appendChild(b);
    });
  }
  qEl.addEventListener('input', answer);

  applyLang(lang);
})();
