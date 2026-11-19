// Video player (Hamotzi page): a play button in the middle of the video,
// and an enlarge button in its corner.
// - Play: plays the video. Clicking the video while it plays pauses it, and the play button comes back.
// - Enlarge: the video moves to the middle of the screen, bigger, and the rest of the screen dims.
//   The same button, a click on the dimmed screen, or the Esc key make it small again.
// - Time bar: shows how far the video has played. Drag it, or click on it, to move forward or back.
//   With the keyboard: the arrow keys move 5 seconds.

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
