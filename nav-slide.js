// Project page, top area: when "More stuff" or "Yael Lenga" is clicked,
// the two of them first slide sideways (keeping their height on the screen) toward the middle
// of the window until their texts touch, and only then the browser goes to the page that was clicked.
// (How long the slide takes is --nav-slide-time in styles.css.)

const moreStuff = document.querySelector('.top-more-stuff');
const myName = document.querySelector('.top-my-name');

// Slide the two sideways so that they meet in the middle of the window, touching
function slideTogether() {
  // The texts themselves (the links), not their boxes, so that the letters touch
  const leftText = moreStuff.querySelector('a').getBoundingClientRect();
  const rightText = myName.querySelector('a').getBoundingClientRect();

  // Side by side, both together centered in the window
  const leftSpot = (window.innerWidth - (leftText.width + rightText.width)) / 2;
  const rightSpot = leftSpot + leftText.width;

  moreStuff.style.transform = `translateX(${leftSpot - leftText.left}px)`;
  myName.style.transform = `translateX(${rightSpot - rightText.left}px)`;
}

function slideTogetherAndGo(event) {
  // Let the browser handle it as usual for "open in a new tab" clicks
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  // People who asked their computer for less motion go straight to the page
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  event.preventDefault();
  const address = event.currentTarget.href;

  // They slide toward each other until they touch
  slideTogether();

  // When they get there, go to the page
  const goToPage = () => { window.location.href = address; };
  moreStuff.addEventListener('transitionend', goToPage, { once: true });
  // Just in case the browser doesn't report the end of the slide: go anyway, a moment after it should end
  const slideTime = parseFloat(getComputedStyle(moreStuff).transitionDuration) * 1000;
  setTimeout(goToPage, slideTime + 200);
}

for (const link of document.querySelectorAll('.top-more-stuff a, .top-my-name a')) {
  link.addEventListener('click', slideTogetherAndGo);
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
