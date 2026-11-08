// About page: every click leaves a "stamp", a copy of the mouse photo, where you clicked.
// Each stamp stays for 3.5 seconds and then fades away (the timing is in styles.css).

const aboutPage = document.querySelector('.about-page');

aboutPage.addEventListener('click', (event) => {
  const unit = window.innerWidth / 1440; // 1 Figma pixel, same as --u in styles.css
  const pageBox = aboutPage.getBoundingClientRect();

  // Make a copy of the photo and place its center where the mouse was clicked.
  // The spot is saved in Figma pixels, so it stays in place if the window is resized.
  const stamp = document.createElement('img');
  stamp.src = 'images/cursor-about.png';
  stamp.alt = '';
  stamp.className = 'placed box about-stamp';
  stamp.style.setProperty('--x', (event.clientX - pageBox.left) / unit);
  stamp.style.setProperty('--y', (event.clientY - pageBox.top) / unit);
  aboutPage.appendChild(stamp);

  // When the fade has finished, take the stamp off the page
  stamp.addEventListener('animationend', () => stamp.remove());
});
