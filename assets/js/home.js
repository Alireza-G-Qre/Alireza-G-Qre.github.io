// Home page behaviour: language switch, Bonn clock, hat rotation, altimeter, photo strip, "ask me".
(function () {
  const $ = (s) => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- language ---------- */
  const DE = {
    'skip': 'Zum Inhalt springen',
    'nav.work': 'Arbeit', 'nav.research': 'Forschung', 'nav.life': 'Leben', 'nav.wg': 'WG-Profil',
    'hero.kicker': 'Hallo, ich bin Alireza Ghahramani Koureh',
    'hero.title': 'ML-Engineer für Suche &amp; Empfehlungen.',
    'hero.text': 'Masterstudent der Informatik an der Universität Bonn. Seit 2022 habe ich Ranking-, Such- und Retrieval-Systeme bei <strong>Snapp</strong>, <strong>Yektanet</strong> und <strong>Digikala</strong> gebaut und 3 Paper bei SemEval veröffentlicht.',
    'hero.email': 'E-Mail schreiben', 'hero.cv': 'Lebenslauf (PDF) ↓',
    'chip.tbilisi': 'Tiflis · jetzt in Bonn', 'chip.office': 'in Gedanken', 'chip.summit': 'Damavand · 2025',
    'open.k': 'Offen für', 'open.1': 'Werkstudententätigkeit', 'open.2': 'HiWi-Stellen an der Uni', 'open.3': 'Forschungskooperationen', 'open.4': 'Praktika',
    'open.in': 'in ML, Suche &amp; Empfehlungssystemen',
    'clock.k': 'Meine Uhrzeit · Bonn',
    'work.h': 'Ausgewählte Arbeit',
    'work.1': '<strong>Snapp</strong> · Fahrerzufriedenheit, nachdem ich retrievalbasierte Antwortvorschläge gebaut habe (~3.000 Tickets pro Tag)',
    'work.2': '<strong>Yektanet</strong> · Klick- &amp; Konversionsmodelle auf ~1 Milliarde Werbeereignissen pro Tag',
    'work.3': '<strong>Digikala</strong> · Produkte in meiner semantischen Suche und den Empfehlungen der Startseite',
    'work.nowk': 'Jetzt', 'work.4': '<strong>Eigenes Projekt</strong> · LLM-Agenten mit LangGraph, die mit Tools Informationen sammeln, prüfen und zusammenführen',
    'papers.k': 'Paper · SemEval', 'papers.1': 'sprachübergreifendes Fact-Check-Retrieval · 2025', 'papers.2': 'Emotion–Ursache-Paare · 2024 · Erstautor', 'papers.3': 'Emotionserkennung in Code-Mixing · 2024', 'papers.more': 'Alle auf Google Scholar ↗',
    'ask.h': 'Frag mich etwas', 'ask.sub': 'einfaches Retrieval über meine Antworten, läuft in deinem Browser', 'ask.label': 'Deine Frage',
    'teach.k': 'Kurse als Tutor', 'teach.3': 'Compilerbau', 'teach.4': 'Computersimulation', 'teach.5': 'Lineare Algebra &amp; Programmierung',
    'mount.k': 'Abseits der Tastatur', 'mount.h': 'Höchster Punkt bisher:<br><em>5.610 m</em>',
    'mount.t': 'Der Damavand 2025, der höchste Vulkan Asiens. Beim Wandern, Bergsteigen und Klettern tanke ich auf, dazu ab und zu Canyoning, Rafting und Snowboarden. Ich suche Leute für Touren im Siebengebirge und in der Eifel.',
    'roll.h': 'Leben in Bildern &amp; Clips', 'hats': 'Hut-Rotation',
    'door.k': 'ÜBER WG-GESUCHT HIER?', 'door.t': 'Ich suche ein Zimmer in Bonn. Hier ist mein WG-Profil →', 'door.s': 'Auf Deutsch &amp; English · Fotos, Alltag, wie ich wohne',
    'foot.t': 'Gipfel erreicht. Sag hallo.',
    'legal': 'Einfaches HTML auf GitHub Pages, keine Cookies, kein Tracking.'
  };
  const EN = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => { EN[el.dataset.i18n] = el.innerHTML; });

  const T = {
    en: {
      placeholder: 'e.g. what did you do at Digikala?', idle: 'Ask about my work, thesis, papers, what I’m open to, or hobbies.',
      none: 'No good match yet. Try another question, or just email me.',
      sugg: ['what did you do at Digikala?', 'what are you building now?', 'open to jobs?', 'hobbies?'], dayIn: ' in Bonn', locale: 'en-GB'
    },
    de: {
      placeholder: 'z. B. was hast du bei Digikala gemacht?', idle: 'Frag nach meiner Arbeit, Abschlussarbeit, Papern, Jobwünschen oder Hobbys.',
      none: 'Noch keine passende Antwort. Versuch eine andere Frage oder schreib mir einfach.',
      sugg: ['was hast du bei Digikala gemacht?', 'woran arbeitest du gerade?', 'offen für Jobs?', 'Hobbys?'], dayIn: ' in Bonn', locale: 'de-DE'
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
    renderSugg(); answer(); tick(); renderRoll();
    store.set('lang', l);
  }
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- clock ---------- */
  function tick() {
    const now = new Date();
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
      $('#hh').textContent = parts.find((p) => p.type === 'hour').value;
      $('#mm').textContent = parts.find((p) => p.type === 'minute').value;
      $('#day').textContent = new Intl.DateTimeFormat(T[lang].locale, { timeZone: 'Europe/Berlin', weekday: 'long' }).format(now) + T[lang].dayIn;
    } catch (e) {}
  }
  setInterval(tick, 15000);

  /* ---------- hats ---------- */
  const hats = document.querySelectorAll('.hats img');
  let hat = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) setInterval(() => {
    hats[hat].classList.remove('on'); hat = (hat + 1) % hats.length; hats[hat].classList.add('on');
    $('#hatN').textContent = hat + 1;
  }, 2600);

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
  const band = $('.band');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { band.classList.add('in-view'); o.disconnect(); } }), { threshold: 0.35 }).observe(band);
  } else band.classList.add('in-view');

  /* ---------- photo strip ---------- */
  const ROLL = [
    ['hiker-ridge', 'A hiker silhouetted against the sun on a grassy ridge', 'The last metres before the top.', 'Die letzten Meter vor dem Gipfel.', '50% 50%'],
    ['canyoning', 'Alireza canyoning in a turquoise canyon, orange helmet', 'Canyoning: like hiking, but wetter.', 'Canyoning: wie Wandern, nur nasser.', '50% 40%'],
    ['v:clip4', 'Waterfall running down a rock face', 'Waterfalls are better in motion.', 'Wasserfälle sind bewegt schöner.'],
    ['tent-moon', 'Full moon over the clouds, seen from a tent', 'A night on the mountain, moon above the clouds.', 'Eine Nacht am Berg, der Mond über den Wolken.', '50% 50%'],
    ['snowboard', 'Alireza leaning on his snowboard in the snow', 'Snowboarding. Mostly upright.', 'Snowboarden. Meistens aufrecht.', '40% 50%'],
    ['v:clip6', 'Fog rolling over a green meadow', 'Fog rolling in over the meadow.', 'Nebel zieht über die Wiese.'],
    ['damavand-sunset-tall', 'Damavand at sunset', 'Damavand at sunset, from the forest below.', 'Der Damavand im Sonnenuntergang, vom Wald aus.', '30% 70%'],
    ['campfire-dance', 'People dancing around a campfire at night, black and white', 'Dancing around the fire at camp.', 'Tanzen ums Feuer im Camp.', '50% 55%'],
    ['coffee-bell', 'A desk bell labelled Ring for a coffee', 'Snapp desk essentials, part 1.', 'Snapp-Schreibtisch, Teil 1.', '50% 50%'],
    ['cat-poster', 'Poster of a cat: you work, I watch and judge', 'Part 2: my desk supervisor.', 'Teil 2: mein Schreibtisch-Aufseher.', '50% 50%'],
    ['toast', 'A smiling toast plush on a desk', 'Part 3: office mascot. Never burnt.', 'Teil 3: Büro-Maskottchen. Nie verbrannt.', '50% 55%'],
    ['tbilisi-bridge', 'The glass Bridge of Peace in Tbilisi', 'Tbilisi, Bridge of Peace.', 'Tiflis, Friedensbrücke.', '50% 50%'],
    ['v:clip5', 'Looking up into a misty forest', 'Fog days in the forest are the best days.', 'Nebeltage im Wald sind die besten Tage.'],
    ['sea-sunset', 'Sunset over the sea with mountains behind', 'Sea, mountains, sunset. Hard to beat.', 'Meer, Berge, Sonnenuntergang. Schwer zu toppen.', '60% 50%'],
    ['blue-mosque', 'The Blue Mosque in Istanbul lit up at night', 'Istanbul at night.', 'Istanbul bei Nacht.', '50% 40%'],
    ['spongebob', 'A SpongeBob-shaped playground slide', 'Questionable playground design.', 'Fragwürdiges Spielplatzdesign.', '50% 40%'],
    ['milky-way', 'The Milky Way in a dark sky', 'Up high, the stars come out.', 'Weiter oben kommen die Sterne raus.', '50% 50%'],
    ['plane-wing', 'Aeroplane wing above the clouds', 'Next stop: Bonn.', 'Nächster Halt: Bonn.', '50% 50%']
  ];
  const roll = $('#roll');
  // clips play only while visible (saves data, battery); never autoplay with reduced motion
  const io = (!reduce && 'IntersectionObserver' in window) ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: 0.5 }) : null;
  function renderRoll() {
    if (io) io.disconnect();
    roll.innerHTML = '';
    ROLL.forEach(([f, alt, en, de, pos]) => {
      const fig = document.createElement('figure');
      if (f.startsWith('v:')) {
        fig.innerHTML = '<div class="frame clip"><video muted loop playsinline preload="metadata"></video><span class="clip-tag" aria-hidden="true">● clip</span></div><figcaption></figcaption>';
        const v = fig.querySelector('video');
        v.src = 'assets/video/' + f.slice(2) + '.mp4#t=0.5'; v.setAttribute('aria-label', alt);
        if (io) io.observe(v);
      } else {
        fig.innerHTML = '<div class="frame"><img loading="lazy" alt=""></div><figcaption></figcaption>';
        const img = fig.querySelector('img');
        img.src = 'assets/img/' + f + '-sm.jpg'; img.alt = alt; img.style.objectPosition = pos;
      }
      fig.querySelector('figcaption').textContent = lang === 'de' ? de : en;
      roll.appendChild(fig);
    });
  }
  const step = () => Math.max(240, roll.clientWidth * 0.8);
  $('#rollPrev').addEventListener('click', () => roll.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#rollNext').addEventListener('click', () => roll.scrollBy({ left: step(), behavior: 'smooth' }));

  /* ---------- ask me (keyword retrieval over a small Q&A set) ---------- */
  const QA = [
    { k: 'digikala recommendation recs search ecommerce products empfehlung suche produkte', en: 'At Digikala I built personalised homepage recommendations and semantic product search over 10M+ products, using CLIP-style embeddings and offline contextual bandits.', de: 'Bei Digikala habe ich personalisierte Empfehlungen für die Startseite und eine semantische Produktsuche über 10 Mio.+ Produkte gebaut, mit CLIP-artigen Embeddings und Offline-Contextual-Bandits.' },
    { k: 'yektanet ads ctr click conversion prediction werbung klick', en: 'At Yektanet I trained click and conversion prediction models on about a billion ad events a day: +6% CTR and +8% conversions.', de: 'Bei Yektanet habe ich Klick- und Konversionsmodelle auf rund einer Milliarde Werbeereignissen pro Tag trainiert: +6 % CTR, +8 % Konversionen.' },
    { k: 'snapp support rag retrieval llm tickets driver fahrer', en: 'At Snapp I built a retrieval system that suggests answers to ~3,000 driver tickets a day. Driver satisfaction rose from 20% to 28%.', de: 'Bei Snapp habe ich ein Retrieval-System gebaut, das Antworten auf ~3.000 Fahrer-Tickets pro Tag vorschlägt. Die Zufriedenheit stieg von 20 % auf 28 %.' },
    { k: 'thesis bachelor sharif generative recommender abschlussarbeit bachelorarbeit', en: 'My B.Sc. thesis at Sharif (19.8/20): a decoder-based generative recommender raised Precision@1 from 0.12 to 0.37 over ALS.', de: 'Meine Bachelorarbeit an der Sharif (19,8/20): Ein decoderbasiertes generatives Empfehlungsmodell steigerte Precision@1 gegenüber ALS von 0,12 auf 0,37.' },
    { k: 'papers paper research publications semeval forschung veröffentlichungen', en: 'Three SemEval papers in the ACL Anthology: crosslingual fact-check retrieval (2025) and two emotion-analysis systems (2024, one as first author).', de: 'Drei SemEval-Paper in der ACL Anthology: sprachübergreifendes Retrieval geprüfter Behauptungen (2025) und zwei Systeme zur Emotionsanalyse (2024, eines als Erstautor).' },
    { k: 'bonn master msc study courses why studium', en: 'I’m doing my MSc in Computer Science at the University of Bonn, starting winter semester 2026/27.', de: 'Ich mache meinen Master in Informatik an der Uni Bonn, seit dem Wintersemester 2026/27.' },
    { k: 'hobbies hobbys hiking mountains mountaineering climbing canyoning rafting snowboard snowboarding sport free time wandern berge klettern freizeit', en: 'Hiking, mountaineering and climbing (Damavand, 5,610 m, in 2025), plus canyoning, rafting and snowboarding when I can. Indoors: board games and horror films.', de: 'Wandern, Bergsteigen und Klettern (Damavand, 5.610 m, 2025), dazu Canyoning, Rafting und Snowboarden. Drinnen: Brettspiele und Horrorfilme.' },
    { k: 'project now building currently working llm agent langgraph projekt gerade arbeitest jetzt baust', en: 'Right now I\u2019m building LLM agents with LangGraph that collect information with tools, then check and combine it step by step.', de: 'Gerade baue ich LLM-Agenten mit LangGraph, die mit Tools Informationen sammeln und sie Schritt für Schritt prüfen und zusammenführen.' },
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
