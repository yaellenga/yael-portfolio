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

// Coming back from a project page ("More stuff"): open the home page at that project's screens,
// not at the beginning, and a bit further down, so a little of the next project already shows. The project page leaves its name behind (nav-slide.js, "home-return-to");
// here we find the left screen that links to it and scroll that many screens down.
(function goBackToProject() {
  let projectPage = null;
  try {
    projectPage = sessionStorage.getItem('home-return-to');
    sessionStorage.removeItem('home-return-to'); // only once: a refresh starts at the beginning
  } catch (error) { return; } // the browser doesn't allow storage: just start at the beginning
  if (!projectPage) return;

  const screens = [...leftColumn.children];
  const number = screens.findIndex(screen => screen.getAttribute('href') === projectPage);
  if (number < 1) return;

  // A bit further than the project, so the top of the next project already shows
  // (--home-return-peek: a share of the window height; the last project has nothing after it)
  const peek = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--home-return-peek'));
  const top = (number + peek) * screens[number].offsetHeight;
  window.scrollTo({ top, behavior: 'instant' });
  moveColumns();

  // No opening bounce (scroll-hint.js) when coming back
  document.documentElement.dataset.hintFrom = 'none';
})();

// "Cool stuff by" (on hover: "Selected work"): instead of opening the home page again,
// the page scrolls down smoothly to the first project, trac. (the left screen that links to trac.html)
(function scrollToSelectedWork() {
  const link = document.querySelector('.cool-stuff a');
  const screens = [...leftColumn.children];
  const number = screens.findIndex(screen => screen.getAttribute('href') === 'trac.html');
  if (!link || number < 1) return;

  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; // "open in a new tab": as usual
    event.preventDefault();
    const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: number * screens[number].offsetHeight, behavior: lessMotion ? 'instant' : 'smooth' });
  });
})();
