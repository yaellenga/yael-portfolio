// Video player (Hamotzi page): a play button in the middle of the video,
// and an enlarge button in its corner.
// - Play: plays the video. Clicking the video while it plays pauses it, and the play button comes back.
// - Enlarge: the video moves to the middle of the screen, bigger, and the rest of the screen dims.
//   The same button, a click on the dimmed screen, or the Esc key make it small again.
// - Time bar: shows how far the video has played. Drag it, or click on it, to move forward or back.
//   With the keyboard: the arrow keys move 5 seconds.
// - On the computer (with a real mouse), over the video the mouse becomes the word "play" or "pause"
//   (what a click will do), in the handwriting-style font, instead of the play button in the middle.
//   Over the time bar and the enlarge button the mouse is the usual one. Not on touch screens.

// The word that takes the mouse's place over a video (one for the page, made only with a real mouse)
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let mouseWord = null;
if (canHover) {
  mouseWord = document.createElement('span');
  mouseWord.className = 'video-mouse-word';
  mouseWord.setAttribute('aria-hidden', 'true');
  document.body.appendChild(mouseWord);
}

for (const player of document.querySelectorAll('.video-player')) {
  const video = player.querySelector('.video-player-video');
  const playButton = player.querySelector('.video-play');
  const enlargeButton = player.querySelector('.video-enlarge');
  const backdrop = document.querySelector('.video-backdrop');

  // Play and pause
  playButton.addEventListener('click', () => video.play());
  video.addEventListener('click', () => (video.paused ? video.play() : video.pause()));

  // Hide the play button while the video plays, show it again when it stops
  video.addEventListener('play', () => player.classList.add('is-playing'));
  video.addEventListener('pause', () => player.classList.remove('is-playing'));
  video.addEventListener('ended', () => player.classList.remove('is-playing'));

  // The mouse as a word over the video: "play" when it is stopped, "pause" while it plays
  // (only in the computer version of the page: the phone version has no special mice)
  if (mouseWord && !player.closest('.phone-project')) {
    player.classList.add('has-mouse-word'); // (styles.css hides the usual mouse and the play button)
    const showWord = (event) => {
      mouseWord.textContent = video.paused ? 'play' : 'pause';
      mouseWord.style.left = `${event.clientX}px`;
      mouseWord.style.top = `${event.clientY}px`;
      mouseWord.classList.add('is-visible');
    };
    video.addEventListener('mousemove', showWord);
    video.addEventListener('mouseenter', showWord);
    video.addEventListener('mouseleave', () => mouseWord.classList.remove('is-visible'));
    // After a click the word changes at once, without waiting for the mouse to move
    for (const change of ['play', 'pause', 'ended']) {
      video.addEventListener(change, () => { mouseWord.textContent = video.paused ? 'play' : 'pause'; });
    }
    // The video is taken off the page (its YouTube backup came instead, video-backup.js): no word
    new MutationObserver(() => { if (!video.isConnected) mouseWord.classList.remove('is-visible'); })
      .observe(player, { childList: true });
  }

  // Enlarge and make small again
  function setEnlarged(enlarged) {
    player.classList.toggle('is-enlarged', enlarged);
    backdrop.classList.toggle('is-visible', enlarged);
    enlargeButton.setAttribute('aria-label', enlarged ? 'Make the video small again' : 'Enlarge the video');
  }

  // On the phone version of the page the video already fills the screen's width,
  // so the enlarge button shows it full screen instead (there the phone can be turned sideways)
  function showFullScreen() {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
  }

  enlargeButton.addEventListener('click', () => {
    if (player.closest('.phone-project')) showFullScreen();
    else setEnlarged(!player.classList.contains('is-enlarged'));
  });
  backdrop.addEventListener('click', () => setEnlarged(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setEnlarged(false);
  });

  // ---------- The time bar ----------
  const timeBar = player.querySelector('.video-time-bar');
  if (!timeBar) continue;

  // Show how far the video has played (a share from 0 to 1)
  function showTime() {
    const share = video.duration ? video.currentTime / video.duration : 0;
    timeBar.style.setProperty('--played', share);
    timeBar.setAttribute('aria-valuenow', Math.round(share * 100));
  }
  video.addEventListener('timeupdate', showTime);
  video.addEventListener('loadedmetadata', showTime);

  // While it plays, update it every frame so it moves smoothly
  function followPlaying() {
    showTime();
    if (!video.paused) requestAnimationFrame(followPlaying);
  }
  video.addEventListener('play', () => requestAnimationFrame(followPlaying));

  // Move the video to the spot under the mouse (or finger) on the bar
  function jumpTo(event) {
    const box = timeBar.getBoundingClientRect();
    const share = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    if (video.duration) video.currentTime = share * video.duration;
    timeBar.style.setProperty('--played', share);
  }

  // Dragging: press on the bar, move, let go
  timeBar.addEventListener('pointerdown', (event) => {
    if (video.preload === 'none' && !video.duration) video.load(); // not loaded yet: start loading it
    timeBar.setPointerCapture(event.pointerId);
    timeBar.classList.add('is-dragging');
    jumpTo(event);
  });
  timeBar.addEventListener('pointermove', (event) => {
    if (timeBar.classList.contains('is-dragging')) jumpTo(event);
  });
  const stopDragging = () => timeBar.classList.remove('is-dragging');
  timeBar.addEventListener('pointerup', stopDragging);
  timeBar.addEventListener('pointercancel', stopDragging);

  // Keyboard: arrow keys move 5 seconds back or forward
  timeBar.addEventListener('keydown', (event) => {
    if (!video.duration) return;
    if (event.key === 'ArrowRight') video.currentTime = Math.min(video.currentTime + 5, video.duration);
    else if (event.key === 'ArrowLeft') video.currentTime = Math.max(video.currentTime - 5, 0);
    else return;
    event.preventDefault();
    showTime();
  });
}
