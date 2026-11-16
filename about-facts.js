// About page: the random facts at the bottom right change while the page scrolls.
// The page itself stays still (it is fixed to the window). Below it, .about-scroll-space gives
// the page some scroll length: one stop for each fact (--about-fact-scroll apart, in styles.css).
// While scrolling, the list of facts slides up under "A random fact about me:",
// and the page always comes to rest on a stop (scroll snapping), so one whole fact shows.
//
// The facts are on a wheel: the scroll never ends. After the last fact comes the first one again
// (and scrolling up from the first fact gives the last one). For that, the list gets a copy of the
// last fact before the first one, and a copy of the first fact after the last one. When the page
// reaches a copy, it jumps to the real fact, which looks exactly the same, so the jump can't be seen.

(function () {
  const list = document.querySelector('.about-facts-list');
  const space = document.querySelector('.about-scroll-space');
  if (!list || !space) return;

  const facts = [...list.children];
  const factCount = facts.length;
  if (factCount < 2) return;

  // The copies: the last fact at the start, the first fact at the end (hidden from screen readers)
  const copyOfLast = facts[factCount - 1].cloneNode(true);
  const copyOfFirst = facts[0].cloneNode(true);
  copyOfLast.setAttribute('aria-hidden', 'true');
  copyOfFirst.setAttribute('aria-hidden', 'true');
  list.prepend(copyOfLast);
  list.append(copyOfFirst);

  // One stop for each fact in the list (the copies too): the page snaps to these while scrolling
  const stopCount = factCount + 2;
  space.style.setProperty('--fact-count', stopCount);
  const stops = [];
  for (let i = 0; i < stopCount; i++) {
    const stop = document.createElement('div');
    stop.className = 'about-scroll-stop';
    stop.style.setProperty('--index', i);
    space.appendChild(stop);
    stops.push(stop);
  }

  const step = () => stops[1].offsetTop; // the scroll between two facts, in pixels
  const jumpTo = (top) => window.scrollTo({ top, behavior: 'instant' });

  function update() {
    const distance = step();
    const end = factCount + 1; // the stop of the copy of the first fact (the last stop)

    // At a copy: jump to the real fact it copies
    if (window.scrollY <= 0) jumpTo(factCount * distance);       // copy of the last fact → the last fact
    else if (window.scrollY >= end * distance - 1) jumpTo(distance); // copy of the first fact → the first fact

    // How far along the list the page has scrolled: 0 = the copy of the last fact, 1 = the first fact…
    const progress = Math.min(Math.max(window.scrollY / distance, 0), end);
    list.style.setProperty('--progress', progress);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  // The page opens on the first fact (the second stop), also after a reload
  history.scrollRestoration = 'manual';
  jumpTo(step());
  update();
})();
