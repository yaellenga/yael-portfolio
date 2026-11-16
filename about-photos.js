// About page: photos of me in a rectangle, one at a time.
// Each photo stays --about-photo-time (3 seconds, in styles.css); then the next one comes up from
// below and pushes it out at the top, with a small bounce (--about-photo-switch-time).
// After the last photo comes the first one again, as if they were on a wheel: the list gets
// a copy of the first photo at its end, and once the copy is in place the list jumps back
// to the real first photo, which looks exactly the same, so the jump can't be seen.

(function () {
  const box = document.querySelector('.about-photos');
  if (!box) return;
  const track = box.querySelector('.about-photos-track');
  const photos = [...track.children];
  if (photos.length < 2) return;

  // The copy of the first photo, at the end
  const copyOfFirst = photos[0].cloneNode(true);
  copyOfFirst.setAttribute('aria-hidden', 'true');
  track.appendChild(copyOfFirst);

  const rootStyle = getComputedStyle(document.documentElement);
  const stayTime = parseFloat(rootStyle.getPropertyValue('--about-photo-time')) * 1000;

  let current = 0; // which photo is showing

  // Move the list up so that photo number "index" is in the rectangle
  function showPhoto(index) {
    track.style.transform = `translateY(${-index * 100}%)`;
  }

  const switchTime = parseFloat(rootStyle.getPropertyValue('--about-photo-switch-time')) * 1000;
  const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Jump back to the real first photo, without moving (it looks exactly like the copy)
  function backToFirst() {
    track.style.transition = 'none';
    current = 0;
    showPhoto(current);
    track.offsetHeight; // makes the browser apply it now
    track.style.transition = '';
  }

  function nextPhoto() {
    current += 1;
    showPhoto(current);
    // The copy of the first photo is coming in: once it is in place, jump back to the real one
    if (current === photos.length) setTimeout(backToFirst, lessMotion ? 0 : switchTime + 50);
  }

  setInterval(nextPhoto, stayTime);
})();
