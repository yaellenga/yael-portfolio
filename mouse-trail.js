// Home page, first screen: a tail of photos (in color) that follows the mouse.
// The photos are the files in the folder images/tail/, named by number: 1.webp, 2.webp, 3.png…
// (WebP, PNG or JPG). To add a photo, put it in the folder with the next number; nothing else to change.
// The script looks for 1, 2, 3… and stops at the first number that isn't there.
// Each photo is sized to fit in the same box (--mouse-trail-box-width × --mouse-trail-box-height, in styles.css),
// keeping its own shape, like the photos in the bank frame in Figma ("Frame 169").
// The about page has a tail too, made of its mouse picture (data-trail="about" on the area).
// While the mouse moves over the first screen (both halves), a photo is left behind it every time
// it has moved far enough that the new photo covers only --mouse-trail-overlap of the one before.
// The photos come one after the other (1, 2, 3, 4, 1, 2…). Each stays --mouse-trail-stay-time,
// then fades away (--mouse-trail-fade-time). Their size: --mouse-trail-size of the old changing photos.
// On the home page, now and then a photo comes out a bit smaller, at random (10% or 15% smaller:
// --mouse-trail-smaller, --mouse-trail-smallest), so the tail has a range of sizes.
// Only with a real mouse (not on touch screens), and not for people who asked for less motion.

(function () {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || lessMotion) return;

  const trails = [...document.querySelectorAll('.mouse-trail')]; // one layer in each half, under the text
  const areas = [...document.querySelectorAll('.mouse-trail-area')]; // the two halves of the first screen

  if (areas.length === 0) return;
  const rootStyle = getComputedStyle(document.documentElement);

  // The tails: the photos of each one, how wide each photo is (in Figma pixels),
  // its width ÷ height, and how much to shrink them all (size)
  const tails = {
    // Home: the photos from images/tail/ (found below, as they load), shrunk to --mouse-trail-size
    home: {
      size: parseFloat(rootStyle.getPropertyValue('--mouse-trail-size')),
      varySizes: true,
      folder: 'images/tail/',
      photos: [],
    },
    // About: the page's mouse picture, as big as the mouse (.cursor-about in styles.css)
    about: {
      size: 1,
      photos: [
        { src: 'images/cursor-about.webp', width: 65, ratio: 195 / 303 },
      ],
    },
  };
  const tail = tails[areas[0].dataset.trail || 'home'];
  const photos = tail.photos;
  const size = tail.size;
  const overlap = parseFloat(rootStyle.getPropertyValue('--mouse-trail-overlap')); // share that overlaps
  const stayTime = parseFloat(rootStyle.getPropertyValue('--mouse-trail-stay-time')) * 1000;

  // Now and then a smaller photo: the size of the next photo, as a share of the full size
  const smaller = parseFloat(rootStyle.getPropertyValue('--mouse-trail-smaller'));
  const smallest = parseFloat(rootStyle.getPropertyValue('--mouse-trail-smallest'));
  const smallerChance = parseFloat(rootStyle.getPropertyValue('--mouse-trail-smaller-chance'));
  function pickShare() {
    if (!tail.varySizes) return 1;
    const roll = Math.random();
    if (roll < smallerChance) return smallest;          // 15% smaller
    if (roll < smallerChance * 2) return smaller;       // 10% smaller
    return 1;                                           // the full size
  }

  let next = 0;       // which photo comes next
  let nextShare = pickShare(); // how big the next photo is (chosen once, when the photo before it is left)
  let last = null;    // where the last photo was left: { x, y, width, height }

  // Load the photos ahead of time, so they show at once
  for (const photo of photos) new Image().src = photo.src;

  // Home: find the photos in the folder, 1, 2, 3… (each as PNG, JPG or JPEG), until a number is missing.
  // Each one is sized to fit in the box, keeping its shape.
  if (tail.folder) {
    const boxWidth = parseFloat(rootStyle.getPropertyValue('--mouse-trail-box-width'));
    const boxHeight = parseFloat(rootStyle.getPropertyValue('--mouse-trail-box-height'));
    const load = (src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
    (async () => {
      for (let number = 1; ; number++) {
        let image = null;
        for (const type of ['webp', 'png', 'jpg', 'jpeg']) {
          image = await load(`${tail.folder}${number}.${type}`);
          if (image) break;
        }
        if (!image) break; // no photo with this number: that was the last one
        const fit = Math.min(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
        photos.push({
          src: image.src,
          width: image.naturalWidth * fit,
          ratio: image.naturalWidth / image.naturalHeight,
        });
      }
    })();
  }

  // The size of the next photo on the screen
  function nextSize() {
    const unit = window.innerWidth / 1440; // 1 Figma pixel
    const width = photos[next].width * size * nextShare * unit;
    return { width, height: width / photos[next].ratio };
  }

  // Leave the next photo, centered at x, y
  function leavePhoto(x, y) {
    const { width, height } = nextSize();

    // The same photo in both halves, each placed relative to its own half
    // (each half shows only the part of it that falls inside)
    for (const trail of trails) {
      const half = trail.getBoundingClientRect();
      const image = document.createElement('img');
      image.className = 'mouse-trail-photo';
      image.src = photos[next].src;
      image.alt = '';
      image.style.width = `${width}px`;
      image.style.left = `${x - width / 2 - half.left}px`;
      image.style.top = `${y - height / 2 - half.top}px`;
      trail.appendChild(image);

      // After it has stayed long enough: fade it away, then remove it
      setTimeout(() => {
        image.classList.add('is-fading');
        image.addEventListener('transitionend', () => image.remove(), { once: true });
      }, stayTime);
    }

    last = { x, y, width, height };
    next = (next + 1) % photos.length;
    nextShare = pickShare();
  }

  // How long a photo is in the direction (dx, dy): its width when moving sideways,
  // its height when moving up or down, and in between for slanted moves
  function lengthThatWay(photo, dx, dy) {
    return Math.min(
      dx === 0 ? Infinity : photo.width / Math.abs(dx),
      dy === 0 ? Infinity : photo.height / Math.abs(dy)
    );
  }

  window.addEventListener('mousemove', (event) => {
    if (photos.length === 0) return; // the photos haven't loaded yet
    const isOverFirstScreen = areas.some(area => area.contains(event.target));
    if (!isOverFirstScreen) { last = null; return; } // left the first screen: the tail starts again next time

    const x = event.clientX;
    const y = event.clientY;
    if (!last) { leavePhoto(x, y); return; }

    // The direction the mouse moved
    let dx = x - last.x;
    let dy = y - last.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) return;
    dx /= distance;
    dy /= distance;

    // Leave photos along the way, as long as the mouse is far enough for the next one.
    // From the middle of one photo to the middle of the next: half of each, minus the overlap
    // (--mouse-trail-overlap of the smaller of the two, in that direction).
    const startX = last.x;
    const startY = last.y;
    let traveled = 0;
    while (true) {
      const lastLength = lengthThatWay(last, dx, dy);
      const nextLength = lengthThatWay(nextSize(), dx, dy);
      const step = (lastLength + nextLength) / 2 - overlap * Math.min(lastLength, nextLength);
      if (traveled + step > distance) break;
      traveled += step;
      leavePhoto(startX + dx * traveled, startY + dy * traveled);
    }
  });
})();
