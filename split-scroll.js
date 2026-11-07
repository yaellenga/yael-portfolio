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
