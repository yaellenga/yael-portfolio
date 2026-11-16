// Project page, side column: a text in parts, longer than its spot (.side-text-window).
// Each part fits in the spot, and the spot shows one part at a time.
// Each part after the first belongs to a picture on the right (data-appears-with="…").
// When the top of that picture reaches the middle of the window, the text moves up to that part
// by itself, with a small bounce, however the page goes on scrolling (the movement and the bounce
// are the transition in styles.css, .side-text-track). Scrolling back up brings the earlier part back.

const textWindows = [...document.querySelectorAll('.side-text-window')];

function showParts() {
  const middle = window.innerHeight / 2;

  for (const textWindow of textWindows) {
    const track = textWindow.querySelector('.side-text-track');
    const parts = [...track.children];

    // The last part whose picture has reached the middle of the window (the first part if none)
    let current = parts[0];
    for (const part of parts) {
      const picture = part.dataset.appearsWith && document.querySelector(part.dataset.appearsWith);
      if (picture && picture.getBoundingClientRect().top <= middle) current = part;
    }

    // Move the text up so that this part starts at the top of the spot
    // (measured from the first part, which sits at the top when the text hasn't moved)
    track.style.transform = `translateY(${parts[0].offsetTop - current.offsetTop}px)`;
  }
}

window.addEventListener('scroll', showParts, { passive: true });
window.addEventListener('resize', showParts);
document.fonts.ready.then(showParts); // the parts' spots change once the font has loaded
showParts();
