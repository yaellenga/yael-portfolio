// Desktop mockup: a computer screen that shows a real website, live.
// The website is drawn as if on a 1440-wide screen, then shrunk to fit the computer,
// so it shows its real desktop layout instead of a squeezed one.
// The website's address is written on the computer: data-site="…" in the HTML.

const virtualWidth = 1440; // the "screen resolution" the website is drawn at

for (const computer of document.querySelectorAll('.mockup-computer')) {
  const address = computer.dataset.site;
  const screen = computer.querySelector('.mockup-screen');
  const viewport = computer.querySelector('.mockup-viewport');
  const frame = computer.querySelector('.mockup-frame');
  const loader = computer.querySelector('.mockup-loader');

  // Load the website, and fill in the address bar and the "open in a new tab" button
  frame.src = address;
  computer.querySelector('.mockup-new-tab').href = address;
  computer.querySelector('.mockup-address-text').textContent =
    address.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Hide the spinner once the website has loaded
  frame.addEventListener('load', () => loader.classList.add('is-hidden'));

  // The reload button loads the website again
  computer.querySelector('.mockup-reload').addEventListener('click', () => {
    loader.classList.remove('is-hidden');
    frame.src = address;
  });

  // Draw at 1440 wide and shrink it to the size of the screen
  function fitToScreen() {
    const scale = screen.clientWidth / virtualWidth;
    viewport.style.width = `${virtualWidth}px`;
    viewport.style.height = `${screen.clientHeight / scale}px`;
    viewport.style.transform = `scale(${scale})`;
  }
  new ResizeObserver(fitToScreen).observe(screen);
  fitToScreen();
}
