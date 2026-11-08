// Stamps: every click in a "stamp area" leaves a stamp, a copy of the about mouse photo, where you clicked.
// Used on the about page (the whole page) and in the style guide (a try-it box).
// Each stamp stays for 3.5 seconds and then fades away (the timing is in styles.css).

for (const area of document.querySelectorAll('.stamp-area')) {
  area.addEventListener('click', (event) => {
    // No stamp when clicking a link (there the regular mouse is showing)
    if (event.target.closest('a')) return;

    const unit = window.innerWidth / 1440; // 1 Figma pixel, same as --u in styles.css
    const areaBox = area.getBoundingClientRect();

    // Make a copy of the photo and place its center where the mouse was clicked.
    // The spot is saved in Figma pixels, so it stays in place if the window is resized.
    const stamp = document.createElement('img');
    stamp.src = 'images/cursor-about.png';
    stamp.alt = '';
    stamp.className = 'placed box about-stamp';
    stamp.style.setProperty('--x', (event.clientX - areaBox.left) / unit);
    stamp.style.setProperty('--y', (event.clientY - areaBox.top) / unit);
    area.appendChild(stamp);

    // When the fade has finished, take the stamp off the page
    stamp.addEventListener('animationend', () => stamp.remove());
  });
}
