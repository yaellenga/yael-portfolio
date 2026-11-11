// Project page, top area: when "More stuff" or "Yael Lenga" is clicked,
// the two of them first slide to the spots where "Cool stuff by" and "Yael Lenga"
// sit on the about page, and only then the browser goes to the page that was clicked.
// (How long the slide takes is --nav-slide-time in styles.css.)

const moreStuff = document.querySelector('.top-more-stuff');
const myName = document.querySelector('.top-my-name');

// The spot (--x, --y in Figma pixels) of an item on the about page, read from its class in styles.css,
// so it always matches the about page
function aboutSpot(className) {
  const probe = document.createElement('p');
  probe.className = className;
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const spot = { x: Number(style.getPropertyValue('--x')), y: Number(style.getPropertyValue('--y')) };
  probe.remove();
  return spot;
}

// Slide an item so that its top-left corner reaches that spot
function slideTo(item, spot) {
  const unit = window.innerWidth / 1440; // 1 Figma pixel, same as --u in styles.css
  const box = item.getBoundingClientRect();
  item.style.transform = `translate(${spot.x * unit - box.left}px, ${spot.y * unit - box.top}px)`;
}

function slideToAboutSpots(event) {
  // Let the browser handle it as usual for "open in a new tab" clicks
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  // People who asked their computer for less motion go straight to the page
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  event.preventDefault();
  const address = event.currentTarget.href;

  // Each one moves from where it is now to its spot on the about page
  slideTo(moreStuff, aboutSpot('about-cool-stuff'));
  slideTo(myName, aboutSpot('about-my-name'));

  // When they get there, go to the page
  const goToPage = () => { window.location.href = address; };
  moreStuff.addEventListener('transitionend', goToPage, { once: true });
  // Just in case the browser doesn't report the end of the slide: go anyway, a moment after it should end
  const slideTime = parseFloat(getComputedStyle(moreStuff).transitionDuration) * 1000;
  setTimeout(goToPage, slideTime + 200);
}

for (const link of document.querySelectorAll('.top-more-stuff a, .top-my-name a')) {
  link.addEventListener('click', slideToAboutSpots);
}

// Coming back with the browser's Back button: put them back in their places at once (no slide)
window.addEventListener('pageshow', () => {
  for (const item of [moreStuff, myName]) {
    item.style.transition = 'none';
    item.style.transform = '';
    item.offsetWidth; // makes the browser apply it now
    item.style.transition = '';
  }
});
