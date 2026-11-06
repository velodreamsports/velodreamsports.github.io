const menuButton = document.querySelector('.mobile-menu');
const menu = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.slide);
  document.querySelectorAll('.slide').forEach((slide, i) => slide.classList.toggle('active', i === index));
  document.querySelectorAll('[data-slide]').forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
}));
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => {
  const [id, direction] = button.dataset.scroll.split(':');
  const track = document.getElementById(id);
  track.scrollBy({left: track.clientWidth * Number(direction) * .8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}));
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
    const title = document.createElement('span'); title.textContent = card.dataset.product + ' ↗';
    button.append(image, title);
    button.addEventListener('click', () => { searchDialog.close(); showDetails(card); });
    results.append(button);
  });
}
document.querySelectorAll('[data-search]').forEach(button => button.addEventListener('click', () => { searchDialog.showModal(); renderSearch(); searchInput.focus(); }));
searchInput.addEventListener('input', renderSearch);
document.querySelector('#year').textContent = new Date().getFullYear();
