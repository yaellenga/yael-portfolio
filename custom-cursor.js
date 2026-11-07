// Home page: shows a special mouse over each project screen.
// A screen gets one by having data-cursor="name" in the HTML.
// Each name has a picture (listed below) and a size (.cursor-name in styles.css).

const cursorPictures = {
  'trac': 'images/cursor-trac.svg',
  'lets-talk': 'images/cursor-lets-talk.svg',
  'hamotzi': 'images/cursor-hamotzi.png',
};

const projectCursor = document.querySelector('.project-cursor');
let mouseX = -1000; // where the mouse is, in pixels (starts off screen)
let mouseY = -1000;

// Show the right mouse for whatever is under the pointer, or hide it
function updateCursor() {
  const underMouse = document.elementFromPoint(mouseX, mouseY);
  const screen = underMouse ? underMouse.closest('[data-cursor]') : null;

  if (screen) {
    const name = screen.dataset.cursor;
    projectCursor.src = cursorPictures[name];
    projectCursor.className = `project-cursor cursor-${name} is-visible`;
    // Move it so its center sits on the pointer
    projectCursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  } else {
    projectCursor.classList.remove('is-visible');
  }
}

// When the mouse moves, remember where it is
document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  updateCursor();
});

// When scrolling, the screens slide under a still mouse, so check again
window.addEventListener('scroll', updateCursor, { passive: true });

// When the mouse leaves the window, hide the special mouse
document.addEventListener('mouseleave', () => {
  projectCursor.classList.remove('is-visible');
});
