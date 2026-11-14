// Project page with two side columns (lets-talk.html): while the page scrolls,
// the left column goes UP and the right column goes DOWN, at the same speed
// (like the two halves of the home page).
//
// The page scrolls just far enough for both columns to show everything:
// - the left column until its last phone is in view (with --side-column-end-space under it),
// - the right column until its top phone has come all the way down into view.

const leftTrack = document.querySelector('.side-column-left .side-column-track');
const rightTrack = document.querySelector('.side-column-right .side-column-track');
const scrollSpace = document.querySelector('.side-scroll-space');

let scrollLength = 0; // how far the page can scroll, in pixels

function measure() {
  const unit = window.innerWidth / 1440; // 1 Figma pixel, same as --u in styles.css
  const endSpace = Number(getComputedStyle(document.body).getPropertyValue('--side-column-end-space')) * unit;
  const columnHeight = leftTrack.clientHeight;

  const leftItems = [...leftTrack.children];
  const rightItems = [...rightTrack.children];

  // Left: the bottom of its last phone
  const leftBottom = Math.max(...leftItems.map(item => item.offsetTop + item.offsetHeight));
  // Right: the top of its highest phone (above the column), and where the first phone sits
  const rightTop = Math.min(...rightItems.map(item => item.offsetTop));
  const firstSpot = Math.min(...leftItems.map(item => item.offsetTop));

  const leftNeeds = leftBottom + endSpace - columnHeight;
  const rightNeeds = firstSpot - rightTop;
  scrollLength = Math.max(leftNeeds, rightNeeds, 0);

  scrollSpace.style.height = `${window.innerHeight + scrollLength}px`;
  moveColumns();
}

function moveColumns() {
  const scrolled = Math.min(Math.max(window.scrollY, 0), scrollLength);
  leftTrack.style.transform = `translateY(${-scrolled}px)`;
  rightTrack.style.transform = `translateY(${scrolled}px)`;
}

window.addEventListener('scroll', moveColumns, { passive: true });
window.addEventListener('resize', measure);
window.addEventListener('load', measure); // once the images have their sizes
measure();
