// Project page on the phone: going back to the home page ("More Cool Stuff").
// The opposite of opening a project from the home page (phone-home.js): the home page's squares come in,
// as two columns, before the home page opens.
//   - The right column (Hamotzi above trac., stuck together) comes down from the top, on the right half.
//   - The left column (Lets Talk About It above Davar Echad) comes up from the bottom, on the left half.
// Each column pushes the page in front of it toward the middle of the screen, where it disappears
// (like a broom sweeping). They meet in the middle on cream, stay together for a moment,
// and then the home page opens.
// How fast: --phone-sweep-time and --phone-sweep-hold in styles.css (the same as from the home page).
// The squares look the same as on the home page (styles.css, .phone-tile).

(function () {
  const page = document.querySelector('.phone-project');
  const homeLink = page && page.querySelector('.phone-project-nav a[href="index.html"]');
  if (!homeLink) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const seconds = name => parseFloat(rootStyle.getPropertyValue(name)) * 1000; // "1.1s" → 1100
  const smooth = 'cubic-bezier(0.65, 0, 0.35, 1)'; // starts slowly, speeds up, slows down at the end

  // The home page's squares, column by column, top to bottom: [name, picture, label]
  const columns = {
    left: [
      ['lets-talk', 'images/phone-tile-lets-talk.svg', 'lets talk about it'],
      ['davar', 'images/phone-tile-davar.svg', 'davar echad'],
    ],
    right: [
      ['hamotzi', 'images/phone-tile-hamotzi.png', 'hamotzi'],
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

    const leftColumn = makeColumn('left');
    const rightColumn = makeColumn('right');
    layer.append(top, bottom, leftColumn, rightColumn);

    // Where the columns meet: their middle at the middle of the screen
    const columnHeight = rightColumn.offsetHeight;
    const meetTop = (screenHeight - columnHeight) / 2;
    const distance = meetTop + columnHeight; // how far each column travels (and pushes the page)

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
