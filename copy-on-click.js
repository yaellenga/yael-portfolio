// Project pages, top right: clicking the phone number or the email address copies it
// instead of calling or opening an email. The text changes for a moment ("number copied",
// "email copied", from data-copied-text in the HTML, in the same font), then goes back.
// (How long it stays: --email-copied-time in styles.css.)

const copiedTime = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--email-copied-time')) * 1000;

for (const link of document.querySelectorAll('[data-copied-text]')) {
  const text = link.querySelector('.top-link-reveal');
  const value = link.getAttribute('href').replace(/^(mailto|tel):/, ''); // the address or the number
  const original = text.textContent;
  let timer = null;

  link.addEventListener('click', async (event) => {
    event.preventDefault(); // don't call or open the email program

    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      // Older browsers: copy through a hidden text box
      const box = document.createElement('textarea');
      box.value = value;
      box.style.position = 'fixed';
      box.style.opacity = '0';
      document.body.appendChild(box);
      box.select();
      document.execCommand('copy');
      box.remove();
    }

    text.textContent = link.dataset.copiedText;
    clearTimeout(timer);
    timer = setTimeout(() => { text.textContent = original; }, copiedTime);
  });
}
