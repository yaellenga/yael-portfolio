// Style guide: reads the color and spacing variables straight from styles.css
// and shows each one, so the guide always matches the file.

// Which group each color belongs to, by the word after "--color-"
const colorGroups = {
  'background': 'Basic', 'brown': 'Basic', 'white': 'Basic', 'black': 'Basic',
  'project': 'Shared by every project',
  'trac': 'trac.',
  'hamotzi': 'Hamotzi',
  'focus': 'Keyboard focus',
  'home': 'Home page',
  'about': 'About page',
  'entry': 'Process page',
};

// Collect every variable written in the :root rule of styles.css, in order
function readVariables() {
  const variables = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; } // skip font files from Google
    for (const rule of rules) {
      if (rule.selectorText !== ':root') continue;
      for (const name of rule.style) {
        if (name.startsWith('--')) {
          variables.push({ name, value: rule.style.getPropertyValue(name).trim() });
        }
      }
    }
  }
  return variables;
}

// A line of text with a class from styles.css
function makeText(className, text) {
  const p = document.createElement('p');
  p.className = className;
  p.textContent = text;
  return p;
}

const variables = readVariables();

// ---------- Colors: one square per color, in groups ----------
const colorsArea = document.querySelector('#guide-colors');
const groupBoxes = {};

for (const { name, value } of variables.filter(v => v.name.startsWith('--color-'))) {
  const groupName = colorGroups[name.split('-')[3]] || 'Other';

  // Make the group the first time one of its colors shows up
  if (!groupBoxes[groupName]) {
    const group = document.createElement('div');
    group.className = 'guide-group';
    group.appendChild(makeText('project-bold-text', groupName));
    const swatches = document.createElement('div');
    swatches.className = 'guide-swatches';
    group.appendChild(swatches);
    colorsArea.appendChild(group);
    groupBoxes[groupName] = swatches;
  }

  const swatch = document.createElement('div');
  swatch.className = 'guide-swatch';
  const square = document.createElement('div');
  square.className = 'guide-swatch-color';
  square.style.setProperty('--swatch', `var(${name})`);
  swatch.append(square, makeText('project-text', name), makeText('project-text', value));
  groupBoxes[groupName].appendChild(swatch);
}

// ---------- Spacing: one bar per distance of the scale ----------
// (only the general scale; the Process page's own distances are left out)
const spacingArea = document.querySelector('#guide-spacing');
const spacingScale = /^--space-(small|medium|large|extra-large)$/;

for (const { name, value } of variables.filter(v => spacingScale.test(v.name))) {
  const row = document.createElement('div');
  row.className = 'guide-space';
  const bar = document.createElement('div');
  bar.className = 'guide-space-bar';
  bar.style.setProperty('--space-value', `var(${name})`);
  row.append(bar, makeText('project-text', `${name}   ${value}`));
  spacingArea.appendChild(row);
}

// ---------- Project page, left half: one bar per spot ----------
// These are plain Figma pixels, so the bar is the number × --u long
const projectLeftArea = document.querySelector('#guide-project-left');

for (const { name, value } of variables.filter(v => v.name.startsWith('--project-left-'))) {
  const row = document.createElement('div');
  row.className = 'guide-space';
  const bar = document.createElement('div');
  bar.className = 'guide-space-bar';
  bar.style.setProperty('--space-value', `calc(var(${name}) * var(--u))`);
  row.append(bar, makeText('project-text', `${name}   ${value}`));
  projectLeftArea.appendChild(row);
}

// ---------- Project page, new layout: top area and text column ----------
const projectTopArea = document.querySelector('#guide-project-top');

for (const { name, value } of variables.filter(v => v.name.startsWith('--project-top-') || v.name.startsWith('--project-texts-'))) {
  const row = document.createElement('div');
  row.className = 'guide-space';
  const bar = document.createElement('div');
  bar.className = 'guide-space-bar';
  bar.style.setProperty('--space-value', `calc(var(${name}) * var(--u))`);
  row.append(bar, makeText('project-text', `${name}   ${value}`));
  projectTopArea.appendChild(row);
}
