const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionAllowed = () => !prefersReducedMotion.matches && document.documentElement.dataset.motion !== 'off';
const menuButton = document.querySelector('.mobile-menu');
const menu = document.querySelector('#mobile-nav');
let menuAnimation;
function setMenu(open, instant = false) {
  const from = menu.hidden ? 0 : menu.getBoundingClientRect().height;
  menuAnimation?.cancel();
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.inert = !open;
  menu.hidden = false;
  menu.classList.toggle('is-open', open);
  const to = open ? menu.scrollHeight : 0;
  if (instant || !motionAllowed() || !menu.animate) { menu.hidden = !open; return; }
  menuAnimation = menu.animate([{height:`${from}px`,opacity:from ? 1 : 0},{height:`${to}px`,opacity:open ? 1 : 0}], {duration:open ? 560 : 400,easing:'cubic-bezier(.22,.8,.25,1)'});
  menuAnimation.onfinish = () => { menu.hidden = !open; menuAnimation = null; };
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  setMenu(false);
  const navigate = () => { location.hash = link.hash; };
  if (menuAnimation) menuAnimation.finished.then(navigate, navigate);
  else navigate();
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header') && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
});
matchMedia('(min-width:761px)').addEventListener('change', event => { if(event.matches) setMenu(false, true); });

const heroBanner = document.querySelector('.hero');
const slides = [...document.querySelectorAll('.slide')];
const slideButtons = [...document.querySelectorAll('[data-slide]')];
let slideIndex = 0;
let bannerTimer;
let bannerVisible = true;
let bannerHovered = false;
let bannerFocused = false;
function showSlide(index) {
  slideIndex = index;
  slides.forEach((slide, i) => { slide.classList.toggle('active', i === index); slide.setAttribute('aria-hidden', String(i !== index)); });
  slideButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}
function scheduleBanner() {
  clearTimeout(bannerTimer);
  const playing = motionAllowed() && bannerVisible && !document.hidden && !bannerHovered && !bannerFocused;
  heroBanner.classList.toggle('is-playing', playing);
  if (playing) bannerTimer = setTimeout(() => { showSlide((slideIndex + 1) % slides.length); scheduleBanner(); }, 8000);
}
slideButtons.forEach(button => button.addEventListener('click', () => { showSlide(Number(button.dataset.slide)); scheduleBanner(); }));
heroBanner.addEventListener('pointerenter', event => { if(event.pointerType === 'mouse') { bannerHovered = true; scheduleBanner(); } });
heroBanner.addEventListener('pointerleave', () => { bannerHovered = false; scheduleBanner(); });
heroBanner.addEventListener('focusin', () => { bannerFocused = true; scheduleBanner(); });
heroBanner.addEventListener('focusout', event => { if(!heroBanner.contains(event.relatedTarget)) { bannerFocused = false; scheduleBanner(); } });
document.addEventListener('visibilitychange', scheduleBanner);
document.addEventListener('velodream:motionchange', () => {
  scheduleBanner();
  if (!motionAllowed() && menuAnimation) setMenu(menuButton.getAttribute('aria-expanded') === 'true', true);
});
prefersReducedMotion.addEventListener('change', scheduleBanner);
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { bannerVisible = entries[0].isIntersecting; scheduleBanner(); }, {threshold:.15}).observe(heroBanner);
showSlide(0);
scheduleBanner();
const detailDialog = document.querySelector('#product-dialog');
const searchDialog = document.querySelector('#search-dialog');
const cards = [...document.querySelectorAll('[data-product]')];
function showDetails(card) {
  document.querySelector('#detail-title').textContent = card.dataset.product;
  const image = document.querySelector('#detail-image');
  image.src = card.dataset.image;
  image.alt = card.dataset.product;
  detailDialog.showModal();
}
cards.forEach(card => card.addEventListener('click', () => showDetails(card)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('.dialog-close,.dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if(event.target === dialog) { const r = dialog.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
const searchInput = document.querySelector('#search-input');
const results = document.querySelector('#search-results');
function renderSearch() {
  const query = searchInput.value.trim().toLowerCase();
  results.replaceChildren();
  if(!query) { const hint = document.createElement('p'); hint.textContent = 'Explore road, gravel, aero, framesets, wheelsets and cockpits.'; results.append(hint); return; }
  const matches = cards.filter(card => card.textContent.toLowerCase().includes(query));
  if(!matches.length) { const empty = document.createElement('p'); empty.textContent = 'No preview selections found. Try “road”, “gravel” or “carbon”.'; results.append(empty); }
  matches.forEach(card => {
    const button = document.createElement('button');
    const image = document.createElement('img'); image.src = card.dataset.image; image.alt = '';
    const title = document.createElement('span'); title.textContent = card.dataset.product;
    button.append(image, title);
    button.addEventListener('click', () => { searchDialog.close(); showDetails(card); });
    results.append(button);
  });
}
document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', () => { searchDialog.showModal(); renderSearch(); searchInput.focus(); }));
searchInput.addEventListener('input', renderSearch);
document.querySelector('#year').textContent = new Date().getFullYear();

