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
