// Project page on the phone: the small app screens under the big phone.
// Tapping a small screen: a copy of it is sent out and grows into the big phone's spot (with a small bounce),
// on top of what is there now. Once it has arrived, the old one underneath is taken away (it doesn't move).
// The small screen stays where it is.
// The small screen marked data-video is the video's own: tapping it brings the video back into the big phone
// the same way (it grows out of that small screen).
// The big phone: .phone-screen-big. The small screens: .phone-screen-thumb.
// How fast: --phone-screen-send-time in styles.css.

(function () {
  const big = document.querySelector('.phone-screen-big');
  const thumbs = [...document.querySelectorAll('.phone-screen-thumb')];
  if (!big || thumbs.length === 0) return;

  const video = big.querySelector('video');
  const videoThumb = thumbs.find(thumb => thumb.hasAttribute('data-video'));

  const rootStyle = getComputedStyle(document.documentElement);
  const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sendTime = lessMotion ? 0 : parseFloat(rootStyle.getPropertyValue('--phone-screen-send-time')) * 1000;
  const sendEase = 'cubic-bezier(0.34, 1.3, 0.64, 1)'; // shoots out and goes a little past: a small bounce

  let showing = videoThumb; // the small screen whose screen is in the big phone now
  let bigCopy = null;       // the copy in the big phone (null while the video is there)
  let busy = false;         // while moving, more taps wait

  // Where a box is on the page, in pixels
  const placeOf = element => ({
    left: element.offsetLeft, top: element.offsetTop,
    width: element.offsetWidth, height: element.offsetHeight,
  });

  // A screen's shape fitted inside the big phone's spot, in the middle (the screens aren't exactly its shape)
  function fitInto(spot, shape) {
    const ratio = shape.width / shape.height;
    let width = spot.width;
    let height = width / ratio;
    if (height > spot.height) { height = spot.height; width = height * ratio; }
    return { left: spot.left + (spot.width - width) / 2, top: spot.top + (spot.height - height) / 2, width, height };
  }

  const asFrame = (place, radius = '0px') => ({
    left: `${place.left}px`, top: `${place.top}px`,
    width: `${place.width}px`, height: `${place.height}px`, borderRadius: radius,
  });

  // A copy of a small screen, laid exactly over it
  function copyOf(thumb) {
    const copy = document.createElement('div');
    copy.className = thumb.className.replace('phone-screen-thumb', 'phone-screen-copy');
    copy.innerHTML = thumb.innerHTML;
    copy.setAttribute('aria-hidden', 'true');
    Object.assign(copy.style, asFrame(placeOf(thumb)));
    thumb.parentElement.appendChild(copy);
    return copy;
  }

  function show(thumb) {
    if (busy || thumb === showing) return;
    busy = true;

    const spot = placeOf(big); // the big phone's spot (it never moves; only copies do)
    const from = placeOf(thumb);
    const oldCopy = bigCopy;

    if (thumb === videoThumb) {
      // The video grows out of its small screen, over the copy that is in the big phone now
      const bigRadius = getComputedStyle(big).borderTopLeftRadius;
      const smallRadius = `${parseFloat(bigRadius) * from.width / spot.width}px`;
      big.style.visibility = '';
      big.style.zIndex = 2; // over the old copy (and under the cream bar at the top)
      if (video) video.play();
      const send = big.animate([asFrame(from, smallRadius), asFrame(spot, bigRadius)],
        { duration: sendTime, easing: sendEase });
      bigCopy = null;
      send.finished.then(() => {
        big.style.zIndex = '';
        if (oldCopy) oldCopy.remove();
        busy = false;
      });
    } else {
      // A copy of the tapped screen grows into the big phone, over what is there now
      const copy = copyOf(thumb);
      const target = fitInto(spot, from);
      const send = copy.animate([asFrame(from), asFrame(target)], { duration: sendTime, easing: sendEase });
      Object.assign(copy.style, asFrame(target)); // stays there when the move is over
      bigCopy = copy;
      send.finished.then(() => {
        // Once it covers the big phone, take away the old one underneath
        if (oldCopy) oldCopy.remove();
        else {
          big.style.visibility = 'hidden';
          if (video) video.pause();
        }
        busy = false;
      });
    }
    showing = thumb;
  }

  thumbs.forEach(thumb => thumb.addEventListener('click', () => show(thumb)));

  // When the screen turns or changes size, the copy in the big phone is put back in the right spot
  window.addEventListener('resize', () => {
    if (bigCopy && !busy) Object.assign(bigCopy.style, asFrame(fitInto(placeOf(big), placeOf(showing))));
  });
})();
