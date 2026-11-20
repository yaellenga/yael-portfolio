// Home page on the phone: what happens when you tap a project square or the about strip.
//
// A project: its two halves from the computer version come in. The right half comes down from the top,
// the left half comes up from the bottom. Each one pushes the page in front of it toward the middle of
// the screen, where it disappears (like a broom sweeping). They meet in the middle on cream,
// stay together for a moment, and then the project page opens.
// The about strip: it grows up until it fills the screen, pushing the page up, and then the about page opens.
//
// How fast: --phone-sweep-time, --phone-sweep-hold and --phone-about-time in styles.css.
// The look of the layers: .phone-sweep in styles.css.

(function () {
  const phoneHome = document.querySelector('.phone-home');
  if (!phoneHome) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const seconds = name => parseFloat(rootStyle.getPropertyValue(name)) * 1000; // "1.1s" → 1100
  const smooth = 'cubic-bezier(0.65, 0, 0.35, 1)'; // starts slowly, speeds up, slows down at the end

  // A copy of the phone page, placed where the page is now on the screen (it may be scrolled)
  function copyOfPage(fromTop) {
    const copy = phoneHome.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.style.top = `${-window.scrollY - fromTop}px`;
    return copy;
  }

  // Only the part of the copy that was on the screen (a slice as tall as half the screen), so that
  // what is above or below the screen doesn't come into view while the slice is pushed away
  function onScreenOnly(copy) {
    const slice = document.createElement('div');
    slice.className = 'phone-sweep-slice';
    slice.appendChild(copy);
    return slice;
  }

  // The cream layer over everything
  function makeLayer() {
    const layer = document.createElement('div');
    layer.className = 'phone-sweep';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    return layer;
  }

  // Tapping a project square
  function sweepToProject(page) {
    const screenHeight = window.innerHeight;
    const layer = makeLayer();

    // The page, cut in two at the middle of the screen
    const top = document.createElement('div');
    top.className = 'phone-sweep-part phone-sweep-top';
    const topPage = onScreenOnly(copyOfPage(0));
    top.appendChild(topPage);

    const bottom = document.createElement('div');
    bottom.className = 'phone-sweep-part phone-sweep-bottom';
    const bottomPage = onScreenOnly(copyOfPage(screenHeight / 2));
    bottom.appendChild(bottomPage);

    // The project's two halves, copied from the computer version
    const halves = [];
    for (const [column, side] of [['.split-left', 'left'], ['.split-right', 'right']]) {
      const screen = document.querySelector(`${column} .screen[href="${page}"]`);
      const half = document.createElement('div');
      half.className = `phone-sweep-half phone-sweep-${side}`;
      if (screen) half.appendChild(screen.cloneNode(true));
      halves.push(half);
    }
    const [leftHalf, rightHalf] = halves;
    layer.append(top, bottom, leftHalf, rightHalf);

    // Where the halves meet: their middle at the middle of the screen
    const halfHeight = rightHalf.offsetHeight;
    const meetTop = (screenHeight - halfHeight) / 2;
    const distance = meetTop + halfHeight; // how far each half travels (and pushes the page)

    const timing = { duration: seconds('--phone-sweep-time'), easing: smooth, fill: 'forwards' };
    // The right half: from just above the screen down to the middle; the top of the page goes down with it
    rightHalf.animate([{ transform: `translateY(${-halfHeight}px)` }, { transform: `translateY(${meetTop}px)` }], timing);
    topPage.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${distance}px)` }], timing);
    // The left half: from just under the screen up to the middle; the bottom of the page goes up with it
    leftHalf.animate([{ transform: `translateY(${screenHeight}px)` }, { transform: `translateY(${meetTop}px)` }], timing);
    const last = bottomPage.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-distance}px)` }], timing);

    // Together for a moment, then the project page
    last.finished.then(() => setTimeout(() => { window.location.href = page; }, seconds('--phone-sweep-hold')));
  }

  // Tapping the about strip
  function growToAbout(strip, page) {
    const screenHeight = window.innerHeight;
    const place = strip.getBoundingClientRect();
    const layer = makeLayer();

    const pageCopy = copyOfPage(0);
    const grower = document.createElement('div');
    grower.className = 'phone-sweep-about';
    const stripCopy = strip.cloneNode(true);
    stripCopy.style.position = 'absolute';
    stripCopy.style.inset = '0';
    stripCopy.style.width = '100%';
    stripCopy.style.height = '100%';
    grower.appendChild(stripCopy);
    layer.append(pageCopy, grower);

    const timing = { duration: seconds('--phone-about-time'), easing: smooth, fill: 'forwards' };
    // The strip: its top goes up to the top of the screen, its bottom to the bottom
    const last = grower.animate([
      { top: `${place.top}px`, height: `${place.height}px` },
      { top: '0px', height: `${screenHeight}px` },
    ], timing);
    // The page above it goes up with its top
    pageCopy.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-place.top}px)` }], timing);

    last.finished.then(() => { window.location.href = page; });
  }

  phoneHome.addEventListener('click', (event) => {
    const link = event.target.closest('.phone-tile, .phone-about');
    if (!link) return;
    // For people who asked for less motion: just open the page
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    const page = link.getAttribute('href');
    if (link.classList.contains('phone-about')) growToAbout(link, page);
    else sweepToProject(page);
  });

  // Coming back with the browser's back button, the page may be shown as it was left: remove the layer
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.phone-sweep').forEach(layer => layer.remove());
  });
})();
