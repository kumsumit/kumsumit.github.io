const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
function closeMenu(restoreFocus = false) {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = 'Menu <span aria-hidden="true">☰</span>';
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  links.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.innerHTML = open ? 'Close <span aria-hidden="true">×</span>' : 'Menu <span aria-hidden="true">☰</span>';
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && links.classList.contains('open')) closeMenu(true); });
links.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  const target = document.querySelector(link.hash);
  if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
});
links.addEventListener('focusout', event => { if (!links.contains(event.relatedTarget) && event.relatedTarget !== toggle) closeMenu(); });
matchMedia('(min-width: 801px)').addEventListener('change', () => closeMenu());
const header = document.querySelector('header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 12), { passive: true });
function openLinkedDetails() {
  const id = location.hash.slice(1);
  const target = document.getElementById(id);
  if (target?.tagName === 'DETAILS') target.open = true;
}
document.querySelectorAll('a[href$="-details"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.hash.slice(1));
  if (target?.tagName === 'DETAILS') target.open = true;
}));
addEventListener('hashchange', openLinkedDetails);
openLinkedDetails();
document.querySelectorAll('a[data-topic]').forEach(link => link.addEventListener('click', () => { document.querySelector('#enquiry-topic').value = link.dataset.topic; }));
document.querySelector('#copyright-year').textContent = new Date().getFullYear();
// Set to a verified HTTPS contact endpoint when a real submission service is available.
// This draft-only interaction deliberately sends no network requests or personal data.
document.querySelector('#contact-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const draft = `${data.get('topic')}\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`;
  const output = document.querySelector('#draft-output');
  output.value = draft;
  output.hidden = false;
  const status = document.querySelector('#form-status');
  try {
    await navigator.clipboard.writeText(draft);
    status.textContent = 'Draft copied. Your enquiry has not been sent.';
  } catch {
    output.focus();
    output.select();
    status.textContent = 'Your draft is ready below. Select and copy it; your enquiry has not been sent.';
  }
});

// Local files cannot provide the HTTP Referer required by YouTube embeds.
// Keep the direct recording links usable in local-file previews.
if (location.protocol === 'file:') {
  document.querySelectorAll('.perspective-video').forEach(container => {
    container.querySelector('iframe')?.remove();
    const fallback = container.querySelector('.perspective-video-fallback');
    if (fallback) fallback.hidden = false;
  });
}

// The hero orbit system uses SVG animation, which CSS reduced-motion rules don't reach.
// Hold the planets still (at their staggered positions) for visitors who prefer less motion.
const orbitSystem = document.querySelector('svg.system');
if (orbitSystem) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => (reduceMotion.matches ? orbitSystem.pauseAnimations() : orbitSystem.unpauseAnimations());
  syncMotion();
  reduceMotion.addEventListener('change', syncMotion);
}

// Product poster row: previous/next buttons step one poster at a time and disable at either end.
const posterTrack = document.querySelector('.poster-track');
if (posterTrack) {
  const bar = document.querySelector('.poster-bar');
  const prev = bar.querySelector('.poster-prev');
  const next = bar.querySelector('.poster-next');
  const step = () => {
    const first = posterTrack.querySelector('.poster');
    return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(posterTrack).columnGap || 16) : posterTrack.clientWidth;
  };
  const sync = () => {
    const max = posterTrack.scrollWidth - posterTrack.clientWidth;
    bar.classList.toggle('no-scroll', max <= 2);
    prev.disabled = posterTrack.scrollLeft <= 2;
    next.disabled = posterTrack.scrollLeft >= max - 2;
  };
  const go = dir => { posterTrack.scrollBy({ left: dir * step() }); setTimeout(sync, 450); };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  posterTrack.addEventListener('scroll', sync, { passive: true });
  posterTrack.addEventListener('scrollend', sync);
  if ('ResizeObserver' in window) new ResizeObserver(sync).observe(posterTrack);
  else addEventListener('resize', sync);
  sync();
}

// Recent perspectives: turn the generated card grid into a spotlight (one statement at a time) with a speaker rail.
// Without JavaScript the generated cards remain a readable grid.
const recentPerspectives = document.querySelector('.recent-perspectives');
const spotlightCards = recentPerspectives ? [...recentPerspectives.querySelectorAll('.perspective-card')] : [];
if (spotlightCards.length > 1) {
  recentPerspectives.classList.add('is-spotlight');
  const stage = document.createElement('div');
  stage.className = 'spotlight';
  const rail = document.createElement('div');
  rail.className = 'spotlight-rail';
  rail.setAttribute('role', 'tablist');
  rail.setAttribute('aria-label', 'Choose a perspective');
  const panels = document.createElement('div');
  panels.className = 'spotlight-panels';
  const initialsOf = name => name.split(/\s+/).map(word => word.replace(/[^A-Za-z]/g, '')[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const tabs = spotlightCards.map((card, index) => {
    const heading = card.querySelector('h3');
    const name = heading.textContent.trim();
    const initials = initialsOf(name);
    const time = card.querySelector('footer time');
    // Speaker line: monogram + name + role, placed after the statement.
    const speaker = document.createElement('div');
    speaker.className = 'perspective-speaker';
    const mono = document.createElement('span');
    mono.className = 'perspective-mono';
    mono.setAttribute('aria-hidden', 'true');
    mono.textContent = initials;
    const who = document.createElement('div');
    who.append(heading, card.querySelector('.perspective-role'));
    speaker.append(mono, who);
    (card.querySelector('.perspective-summary') || card.querySelector('blockquote')).after(speaker);
    card.id = card.id || `perspective-spot-${index}`;
    card.setAttribute('role', 'tabpanel');
    card.tabIndex = 0;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'spotlight-tab';
    tab.id = `${card.id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', card.id);
    const tabMono = mono.cloneNode(true);
    const text = document.createElement('span');
    text.className = 'spotlight-tab-text';
    const tabName = document.createElement('b');
    tabName.textContent = name;
    const tabDate = document.createElement('span');
    tabDate.textContent = time ? time.textContent : '';
    text.append(tabName, tabDate);
    tab.append(tabMono, text);
    rail.append(tab);
    panels.append(card);
    return tab;
  });
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      spotlightCards[i].hidden = !on;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)));
  rail.addEventListener('keydown', event => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const moves = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = null;
    if (event.key in moves) next = (current + moves[event.key] + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(next, true);
  });
  stage.append(panels, rail);
  recentPerspectives.querySelectorAll('.perspective-year-group').forEach(group => group.remove());
  recentPerspectives.querySelector('.perspective-subsection-intro').after(stage);
  select(0);
}

// ---------------------------------------------------------------------------
// Site-wide motion. Runs last so it sees the poster row and spotlight built above.
// Nothing is hidden unless this script runs, and nothing moves for reduced-motion users.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const siteHeader = document.querySelector('header');

  // Scroll progress line and auto-hiding header (header returns as soon as you scroll up).
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    if (!reduceMotion) {
      const menuOpen = document.querySelector('.nav-links.open');
      if (scrollY > 320 && scrollY > lastY + 4 && !menuOpen && !siteHeader.contains(document.activeElement)) siteHeader.classList.add('is-tucked');
      else if (scrollY < lastY - 4 || scrollY <= 320) siteHeader.classList.remove('is-tucked');
    }
    lastY = scrollY;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  siteHeader.addEventListener('focusin', () => siteHeader.classList.remove('is-tucked'));
  onScroll();

  if (reduceMotion) return;
  document.documentElement.classList.add('motion');

  // Split headings into masked words (keeps inline spans and line breaks intact).
  const splitWords = heading => {
    let index = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const fragment = document.createDocumentFragment();
          parts.forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { fragment.append(part); return; }
            const outer = document.createElement('span');
            outer.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--i', index++);
            outer.append(inner);
            fragment.append(outer);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(heading);
    heading.classList.add('rv-words');
  };
  document.querySelectorAll('main h1, main h2').forEach(splitWords);

  // Footer wordmark rises letter by letter.
  const wordmark = document.querySelector('.footer-wordmark');
  if (wordmark) {
    const letters = [...wordmark.textContent];
    wordmark.textContent = '';
    letters.forEach((letter, i) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.setProperty('--i', i);
      wordmark.append(span);
    });
    wordmark.classList.add('rv-letters');
  }

  // Assign reveal variants. Groups cascade by their order among matching siblings.
  const variants = [
    ['.section-label', 'rv-rule'],
    ['.hero-kicker, .lede, .large-copy, .editorial > p:not(.eyebrow):not(.large-copy), .editorial > blockquote, .clarity-art, .shared-vision-finale > p, .future-line, .contact-note, .integration-note, .perspective-note, .perspective-subsection-intro > p, .eco-illustrative', 'rv-up'],
    ['.shared-vision-direction, .recent-perspectives, .ecosystem-diagram, #contact > .split, .company-credentials, .brochure-panel, .about-identity, .poster-bar', 'rv-up'],
    ['.vision-globe', 'rv-globe'],
    ['.eco-window', 'rv-left'],
    ['.eco-phone', 'rv-right'],
    ['.parent-node, .integration-track b, .about-identity img', 'rv-pop'],
    ['.shared-vision-products > div, .poster, .principle, .process li, .historical-perspectives .perspective-card, .context-tags span, .footer-main > *, .eco-side figcaption, .eco-outcome', 'rv-stagger'],
  ];
  const targets = new Set();
  variants.forEach(([selector, variant]) => {
    document.querySelectorAll(selector).forEach(element => {
      if (targets.has(element)) return;
      element.classList.add('rv', variant);
      if (variant === 'rv-stagger') {
        const siblings = [...element.parentElement.children].filter(sibling => sibling.matches(selector));
        element.style.setProperty('--d', `${Math.min(siblings.indexOf(element), 6) * 90}ms`);
      }
      targets.add(element);
    });
  });
  document.querySelectorAll('.rv-words, .rv-letters').forEach(element => targets.add(element));

  // Count numbers up when they appear.
  const countUp = element => {
    const target = parseInt(element.textContent.replace(/\D/g, ''), 10);
    if (!target) return;
    const start = performance.now(), duration = 1200;
    const frame = now => {
      const t = Math.min(1, (now - start) / duration);
      element.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(frame);
    };
    element.textContent = '0';
    requestAnimationFrame(frame);
  };

  // Reveal anything that has reached the lower part of the viewport, or has already been scrolled past,
  // so fast scrolling or jumping to a section never leaves content hidden.
  const pending = new Set(targets);
  const reveal = element => {
    element.classList.add('in');
    element.querySelectorAll('.fan-num').forEach(countUp);
    pending.delete(element);
  };
  const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  const check = () => {
    const line = innerHeight * 0.9, bottom = atBottom();
    pending.forEach(element => { if (bottom || element.getBoundingClientRect().top < line) reveal(element); });
    checking = false;
  };
  let checking = false;
  const queueCheck = () => { if (!checking && pending.size) { checking = true; requestAnimationFrame(check); } };
  addEventListener('scroll', queueCheck, { passive: true });
  addEventListener('resize', queueCheck);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  check();

  // Hero panel leans gently towards the pointer.
  const heroArt = document.querySelector('.hero-art');
  if (heroArt && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    heroArt.addEventListener('pointermove', event => {
      const box = heroArt.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      heroArt.style.transform = `perspective(1000px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    });
    heroArt.addEventListener('pointerleave', () => { heroArt.style.transform = ''; });
  }
})();
