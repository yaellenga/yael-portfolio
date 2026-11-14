// Videos with data-play-when-seen start playing as soon as any part of them
// comes into the window (when the page is scrolled down to them), and not before.
// (They are muted, so the browser lets them start by themselves.)

let videosWaiting = [...document.querySelectorAll('video[data-play-when-seen]')];

function startVideosInView() {
  videosWaiting = videosWaiting.filter((video) => {
    const box = video.getBoundingClientRect();
    const inView = box.top < window.innerHeight && box.bottom > 0; // any part of it is in the window
    if (inView) video.play();
    return !inView; // keep waiting only for the ones not seen yet
  });
}

window.addEventListener('scroll', startVideosInView, { passive: true });
window.addEventListener('resize', startVideosInView);
startVideosInView(); // in case one is already in the window when the page opens
