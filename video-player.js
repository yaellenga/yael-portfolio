// Video player (Hamotzi page): a play button in the middle of the video,
// and an enlarge button in its corner.
// - Play: plays the video. Clicking the video while it plays pauses it, and the play button comes back.
// - Enlarge: the video moves to the middle of the screen, bigger, and the rest of the screen dims.
//   The same button, a click on the dimmed screen, or the Esc key make it small again.

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

  enlargeButton.addEventListener('click', () => setEnlarged(!player.classList.contains('is-enlarged')));
  backdrop.addEventListener('click', () => setEnlarged(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setEnlarged(false);
  });
}
