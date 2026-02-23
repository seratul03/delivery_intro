    window.addEventListener('load', function () {
      /* ── Fallback if GSAP didn't load ──────────────────── */
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        ['#hero-eyebrow', '#hero-title', '#hero-subtitle', '#hero-cta', '#hero-food',
          '#cl-0', '#cl-1', '#cl-2', '#bridge-text', '#bridge-sub',
          '#feast-eyebrow', '#feast-headline', '#fi-0', '#fi-1', '#fi-2', '#fi-3', '#fi-4',
          '#stats-headline', '#si-0', '#si-1', '#si-2', '#si-3',
          '#hiw-title', '#hiw-0', '#hiw-1', '#hiw-2',
          '#fresh-title', '#fresh-desc', '#fresh-pills', '#fresh-img',
          '#proof-quote', '#proof-attr',
          '#cta-headline', '#cta-sub', '#final-btn'].forEach(s => {
            const el = document.querySelector(s);
            if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
          });
        document.querySelectorAll('.feast-item').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        document.getElementById('navbar').classList.add('visible');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      const ease = 'power3.out';
      const easeSmooth = 'power2.inOut';

      /* ── NAVBAR ─────────────────────────────────────────── */
      const navbar = document.getElementById('navbar');
      gsap.to(navbar, { opacity: 1, y: 0, duration: 0.9, delay: 0.15, ease });
      navbar.classList.add('visible');
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }, { passive: true });

      /* ── HERO ───────────────────────────────────────────── */
      gsap.timeline({ defaults: { ease, duration: 1 } })
        .to('#hero-eyebrow', { opacity: 1, duration: 0.7 }, 0.1)
        .to('#hero-title', { opacity: 1, y: 0, duration: 1.1 }, 0.3)
        .to('#hero-subtitle', { opacity: 1, y: 0, duration: 0.9 }, 0.6)
        .to('#hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 0.8)
        .to('#hero-food', { opacity: 1, y: 0, scale: 1, duration: 1.0 }, 0.65);

      /* ── SECTION 2: CRAVING ─────────────────────────────── */
      ScrollTrigger.create({
        trigger: '#craving',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        onUpdate: self => {
          const p = self.progress;

          /* Burger parallax + scale */
          gsap.set('#craving-food', {
            y: -p * 120,
            scale: 0.88 + p * 0.2,
            transformOrigin: 'center center'
          });

          /* Text lines: 0,1 fade in/out; line 2 stays visible after peak */
          [['#cl-0', 0, 0.14, 0.36],
          ['#cl-1', 0.28, 0.42, 0.64],
          ['#cl-2', 0.56, 0.72, 99]].forEach(([sel, enter, peak, exit]) => {
            let opacity, y;
            if (p < enter) { opacity = 0; y = 22; }
            else if (p < peak) {
              const t = (p - enter) / (peak - enter);
              opacity = t; y = 22 * (1 - t);
            } else if (p < exit) {
              const t = (p - peak) / (exit - peak);
              opacity = Math.max(0, 1 - t * 1.6); y = 0;
            } else { opacity = 0; y = -16; }
            gsap.set(sel, { opacity, y });
          });
        }
      });

      /* ── GAP BRIDGE ─────────────────────────────────────── */
      ScrollTrigger.create({
        trigger: '#gap-bridge',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: self => {
          const p = self.progress;
          const appear = Math.min(1, p / 0.22);
          const disappear = p > 0.72 ? Math.max(0, 1 - (p - 0.72) / 0.22) : 1;
          const vis = appear * disappear;
          gsap.set('#bridge-text', { opacity: vis, scale: 0.9 + appear * 0.1 });
          const subAppear = p > 0.14 ? Math.min(1, (p - 0.14) / 0.18) : 0;
          gsap.set('#bridge-sub', { opacity: vis * subAppear, y: (1 - appear) * 20 });
        }
      });

      /* ── FEAST REVEAL ────────────────────────────────────── */
      const feastItems = Array.from(document.querySelectorAll('.feast-item'));
      ScrollTrigger.create({
        trigger: '#feast-reveal',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
        onUpdate: self => {
          const p = self.progress;
          const W = window.innerWidth;
          /* gap between items scales with viewport, capped so nothing clips on small screens */
          const gap = Math.min(W < 600 ? W * 0.24 : 230, W * 0.21);
          const n = feastItems.length;          // 5
          const mid = (n - 1) / 2;               // 2

          /* header text */
          gsap.set('#feast-eyebrow', { opacity: Math.min(1, p / 0.06) });
          const hl = Math.min(1, p / 0.11);
          gsap.set('#feast-headline', { opacity: hl, y: (1 - hl) * 22 });

          feastItems.forEach((el, i) => {
            const stagger = i * 0.028;
            /* Phase 1: emerge — items scale up from near-invisible */
            const appear = Math.max(0, Math.min(1, (p - stagger) / 0.28));
            /* Phase 2: spread apart */
            const spreadT = Math.max(0, Math.min(1, (p - 0.22) / 0.45));

            const targetX = (i - mid) * gap;
            const currentX = targetX * spreadT;
            const scale = 0.12 + appear * 0.88;   /* 0.12 → 1.0 */

            /* stacking order: center on top at start, all equal when spread */
            const zIndex = spreadT < 0.5
              ? Math.round((n - Math.abs(i - mid)) * 10)
              : 10;

            gsap.set(el, { x: currentX, scale, opacity: appear, zIndex });

            /* label fades in once items have fully spread */
            const labelOpacity = spreadT > 0.68
              ? Math.min(1, (spreadT - 0.68) / 0.24) * appear
              : 0;
            const labelEl = el.querySelector('.feast-item-label');
            if (labelEl) gsap.set(labelEl, { opacity: labelOpacity });
          });

          /* hint line at tail */
          gsap.set('#feast-hint', { opacity: Math.max(0, (p - 0.82) / 0.1) });
        }
      });

      /* ── SECTION 3: SPEED ───────────────────────────────── */
      ScrollTrigger.create({
        trigger: '#speed',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.9,
        onUpdate: self => {
          const p = self.progress;
          const W = window.innerWidth;

          /* Scooter travels left → right */
          gsap.set('#speed-scooter', {
            x: (-W * 0.15) + p * (W * 1.2)
          });

          /* Words clip-path reveal */
          [['#sw-0', 0.18, 0.36],
          ['#sw-1', 0.42, 0.60],
          ['#sw-2', 0.65, 0.83]].forEach(([sel, start, end]) => {
            const t = Math.max(0, Math.min(1, (p - start) / (end - start)));
            gsap.set(sel, {
              opacity: t > 0.01 ? 1 : 0,
              clipPath: `inset(0 ${(1 - t) * 100}% 0 0)`
            });
          });

          /* Sub caption */
          const subT = Math.max(0, Math.min(1, (p - 0.78) / 0.14));
          gsap.set('#speed-sub', { opacity: subT, y: (1 - subT) * 12 });
        }
      });

      /* ── SECTION 4: CONTROL ─────────────────────────────── */
      let lastStep = -1;

      function setPhoneStep(step) {
        if (step === lastStep) return;
        lastStep = step;

        ['#pui-0', '#pui-1', '#pui-2'].forEach((sel, i) => {
          if (i === step) {
            gsap.to(sel, { opacity: 1, y: 0, duration: 0.55, ease: easeSmooth, zIndex: 2 });
          } else {
            gsap.to(sel, { opacity: 0, y: i < step ? -10 : 12, duration: 0.45, ease: easeSmooth, zIndex: 1 });
          }
        });

        gsap.to('#phone-wrap', { rotateY: [-3, 0, 3][step] || 0, duration: 0.8, ease: easeSmooth });

        ['#ctrl-step-0', '#ctrl-step-1', '#ctrl-step-2'].forEach((sel, i) => {
          document.querySelector(sel)?.classList.toggle('active', i === step);
        });
      }

      ScrollTrigger.create({
        trigger: '#control',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => {
          const p = self.progress;
          setPhoneStep(p < 0.33 ? 0 : p < 0.67 ? 1 : 2);
        }
      });

      /* ── MENU SHOWCASE ───────────────────────────────────── */
      gsap.to('#menu-title', {
        opacity: 1, y: 0, duration: 1.1, ease,
        scrollTrigger: { trigger: '#menu-showcase', start: 'top 72%', once: true }
      });
      gsap.utils.toArray(['#mc-0', '#mc-1', '#mc-2', '#mc-3']).forEach((el, i) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.9, ease, delay: i * 0.13,
          scrollTrigger: { trigger: '.menu-grid', start: 'top 78%', once: true }
        });
      });

      /* ── STATS ──────────────────────────────────────────────── */
      gsap.to('#stats-headline', {
        opacity: 1, y: 0, duration: 1, ease,
        scrollTrigger: { trigger: '#stats', start: 'top 75%', once: true }
      });
      gsap.utils.toArray(['#si-0', '#si-1', '#si-2', '#si-3']).forEach((el, i) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.8, ease, delay: i * 0.12,
          scrollTrigger: { trigger: '.stats-grid', start: 'top 78%', once: true }
        });
      });

      /* ── HOW IT WORKS ───────────────────────────────────────── */
      gsap.to('#hiw-title', {
        opacity: 1, y: 0, duration: 1.1, ease,
        scrollTrigger: { trigger: '#how-it-works', start: 'top 72%', once: true }
      });
      gsap.to('#hiw-0', {
        opacity: 1, x: 0, duration: 1, ease,
        scrollTrigger: { trigger: '.hiw-steps', start: 'top 80%', once: true }
      });
      gsap.to('#hiw-1', {
        opacity: 1, y: 0, duration: 1, ease, delay: 0.2,
        scrollTrigger: { trigger: '.hiw-steps', start: 'top 80%', once: true }
      });
      gsap.to('#hiw-2', {
        opacity: 1, x: 0, duration: 1, ease, delay: 0.4,
        scrollTrigger: { trigger: '.hiw-steps', start: 'top 80%', once: true }
      });

      /* ── FRESH & HEALTHY ────────────────────────────────────── */
      gsap.to('#fresh-title', {
        opacity: 1, x: 0, duration: 1.1, ease,
        scrollTrigger: { trigger: '#fresh', start: 'top 72%', once: true }
      });
      gsap.to('#fresh-desc', {
        opacity: 1, y: 0, duration: 0.9, ease, delay: 0.25,
        scrollTrigger: { trigger: '#fresh', start: 'top 72%', once: true }
      });
      gsap.to('#fresh-pills', {
        opacity: 1, duration: 0.8, ease, delay: 0.45,
        scrollTrigger: { trigger: '#fresh', start: 'top 72%', once: true }
      });
      gsap.to('#fresh-img', {
        opacity: 1, x: 0, duration: 1.1, ease, delay: 0.1,
        scrollTrigger: { trigger: '#fresh', start: 'top 72%', once: true }
      });

      /* ── SECTION 5: SOCIAL PROOF ────────────────────────── */
      gsap.to('#proof-quote', {
        opacity: 1, y: 0, duration: 1, ease,
        scrollTrigger: { trigger: '#proof-quote', start: 'top 78%', once: true }
      });
      gsap.to('#proof-attr', {
        opacity: 1, y: 0, duration: 0.8, ease, delay: 0.3,
        scrollTrigger: { trigger: '#proof-attr', start: 'top 80%', once: true }
      });

      /* ── SECTION 6: FINAL CTA ───────────────────────────── */
      gsap.timeline({
        scrollTrigger: { trigger: '#final-cta', start: 'top 70%', once: true }
      })
        .to('#cta-headline', { opacity: 1, y: 0, duration: 1.1, ease })
        .to('#cta-sub', { opacity: 1, y: 0, duration: 0.9, ease }, '-=0.65')
        .to('#final-btn', { opacity: 1, y: 0, scale: 1, duration: 0.8, ease }, '-=0.4');

      /* ── SMOOTH BODY BACKGROUND MORPH ────────────────────── */
      /* Each section registers its "representative" background color.
         IntersectionObserver fires when a section enters view and
         the body background-color glides silently to match —
         users never see a sharp jump, just an effortless fade. */
      const sectionBgs = {
        'hero': '#FFF3E6',
        'craving': '#FFF8F0',
        'gap-bridge': '#FFECD2',
        'speed': '#FFE8C4',
        'control': '#FFFBF7',
        'feast-reveal': '#FFF3E0',
        'stats': '#FFFBF7',
        'how-it-works': '#FFF8F0',
        'fresh': '#F0FDF4',
        'social-proof': '#FFF3E0',
        'final-cta': '#FFE8BA',
      };

      /* Long transition so the shift is imperceptible mid-scroll */
      document.body.style.transition = 'background-color 1.8s cubic-bezier(0.4,0,0.2,1)';

      const bgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && sectionBgs[entry.target.id]) {
            document.body.style.backgroundColor = sectionBgs[entry.target.id];
          }
        });
      }, { threshold: 0.3 });

      Object.keys(sectionBgs).forEach(id => {
        const el = document.getElementById(id);
        if (el) bgObserver.observe(el);
      });
    });

    const defaultConfig = {
      hero_title: "This isn't delivery. It's <em>an arrival.</em>",
      hero_subtitle: "Freshly crafted. Carefully delivered. Perfectly timed.",
      cta_button_text: "Start Your Feast",
      features_title: "How FeastFleet Works",
      footer_text: "© 2025 FeastFleet. Crafted for the hunger.",
      background_color: "#FFFBF7",
      surface_color: "#FFFFFF",
      text_color: "#1A1205",
      primary_action_color: "#FF6B35",
      secondary_action_color: "#E8541A",
      font_family: "Plus Jakarta Sans",
      font_size: 16,
    };

    async function onConfigChange(config) {
      const heroTitle = document.getElementById('hero-title');
      const heroSubtitle = document.getElementById('hero-subtitle');
      const heroCta = document.getElementById('hero-cta');
      const footerText = document.getElementById('footer-text');

      if (heroTitle) heroTitle.innerHTML = config.hero_title || defaultConfig.hero_title;
      if (heroSubtitle) heroSubtitle.innerHTML = config.hero_subtitle || defaultConfig.hero_subtitle;
      if (heroCta) {
        const txt = config.cta_button_text || defaultConfig.cta_button_text;
        heroCta.innerHTML = `${txt}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      }
      if (footerText) footerText.textContent = config.footer_text || defaultConfig.footer_text;

      document.body.style.fontFamily = `"${config.font_family || defaultConfig.font_family}", sans-serif`;
      const pc = config.primary_action_color || defaultConfig.primary_action_color;
      document.documentElement.style.setProperty('--coral', pc);
    }

    function mapToCapabilities(config) {
      return {
        recolorables: [],
        borderables: [],
        fontEditable: {
          get: () => config.font_family || defaultConfig.font_family,
          set: (value) => { config.font_family = value; window.elementSdk?.setConfig({ font_family: value }); },
        },
        fontSizeable: {
          get: () => config.font_size || defaultConfig.font_size,
          set: (value) => { config.font_size = value; window.elementSdk?.setConfig({ font_size: value }); },
        },
      };
    }

    function mapToEditPanelValues(config) {
      return new Map([
        ['hero_title', config.hero_title || defaultConfig.hero_title],
        ['hero_subtitle', config.hero_subtitle || defaultConfig.hero_subtitle],
        ['cta_button_text', config.cta_button_text || defaultConfig.cta_button_text],
        ['footer_text', config.footer_text || defaultConfig.footer_text],
      ]);
    }

    if (window.elementSdk) {
      window.elementSdk.init({ defaultConfig, onConfigChange, mapToCapabilities, mapToEditPanelValues });
    }
