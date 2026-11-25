// Every button and link in the handwriting-style font (DM Serif Display italic): on hover, its letters
// go up one after another, like a wave, and the same text comes up from below in their place
// (or another text, written in the link's data-hover-text).
// phone, email and LinkedIn bring up what they stand for instead (the number, the address, the name).
// How it moves is in styles.css (.roll, .roll-letter: --roll-time, --roll-stagger, --roll-distance).
//
// Each text is cut into letters, each letter in its own <span> with its place in the word (--i),
// so each one can start moving a moment after the one before it.

// Put a text into an element, one <span> per letter
// (firstPlace: the place of its first letter in the wave; more than 0 when the text continues another one)
function splitIntoLetters(element, text, firstPlace = 0) {
  element.textContent = '';
  [...text].forEach((character, index) => {
    const letter = document.createElement('span');
    letter.className = 'roll-letter';
    letter.style.setProperty('--i', firstPlace + index);
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

    // The text hidden below, which comes up on hover: a copy of the text, or another text
    // when the link has one in data-hover-text (home page: "selected work", "more about me")
    const coming = document.createElement('span');
    coming.className = 'roll-line roll-in';
    splitIntoLetters(coming, link.dataset.hoverText || text);

    roll.append(leaving, coming);
    link.textContent = '';
    link.appendChild(roll);
  }

  // Home page: "scroll down" at the bottom of the first screen. It isn't a button, but it has the wave too.
  // It is two texts, "scroll" in the left half and "down" in the right half, so they act as one:
  // the mouse over either one plays the wave on both, and "down" goes on where "scroll" ends.
  // (The mouse over the floating picture plays it too: bouncing-picture.js.)
  const scrollDown = [...document.querySelectorAll('.scroll-down')];
  let place = 0; // where the next text's first letter is in the wave
  for (const part of scrollDown) {
    const text = part.textContent.trim();
    const hiddenText = document.createElement('span'); // for screen readers: the word as a whole
    hiddenText.className = 'visually-hidden';
    hiddenText.textContent = text;

    const roll = document.createElement('span');
    roll.className = 'roll';
    roll.setAttribute('aria-hidden', 'true');
    const leaving = document.createElement('span');
    leaving.className = 'roll-line roll-out';
    splitIntoLetters(leaving, text, place);
    const coming = document.createElement('span');
    coming.className = 'roll-line roll-in';
    splitIntoLetters(coming, text, place);
    roll.append(leaving, coming);

    part.textContent = '';
    part.append(hiddenText, roll);
    place += text.length + 1; // and a space between the two words

    part.addEventListener('mouseenter', () => scrollDown.forEach(each => each.classList.add('is-rolling')));
    part.addEventListener('mouseleave', () => scrollDown.forEach(each => each.classList.remove('is-rolling')));
  }
})();
