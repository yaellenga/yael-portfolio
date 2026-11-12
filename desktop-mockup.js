// Desktop mockup: a computer screen with a browser bar, showing a video of a website.
// The screen is drawn as if it were 1440 wide, then shrunk to fit the computer,
// so the browser bar keeps the size it has on a real computer screen.
// The website's address is written on the computer: data-site="…" in the HTML.
// It shows in the address bar, and the "open in a new tab" button opens the real website.

const virtualWidth = 1440; // the "screen resolution" the screen is drawn at

for (const computer of document.querySelectorAll('.mockup-computer')) {
  const address = computer.dataset.site;
  const screen = computer.querySelector('.mockup-screen');
  const viewport = computer.querySelector('.mockup-viewport');
  const video = computer.querySelector('.mockup-video');

  // Fill in the address bar and the "open in a new tab" button
  computer.querySelector('.mockup-new-tab').href = address;
  computer.querySelector('.mockup-address-text').textContent =
    address.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // The reload button plays the video from the start
  computer.querySelector('.mockup-reload').addEventListener('click', () => {
    video.currentTime = 0;
    video.play();
  });

  // Draw at 1440 wide and shrink it to the size of the screen
  // (the exact size, with fractions, so no sliver of the screen is left uncovered)
  function fitToScreen() {
    const size = screen.getBoundingClientRect();
    const scale = size.width / virtualWidth;
    viewport.style.width = `${virtualWidth}px`;
    viewport.style.height = `${size.height / scale}px`;
    viewport.style.transform = `scale(${scale})`;
  }
  new ResizeObserver(fitToScreen).observe(screen);
  fitToScreen();
}
