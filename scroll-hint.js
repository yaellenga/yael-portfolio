// Home page: a small hint that there is more below.
// When the page opens at the top, it scrolls down a little by itself (the two halves start to move)
// and comes back with a small bounce, as if someone started to scroll and changed their mind.
// It doesn't happen if the visitor already started scrolling, or asked their computer for less motion.
// Coming back from a project page it doesn't happen (split-scroll.js sets data-hint-from="none").
// How far, how long and when: --scroll-hint-distance, --scroll-hint-time, --scroll-hint-delay in styles.css.
// The underline under "Cool stuff by" shows up only once the hint is over (or if it doesn't happen at all):
// the page gets the class "hint-done", and styles.css shows the underline.

(function () {
  const showUnderline = () => document.documentElement.classList.add('hint-done');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { showUnderline(); return; }

  const rootStyle = getComputedStyle(document.documentElement);
  const distanceShare = parseFloat(rootStyle.getPropertyValue('--scroll-hint-distance')); // share of the window height
  const totalTime = parseFloat(rootStyle.getPropertyValue('--scroll-hint-time')) * 1000;  // the whole hint, both dips
  const delay = parseFloat(rootStyle.getPropertyValue('--scroll-hint-delay')) * 1000;     // wait after the page opens

  let stopped = false;
  // If the visitor scrolls, clicks or presses a key, stop the hint and leave the page to them
  const stop = () => { stopped = true; showUnderline(); };
  for (const type of ['wheel', 'touchstart', 'keydown', 'mousedown']) {
    window.addEventListener(type, stop, { once: true, passive: true });
  }

  // The way down and back: a big dip, then a small one (a bounce).
  // The first dip takes 60% of the time and goes all the way; the second takes 40% and goes a third of the way.
  const firstShare = 0.6;
  const bounceSize = 0.3;
  function depth(t) { // t: 0 → 1 over the whole hint; returns 0 (top) → 1 (the full distance)
    if (t < firstShare) return Math.sin(Math.PI * (t / firstShare));
    if (t < 1) return bounceSize * Math.sin(Math.PI * ((t - firstShare) / (1 - firstShare)));
    return 0;
  }

  // Where the hint starts: the top ("none" = no hint)
  const from = document.documentElement.dataset.hintFrom;
  const startTop = from ? Number(from) : 0;

  function play() {
    // only from where it should start, if the visitor hasn't moved the page yet
    if (stopped || Number.isNaN(startTop) || window.scrollY !== startTop) { showUnderline(); return; }
    const distance = window.innerHeight * distanceShare;
    const start = performance.now();

    function step(now) {
      if (stopped) return;
      const t = Math.min((now - start) / totalTime, 1);
      window.scrollTo({ top: startTop + depth(t) * distance, behavior: 'instant' });
      if (t < 1) requestAnimationFrame(step);
      else showUnderline(); // the bounce is over
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('load', () => setTimeout(play, delay));
})();
