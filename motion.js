(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = false;
  try { paused = localStorage.getItem('velodream-motion') === 'off'; } catch {}
  const enabled = () => !paused && !reduced.matches;
  const activeAnimations = new Set();
  const tiltTargets = [...document.querySelectorAll('.category,.product-image,.collection-grid a')];
  const hero = document.querySelector('.hero');
  const resets = [];
  function syncMotion() {
    root.dataset.motion = enabled() ? 'on' : 'off';
    toggle.hidden = false;
    toggle.textContent = enabled() ? 'Motion: on' : 'Motion: off';
    toggle.setAttribute('aria-pressed', String(enabled()));
    toggle.disabled = reduced.matches;
    toggle.title = reduced.matches ? 'Reduced motion follows your device settings' : 'Turn visual motion on or off';
    if (!enabled()) {
      activeAnimations.forEach(animation => animation.cancel());
      activeAnimations.clear();
      resets.forEach(reset => reset());
    }
    document.dispatchEvent(new Event('velodream:motionchange'));
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('velodream-motion', paused ? 'off' : 'on'); } catch {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  syncMotion();

  // Work only on pointer movement, at most once per rendered frame.
  function trackPointer(target, paint, properties) {
    let frame = 0;
    let rect;
    let x = 0;
    let y = 0;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      properties.forEach(property => target.style.removeProperty(property));
    }
    resets.push(reset);
    target.addEventListener('pointerenter', () => { rect = target.getBoundingClientRect(); });
    target.addEventListener('pointermove', event => {
      if (!enabled() || !finePointer.matches || event.pointerType === 'touch') return;
      rect ||= target.getBoundingClientRect();
      x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint(target, x, y); });
    }, {passive: true});
    target.addEventListener('pointerleave', reset);
    target.addEventListener('pointercancel', reset);
  }
  tiltTargets.forEach(target => trackPointer(target, (element, x, y) => {
    element.style.setProperty('--tilt-x', `${-y * 8}deg`);
    element.style.setProperty('--tilt-y', `${x * 10}deg`);
  }, ['--tilt-x', '--tilt-y']));
  trackPointer(hero, (element, x, y) => {
    element.style.setProperty('--pan-x', `${x * -16}px`);
    element.style.setProperty('--pan-y', `${y * -12}px`);
    element.style.setProperty('--caption-x', `${x * 10}px`);
  }, ['--pan-x', '--pan-y', '--caption-x']);
  finePointer.addEventListener('change', () => resets.forEach(reset => reset()));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resets.forEach(reset => reset());
  });

  // Content stays visible if scripting or animation support is unavailable.
  if ('IntersectionObserver' in window && Element.prototype.animate) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (!enabled()) return;
        const animation = entry.target.animate([
          {opacity: 0, translate: '0 52px', scale: '.96'},
          {opacity: 1, translate: '0 0', scale: '1'}
        ], {duration: 1100, delay: Number(entry.target.dataset.revealDelay || 0), fill:'backwards', easing: 'cubic-bezier(.16,1,.3,1)'});
        activeAnimations.add(animation);
        animation.onfinish = () => activeAnimations.delete(animation);
        animation.oncancel = () => activeAnimations.delete(animation);
      });
    }, {threshold: .08, rootMargin:'0px 0px -24px 0px'});
    document.querySelectorAll('.category-grid,.products,.collection-grid').forEach(group => {
      [...group.children].forEach((element, index) => { element.dataset.revealDelay = String(index * 90); observer.observe(element); });
    });
    document.querySelectorAll('.section-heading,.story>div,.story>img,.footer-top,.footer-grid>div').forEach(element => observer.observe(element));
  }
})();
