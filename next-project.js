// Lets Talk About It: "next project" stays in the bottom right corner of the window,
// but shows up only when the page has been scrolled to the end (and hides again when scrolling back up).

(function () {
  const link = document.querySelector('.next-project-at-end');
  if (!link) return;

  function update() {
    const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    link.classList.toggle('is-visible', atEnd);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
