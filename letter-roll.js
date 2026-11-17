// Every button and link in the handwriting-style font (DM Serif Display italic): on hover, its letters
// go up one after another, like a wave, and the same text comes up from below in their place.
// phone, email and LinkedIn bring up what they stand for instead (the number, the address, the name).
// How it moves is in styles.css (.roll, .roll-letter: --roll-time, --roll-stagger, --roll-distance).
//
// Each text is cut into letters, each letter in its own <span> with its place in the word (--i),
// so each one can start moving a moment after the one before it.

// Put a text into an element, one <span> per letter
function splitIntoLetters(element, text) {
  element.textContent = '';
  [...text].forEach((character, index) => {
    const letter = document.createElement('span');
    letter.className = 'roll-letter';
    letter.style.setProperty('--i', index);
    letter.textContent = character;
    element.appendChild(letter);
  });
}

(function () {
  // phone, email, LinkedIn: the word and what it stands for are already two texts in the same spot
  // (.top-link-label and .top-link-reveal): cut both into letters
  for (const link of document.querySelectorAll('.top-link-swap')) {
    for (const part of link.querySelectorAll('.top-link-label, .top-link-reveal')) {
      splitIntoLetters(part, part.textContent.trim());
    }
  }

  // How wide each of them is, closed and open: at least the width of the word and of what it stands for
  // (measured, so the whole word, number, address or name always shows, whatever the font, the screen
  // and the browser), and a little more for the slant of the italics
  function measureOpenWidths() {
    for (const link of document.querySelectorAll('.top-link-swap')) {
      const label = link.querySelector('.top-link-label');
      const reveal = link.querySelector('.top-link-reveal');
      const room = parseFloat(getComputedStyle(link).fontSize) * 0.3;
      link.style.transition = 'none'; // take the new width at once (no sliding when the page opens)
      link.style.setProperty('--closed-px', `${label.offsetWidth + room}px`);
      link.style.setProperty('--open-px', `${reveal.offsetWidth + room}px`);
      link.offsetWidth; // makes the browser apply it now
      link.style.transition = '';
    }
  }
  measureOpenWidths();
  document.fonts.ready.then(measureOpenWidths); // the widths change once the font has loaded
  window.addEventListener('resize', measureOpenWidths);

  // Every other link in this font: the text, and a copy of it under it
  const links = document.querySelectorAll('a.handwriting-link, a.top-link:not(.top-link-swap)');
  for (const link of links) {
    const text = link.textContent.trim();
    if (!link.hasAttribute('aria-label')) link.setAttribute('aria-label', text); // read once, as a whole

    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');

    const leaving = document.createElement('span');  // the text you see; it goes up on hover
    leaving.className = 'roll-line roll-out';
    splitIntoLetters(leaving, text);

    const coming = document.createElement('span');   // its copy, hidden below; it comes up on hover
    coming.className = 'roll-line roll-in';
    splitIntoLetters(coming, text);

    roll.append(leaving, coming);
    link.textContent = '';
    link.appendChild(roll);
  }
})();
