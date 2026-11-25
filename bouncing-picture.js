// Home page, first screen: one project picture floats around the screen on its own,
// like the old DVD logo screen saver. It moves in a straight slanted line, and when it hits an edge
// of the screen it bounces back, and at that moment it changes to the next picture (1, 2, 3, 4, 5, 1…)
// and the screen changes to that picture's two colors.
//
// The pictures are in images/tail/ (1.webp … 5.webp). Their sizes and corners are in the list below,
// in Figma pixels (from the Figma frames of each picture's screen).
// The colors of each picture's screen are in styles.css (--color-hero-1-left … --color-hero-5-right):
// the main element gets data-hero-picture="1"…"5", and the CSS takes the colors from it.
// How fast it moves: --bouncing-picture-speed in styles.css (Figma pixels per second).
//
// The screen is split in two halves (two columns), so the picture is in both halves:
// one copy in each, and each half shows only the part of it that falls inside.
// All five pictures are on the page from the start (hidden), each at its own size, so changing picture
// is only hiding one and showing the next, in the same moment: there is never a moment where the old
// picture shows at the new one's size or spot.
// The new picture takes the old one's place against the edge it hit, centered where the old one was
// along that edge (so it doesn't jump sideways).
// While the mouse is over the picture, it freezes in place, and goes on when the mouse leaves it.
// Clicking the picture plays the wave on "scroll down" at the bottom of the screen, as if the mouse were over it
// (letter-roll.js): the letters go up and come back from below, stay a moment, and then go back.
// For people who asked their computer for less motion, the first picture stays still.

(function () {
  const layers = [...document.querySelectorAll('.bouncing-picture-layer')]; // one in each half
  const main = document.querySelector('.split');
  if (layers.length === 0 || !main) return;

  // The pictures, in order: the file, its size in Figma pixels, its rounded corners
  const pictures = [
    { src: 'images/tail/1.webp', width: 313, height: 318, corners: 0 },  // Hamotzi: the holiday table
    { src: 'images/tail/2.webp', width: 380, height: 307, corners: 0 },  // trac.: the landing page on a computer
    { src: 'images/tail/3.webp', width: 337, height: 275, corners: 0 },  // Hamotzi: the knife and the challah
    { src: 'images/tail/4.webp', width: 166, height: 347, corners: 27 }, // Lets Talk About It: the app on a phone
    { src: 'images/tail/5.webp', width: 266, height: 402, corners: 0 },  // Davar Echad: the newspaper
  ];

  const rootStyle = getComputedStyle(document.documentElement);
  const speed = parseFloat(rootStyle.getPropertyValue('--bouncing-picture-speed')); // Figma pixels per second
  const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Every picture, in each half: copies[half][picture]. Only the current picture shows (.is-showing).
  const copies = layers.map((layer) => pictures.map((picture) => {
    const image = document.createElement('img');
    image.className = 'bouncing-picture';
    image.alt = '';
    image.src = picture.src;
    image.decoding = 'sync'; // ready to show at once when its turn comes
    image.style.width = `calc(${picture.width} * var(--u))`;
    image.style.height = `calc(${picture.height} * var(--u))`;
    image.style.borderRadius = `calc(${picture.corners} * var(--u))`;
    layer.appendChild(image);
    // The mouse over the picture (in either half): it freezes in place until the mouse leaves
    image.addEventListener('mouseenter', () => { isFrozen = true; });
    image.addEventListener('mouseleave', () => { isFrozen = false; });
    image.addEventListener('click', playScrollDownWave);
    return image;
  }));

  // Clicking the picture: the wave on "scroll down", as if the mouse were over it, and back after a moment
  // (long enough for the whole wave to come up, and then a pause: --scroll-down-wave-hold)
  let waveTimer = null;
  function playScrollDownWave() {
    const scrollDown = [...document.querySelectorAll('.scroll-down')];
    const letters = document.querySelectorAll('.scroll-down .roll-in .roll-letter').length;
    const rollTime = parseFloat(rootStyle.getPropertyValue('--roll-time')) * 1000;
    const stagger = parseFloat(rootStyle.getPropertyValue('--roll-stagger')) * 1000;
    const hold = parseFloat(rootStyle.getPropertyValue('--scroll-down-wave-hold')) * 1000;
    scrollDown.forEach(each => each.classList.add('is-rolling'));
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => {
      scrollDown.forEach(each => { if (!each.matches(':hover')) each.classList.remove('is-rolling'); });
    }, rollTime + stagger * letters + hold);
  }

  let isFrozen = false;            // the mouse is over the picture: it stays where it is
  let current = 0;                 // which picture is showing now
  let x = 776, y = 231;            // where its top-left corner is, in Figma pixels (the spot in the first Figma frame)
  let moveX = 1, moveY = 1;        // which way it moves: 1 = right / down, -1 = left / up

  // The size of the whole first screen (both halves together), in Figma pixels
  function screenSize() {
    const unit = window.innerWidth / 1440; // 1 Figma pixel
    const half = layers[0].getBoundingClientRect();
    return { width: 1440, height: half.height / unit, unit };
  }

  // Show the current picture (in both halves, the others hidden) and its colors
  function showPicture() {
    copies.forEach((half) => half.forEach((image, index) => image.classList.toggle('is-showing', index === current)));
    main.dataset.heroPicture = current + 1;
  }

  // Put the current picture's two copies at its spot (each one relative to its own half)
  function place() {
    const { unit } = screenSize();
    copies[0][current].style.transform = `translate(${x * unit}px, ${y * unit}px)`;          // left half
    copies[1][current].style.transform = `translate(${(x - 720) * unit}px, ${y * unit}px)`;  // right half: 720 further left
  }

  // Keep the picture inside the screen (after it changes size, or the window does)
  function keepInside() {
    const { width, height } = screenSize();
    const picture = pictures[current];
    x = Math.min(Math.max(x, 0), width - picture.width);
    y = Math.min(Math.max(y, 0), height - picture.height);
  }

  showPicture();
  keepInside();
  place();
  if (lessMotion) return; // stays still

  let lastTime = null;
  function move(now) {
    // How far to move: by the time that passed, so it moves at the same speed on every screen
    const seconds = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (isFrozen) { requestAnimationFrame(move); return; } // the mouse is over it: don't move
    const step = speed * seconds / Math.SQRT2; // slanted, so a bit less in each direction

    x += moveX * step;
    y += moveY * step;

    // Hit an edge? Bounce back from it
    const { width, height } = screenSize();
    const picture = pictures[current];
    let hit = false;
    if (x <= 0)                             { x = 0; moveX = 1; hit = true; }
    if (x + picture.width >= width)         { x = width - picture.width; moveX = -1; hit = true; }
    if (y <= 0)                             { y = 0; moveY = 1; hit = true; }
    if (y + picture.height >= height)       { y = height - picture.height; moveY = -1; hit = true; }

    // ...and change to the next picture and its colors (once, even when it hits a corner).
    // The new one sits against the same edge, centered where the old one was (then kept inside the screen).
    if (hit) {
      const centerX = x + picture.width / 2, centerY = y + picture.height / 2;
      const hitLeft = x <= 0, hitRight = x + picture.width >= width;
      const hitTop = y <= 0, hitBottom = y + picture.height >= height;
      current = (current + 1) % pictures.length;
      const next = pictures[current];
      x = hitLeft ? 0 : hitRight ? width - next.width : centerX - next.width / 2;
      y = hitTop ? 0 : hitBottom ? height - next.height : centerY - next.height / 2;
      keepInside();
      // If being kept inside put it against another edge too (a bigger picture near a corner),
      // it goes away from that edge as well, as part of the same bounce (and doesn't count as another hit)
      if (x <= 0) moveX = 1;
      if (x + next.width >= width) moveX = -1;
      if (y <= 0) moveY = 1;
      if (y + next.height >= height) moveY = -1;
      place();        // first at its spot...
      showPicture();  // ...then shown, in the same moment
    }

    place();
    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);

  // When the window changes size: keep the picture inside the new screen
  window.addEventListener('resize', () => { keepInside(); place(); });
})();
