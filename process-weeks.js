// Process page (suggestion): the week on the screen now is orange in the list on the left.
// The "current" week is the last one whose top has passed the middle of the window.

(function () {
  const links = [...document.querySelectorAll('.process-week-link')];
  const weeks = links.map((link) => document.querySelector(link.getAttribute('href')));

  function markCurrentWeek() {
    let current = 0;
    weeks.forEach((week, index) => {
      if (week && week.getBoundingClientRect().top <= window.innerHeight / 2) current = index;
    });
    links.forEach((link, index) => link.classList.toggle('is-current', index === current));
  }

  window.addEventListener('scroll', markCurrentWeek, { passive: true });
  window.addEventListener('resize', markCurrentWeek);
  markCurrentWeek();
})();
