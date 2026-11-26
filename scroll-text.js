// Project page, side column: a text that grows (.side-text-stack, on trac. and Lets Talk About It).
// The first paragraph shows from the start. Each paragraph after it (.side-text-more) belongs to a picture
// on the right (data-appears-with="…"). When the top of that picture reaches the middle of the window,
// the paragraph opens under the text (.is-shown) and pushes the text and the title up
// (the opening is the transition in styles.css, .side-text-more). Scrolling back up closes it again.
// With data-appears-at="first-line", it opens when its picture (or note) reaches the spot where the paragraph's
// first line will be once it is open, so the two lines are side by side at that moment.

const growingParagraphs = [...document.querySelectorAll('.side-text-stack .side-text-more')];

function showParagraphs() {
  for (const paragraph of growingParagraphs) {
    const picture = document.querySelector(paragraph.dataset.appearsWith);
    const line = paragraph.dataset.appearsAt === 'first-line' ? firstLineSpot(paragraph) : window.innerHeight / 2;
    paragraph.classList.toggle('is-shown', !!picture && picture.getBoundingClientRect().top <= line);
  }
}

// Where the top of the paragraph's first line will be once it is open (from the top of the window).
// The text sits at the bottom of the column, so its bottom stays in place and a new paragraph fills in above it:
// the bottom of the text, minus the paragraph's full height, plus the space above it (its ::before, in styles.css).
function firstLineSpot(paragraph) {
  const text = paragraph.firstElementChild;
  const spaceAbove = parseFloat(getComputedStyle(text, '::before').height) || 0;
  const bottom = paragraph.closest('.side-text-stack').getBoundingClientRect().bottom;
  return bottom - text.scrollHeight + spaceAbove;
}

window.addEventListener('scroll', showParagraphs, { passive: true });
window.addEventListener('resize', showParagraphs);
showParagraphs();
