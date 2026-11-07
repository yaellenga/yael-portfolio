// Home page: moves the two columns in opposite directions while you scroll.
// The left column goes up and the right column goes down, at the same speed.

const leftColumn = document.querySelector('.split-left');
const rightColumn = document.querySelector('.split-right');
const firstScreen = document.querySelector('.screen');

function moveColumns() {
  const scrolled = window.scrollY; // how far the page has been scrolled, in pixels
  leftColumn.style.transform = `translateY(${-scrolled}px)`;
  rightColumn.style.transform = `translateY(${scrolled}px)`;
}

// The Figma screens are 964 tall at 1440 wide. When the window is taller than that,
// the photos grow so they still fill their screen.
function fitPhotos() {
  const figmaPixel = window.innerWidth / 1440;
  const figmaScreenHeight = 964 * figmaPixel;
  const scale = Math.max(1, firstScreen.offsetHeight / figmaScreenHeight);
  document.documentElement.style.setProperty('--cover-scale', scale);
}

window.addEventListener('scroll', moveColumns, { passive: true });
window.addEventListener('resize', fitPhotos);
fitPhotos();
moveColumns(); // also set the right position when the page first loads
