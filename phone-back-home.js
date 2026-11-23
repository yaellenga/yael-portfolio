// Project page on the phone: going back to the home page ("More Cool Stuff").
// The opposite of opening a project from the home page (phone-home.js): the home page itself comes in,
// cut in two halves (each as tall as the screen), before the home page opens.
//   - The right half of the home page (Yael Lenga, Hamotzi, trac., ...) comes down from the top.
//   - The left half (Cool stuff by, Lets Talk About It, Davar Echad, ...) comes up from the bottom.
// Each half pushes the page in front of it toward the middle of the screen, where it disappears
// (like a broom sweeping). When they arrive they make up the whole home screen; a moment later
// the home page opens.
// The home page's look is taken from index.html itself (read once, when this page loads), so it is
// always the same as the real home page. If it can't be read, just the four squares come in, in two columns.
// How fast: --phone-sweep-time and --phone-sweep-hold in styles.css (the same as from the home page).

(function () {
  const page = document.querySelector('.phone-project');
  const homeLink = page && page.querySelector('.phone-project-nav a[href="index.html"]');
  if (!homeLink) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const seconds = name => parseFloat(rootStyle.getPropertyValue(name)) * 1000; // "1.1s" → 1100
  const smooth = 'cubic-bezier(0.65, 0, 0.35, 1)'; // starts slowly, speeds up, slows down at the end

  // The phone part of the home page (.phone-home in index.html), read in the background when this page loads
  let homeCopy = null;
  fetch('index.html')
    .then(answer => answer.text())
    .then(html => {
      const homePage = new DOMParser().parseFromString(html, 'text/html');
      homeCopy = homePage.querySelector('.phone-home');
    })
    .catch(() => { /* can't read it: the squares come in instead (makeColumn) */ });

  // One half of the home page, as tall as the screen: a window as wide as the home page's column
  // of squares on that side (197 on the left, 196 on the right, in Figma pixels), showing that part of the home page
  function makeHomeHalf(side) {
    const half = document.createElement('div');
    half.className = `phone-sweep-home-half phone-sweep-home-${side}`;
    const home = document.importNode(homeCopy, true);
    home.setAttribute('aria-hidden', 'true');
    half.appendChild(home);
    return half;
  }

  // If the home page couldn't be read: the home page's squares, column by column, top to bottom: [name, picture, label]
  const columns = {
    left: [
      ['lets-talk', 'images/phone-tile-lets-talk.svg', 'lets talk about it'],
      ['davar', 'images/phone-tile-davar.svg', 'davar echad'],
    ],
    right: [
      ['hamotzi', 'images/phone-tile-hamotzi.webp', 'hamotzi'],
      ['trac', 'images/phone-tile-trac.svg', 'trac'],
    ],
  };

  // One column of two squares, one on top of the other (each square 242 high in Figma pixels)
  function makeColumn(side) {
    const column = document.createElement('div');
    column.className = `phone-sweep-column phone-sweep-column-${side}`;
    columns[side].forEach(([name, picture, label], index) => {
      const tile = document.createElement('div');
      tile.className = `placed box phone-tile phone-tile-${name}`;
      tile.style.setProperty('--x', 0);
      tile.style.setProperty('--y', index * 242);
      tile.innerHTML = `<img class="phone-tile-picture phone-picture-${name}" src="${picture}" alt="">` +
                       `<span class="phone-tile-label">${label}</span>`;
      column.appendChild(tile);
    });
    return column;
  }

  // A copy of the page, placed where the page is now on the screen (it may be scrolled).
  // The links at the top stay at the top of the screen, so in the copy they are moved down by the scroll.
  function copyOfPage(fromTop) {
    const copy = page.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.style.top = `${-window.scrollY - fromTop}px`;
    for (const part of copy.querySelectorAll('.phone-project-nav > *')) {
      part.style.position = 'absolute';
      part.style.transform = `translateY(${window.scrollY}px)`;
    }
    // The videos in the copy go on from where the page's videos are
    const videos = page.querySelectorAll('video');
    copy.querySelectorAll('video').forEach((video, index) => {
      video.currentTime = videos[index].currentTime;
      if (!videos[index].paused) video.play();
    });
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

  function sweepHome(target) {
    const screenHeight = window.innerHeight;
    const layer = document.createElement('div');
    layer.className = 'phone-sweep';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    // The page, cut in two at the middle of the screen
    const top = document.createElement('div');
    top.className = 'phone-sweep-part phone-sweep-top';
    const topPage = onScreenOnly(copyOfPage(0));
    top.appendChild(topPage);

    const bottom = document.createElement('div');
    bottom.className = 'phone-sweep-part phone-sweep-bottom';
    const bottomPage = onScreenOnly(copyOfPage(screenHeight / 2));
    bottom.appendChild(bottomPage);

    // The two halves of the home page (or, if it couldn't be read, two columns of squares)
    const leftColumn = homeCopy ? makeHomeHalf('left') : makeColumn('left');
    const rightColumn = homeCopy ? makeHomeHalf('right') : makeColumn('right');
    layer.append(top, bottom, leftColumn, rightColumn);

    // Where they stop: the halves of the home page fill the screen (top at 0);
    // the columns of squares meet with their middle at the middle of the screen
    const columnHeight = rightColumn.offsetHeight;
    const meetTop = homeCopy ? 0 : (screenHeight - columnHeight) / 2;
    const distance = meetTop + columnHeight; // how far each one travels (and pushes the page)

    const timing = { duration: seconds('--phone-sweep-time'), easing: smooth, fill: 'forwards' };
    // The right column: from just above the screen down to the middle; the top of the page goes down with it
    rightColumn.animate([{ transform: `translateY(${-columnHeight}px)` }, { transform: `translateY(${meetTop}px)` }], timing);
    topPage.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${distance}px)` }], timing);
    // The left column: from just under the screen up to the middle; the bottom of the page goes up with it
    leftColumn.animate([{ transform: `translateY(${screenHeight}px)` }, { transform: `translateY(${meetTop}px)` }], timing);
    const last = bottomPage.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-distance}px)` }], timing);

    // Together for a moment, then the home page
    last.finished.then(() => setTimeout(() => { window.location.href = target; }, seconds('--phone-sweep-hold')));
  }

  homeLink.addEventListener('click', (event) => {
    // For people who asked for less motion, and for "open in a new tab": just open the page
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    sweepHome(homeLink.getAttribute('href'));
  });

  // Coming back with the browser's back button, the page may be shown as it was left: remove the layer
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.phone-sweep').forEach(layer => layer.remove());
  });
})();
