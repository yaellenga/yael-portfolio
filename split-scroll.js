// Home page: moves the two columns in opposite directions while you scroll.
// The left column goes up and the right column goes down, at the same speed.

const leftColumn = document.querySelector('.split-left');
const rightColumn = document.querySelector('.split-right');

function moveColumns() {
  const scrolled = window.scrollY; // how far the page has been scrolled, in pixels
  leftColumn.style.transform = `translateY(${-scrolled}px)`;
  rightColumn.style.transform = `translateY(${scrolled}px)`;
}

window.addEventListener('scroll', moveColumns, { passive: true });
moveColumns(); // also set the right position when the page first loads

// Keyboard (Tab key): the columns don't scroll by themselves, so the browser
// can't bring a selected link into view. Scroll the page to its screen instead.
document.addEventListener('focusin', (event) => {
  const screen = event.target.closest('.screen');
  if (!screen) return;

  const column = screen.parentElement;
  const screens = [...column.children];
  const number = screens.indexOf(screen); // 0 = the top screen of its column
  const screenHeight = screen.offsetHeight;

  // The left column shows its top screen first; the right column shows its bottom screen first
  const screensDown = column === leftColumn ? number : screens.length - 1 - number;
  window.scrollTo({ top: screensDown * screenHeight });
});
