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
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); }
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('pending'); observer.observe(element); });
}
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
