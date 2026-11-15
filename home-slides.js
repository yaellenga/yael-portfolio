// Home page, first left screen: the changing photos.
// Every few seconds the next photo comes up from below the frame. As it rises, the current photo
// gets squished toward the top of the frame (its bottom edge rides on the new photo's top edge);
// once it is squished to a small strip, it moves up and out, and the new photo settles in the frame.
// Settings in styles.css:
//   --home-slide-stay-time   how long each photo stays
//   --home-slide-move-time   how long the change takes
//   --home-slide-squish      how small the old photo gets (share of its height) before it moves out

const frame = document.querySelector('.home-slides');
const slides = [...frame.querySelectorAll('.home-slide')];
const rootStyle = getComputedStyle(document.documentElement);
const stayTime = parseFloat(rootStyle.getPropertyValue('--home-slide-stay-time')) * 1000;
const moveTime = parseFloat(rootStyle.getPropertyValue('--home-slide-move-time')) * 1000;
const squish = parseFloat(rootStyle.getPropertyValue('--home-slide-squish'));
const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = 0;

// Slow at the start and at the end, fast in the middle
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function showNext() {
  const leaving = slides[current];
  current = (current + 1) % slides.length;
  const coming = slides[current];

  if (lessMotion) {
    // No motion: just swap the photos
    leaving.classList.remove('is-current');
    coming.classList.add('is-current');
    return;
  }

  const start = performance.now();

  function step(now) {
    const height = frame.clientHeight;
    const t = Math.min((now - start) / moveTime, 1);
    const p = easeInOut(t);              // 0 → 1: how far the change has gone
    const newTop = (1 - p) * height;     // the top edge of the photo coming up

    // The new photo rises from below the frame
    coming.style.transform = `translateY(${newTop}px)`;

    // The old photo: first squished between the top of the frame and the new photo,
    // then (once it is a small strip) pushed up and out, keeping that size
    if (newTop > squish * height) {
      leaving.style.transform = `scaleY(${newTop / height})`;
    } else {
      leaving.style.transform = `translateY(${newTop - squish * height}px) scaleY(${squish})`;
    }

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Done: the new one is the current photo; the old one goes back below the frame, out of sight
      coming.classList.add('is-current');
      leaving.classList.remove('is-current');
      coming.style.transform = '';
      leaving.style.transform = '';
    }
  }
  requestAnimationFrame(step);
}

setInterval(showNext, stayTime + moveTime);
