// Loader: covers the page while its pictures, videos and fonts load, and counts up to 100%
// in the handwriting-style font (DM Serif Display italic). At 100% the about page's mouse picture shows for a moment
// (--loader-picture-time in styles.css), and then the loader goes away and the page shows.
//
// The loader covers the page from the start (a plain cream screen), but the number only shows up
// when loading takes a while (more than --loader-wait-time): a page that is ready right away
// just opens, with no number and no picture.
//
// This script sits right after <body>, so it runs before the rest of the page is read.

(function () {
  const loader = document.querySelector('.page-loader');
  const number = loader.querySelector('.page-loader-number');
  const rootStyle = getComputedStyle(document.documentElement);
  const waitTime = parseFloat(rootStyle.getPropertyValue('--loader-wait-time')) * 1000;
  const pictureTime = parseFloat(rootStyle.getPropertyValue('--loader-picture-time')) * 1000;
  const longestWait = 15000; // if something never finishes loading, open the page anyway after this long

  let total = 1;      // how many things there are to load (1 until the page is read: the page itself)
  let loaded = 0;     // how many of them have finished
  let shown = 0;      // the number on the screen, which counts up smoothly toward the real share
  let isVisible = false;
  let isDone = false;

  // Show the loader only if the page isn't ready after a short wait
  const showTimer = setTimeout(() => {
    if (isDone) return;
    isVisible = true;
    loader.classList.add('is-visible');
    requestAnimationFrame(countUp);
  }, waitTime);

  // The number counts up smoothly toward the share that has loaded
  function countUp() {
    const target = Math.floor((loaded / total) * 100);
    shown += Math.max((target - shown) * 0.15, target > shown ? 0.5 : 0);
    shown = Math.min(shown, target);
    number.textContent = `${Math.round(shown)}%`;

    if (Math.round(shown) >= 100) { showPicture(); return; }
    requestAnimationFrame(countUp);
  }

  // At 100%: the picture instead of the number for a moment, and then the page
  function showPicture() {
    loader.classList.add('is-at-picture');
    setTimeout(hideLoader, pictureTime);
  }

  function hideLoader() {
    loader.classList.add('is-gone');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }

  // Everything has loaded
  function finish() {
    if (isDone) return;
    isDone = true;
    loaded = total;
    clearTimeout(showTimer);
    if (!isVisible) loader.remove(); // it was quick: no loader at all
    // (if the loader is showing, countUp reaches 100% and shows the picture)
  }

  function oneMoreLoaded() {
    loaded += 1;
    if (loaded >= total) finish();
  }

  // Once the page is read, list what it has to load and wait for each one
  document.addEventListener('DOMContentLoaded', () => {
    const waits = [];

    // Pictures (only the ones the browser loads right away: pictures with loading="lazy",
    // lower down the page, load while scrolling, so the loader doesn't wait for them)
    for (const image of document.images) {
      if (image.complete || image.loading === 'lazy') continue;
      waits.push(new Promise(done => {
        image.addEventListener('load', done, { once: true });
        image.addEventListener('error', done, { once: true });
      }));
    }

    // Videos that play by themselves: wait until they can start
    for (const video of document.querySelectorAll('video[autoplay]')) {
      if (video.readyState >= 3) continue;
      waits.push(new Promise(done => {
        video.addEventListener('canplay', done, { once: true });
        video.addEventListener('error', done, { once: true });
      }));
    }

    // The fonts
    waits.push(document.fonts.ready);

    total = waits.length + 1; // +1: the page itself, which is read now
    loaded = 1;
    for (const wait of waits) wait.then(oneMoreLoaded);
    if (loaded >= total) finish();
  });

  setTimeout(finish, longestWait);
})();
