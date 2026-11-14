// Project page: the texts in the left column move DOWN while the page scrolls
// (the right panel moves up, like the two halves of the home page).
//
// The first text sits at the bottom and never moves.
// Each of the others belongs to a part of the right panel (data-appears-with):
// - it starts coming down from the top of the column a little after that part comes into the window
//   (--project-texts-wait in styles.css),
// - it slides down slowly, and stops at its own spot from Figma when that part reaches the top
//   of the panel, under the top area. Its spot is --stop-from-bottom: how far its top is
//   from the bottom of the window, in Figma pixels.
// So at the end of the scroll every text is in its Figma spot, and none of them ever covers another.
// When the window is too short for all the spots (the top text would hide under the top area),
// the gaps between the texts shrink just enough so that every text can be seen
// (with --project-texts-top-space left free above the top text).

const textColumn = document.querySelector('.project-texts');
const textBoxes = [...textColumn.querySelectorAll('.stack-box')]; // in reading order
const firstBox = textBoxes[0];
const movingBoxes = textBoxes.slice(1);

function stackTexts() {
  const unit = window.innerWidth / 1440; // 1 Figma pixel, same as --u in styles.css
  const wait = Number(getComputedStyle(document.documentElement).getPropertyValue('--project-texts-wait')) * unit;
  const columnTop = textColumn.getBoundingClientRect().top; // where the panel shows, under the top area
  const columnHeight = textColumn.clientHeight;

  const topSpace = Number(getComputedStyle(document.documentElement).getPropertyValue('--project-texts-top-space')) * unit;

  // The gap above each text in Figma: from the bottom of the next text to its top
  const heights = movingBoxes.map(box => box.offsetHeight);
  const figmaTops = movingBoxes.map(box =>
    columnHeight - Number(getComputedStyle(box).getPropertyValue('--stop-from-bottom')) * unit);
  const gaps = figmaTops.map((top, i) => (i === 0 ? firstBox.offsetTop : figmaTops[i - 1]) - (top + heights[i]));

  // If the top text would not fit, shrink all the gaps by the same share,
  // but never below --project-texts-min-gap
  const minGap = Number(getComputedStyle(document.documentElement).getPropertyValue('--project-texts-min-gap')) * unit;
  const sumHeights = heights.reduce((a, b) => a + b, 0);
  const sumExtra = gaps.reduce((a, gap) => a + Math.max(gap - minGap, 0), 0); // the part of the gaps that can go
  const roomForExtra = firstBox.offsetTop - topSpace - sumHeights - minGap * gaps.length;
  const shrink = sumExtra > 0 ? Math.min(Math.max(roomForExtra / sumExtra, 0), 1) : 1;
  const gapAbove = gap => (gap > minGap ? minGap + (gap - minGap) * shrink : gap);

  let limitTop = firstBox.offsetTop; // the top of the text before it, right now (never go past it)
  let spotBelow = firstBox.offsetTop; // the end spot of the text before it

  movingBoxes.forEach((box, i) => {
    const height = heights[i];
    // Its end spot, measured from the top of the column: the Figma spot, or closer to the text before it
    const stopTop = spotBelow - gapAbove(gaps[i]) - height;
    spotBelow = stopTop;

    // The part of the panel this text belongs to: its top, measured from the top of the page
    const part = document.querySelector(box.dataset.appearsWith);
    const partTop = part.getBoundingClientRect().top + window.scrollY;

    const startScroll = partTop - window.innerHeight + wait; // a little after the part comes into the window
    const endScroll = partTop - columnTop;                   // the part reaches the top of the panel

    // How far along the way the text is: 0 = still hidden above the column, 1 = in its spot
    const progress = Math.min(Math.max((window.scrollY - startScroll) / (endScroll - startScroll), 0), 1);

    const startTop = -height; // just above the column, hidden
    let top = startTop + progress * (stopTop - startTop);
    top = Math.min(top, limitTop - height); // never cover the text before it

    box.style.transform = `translateY(${top}px)`;
    limitTop = top;
  });
}

window.addEventListener('scroll', stackTexts, { passive: true });
window.addEventListener('resize', stackTexts);
stackTexts();
document.fonts.ready.then(stackTexts); // the heights change once the font has loaded
