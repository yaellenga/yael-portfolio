// Project page, side column: a text that is longer than its spot (.side-text-window).
// The spot is a window onto the text. While the page scrolls, the text moves up inside it,
// like a normal scroll: new lines come in at the bottom and push the old ones out at the top.
// At the top of the page the text shows from its start; at the end of the page, its end.

const textWindows = [...document.querySelectorAll('.side-text-window')];

function scrollTexts() {
  // How far down the page is: 0 = at the top, 1 = at the end
  const pageScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = pageScroll > 0 ? Math.min(Math.max(window.scrollY / pageScroll, 0), 1) : 0;

  for (const textWindow of textWindows) {
    const track = textWindow.querySelector('.side-text-track');
    // How much of the text doesn't fit in the window: that is how far it moves
    const hidden = Math.max(track.offsetHeight - textWindow.clientHeight, 0);
    track.style.transform = `translateY(${-progress * hidden}px)`;
  }
}

window.addEventListener('scroll', scrollTexts, { passive: true });
window.addEventListener('resize', scrollTexts);
window.addEventListener('load', scrollTexts); // once the pictures have their sizes (the page's length)
document.fonts.ready.then(scrollTexts);       // the text's height changes once the font has loaded
scrollTexts();
