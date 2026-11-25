// Backup for a video on the site (Hamotzi): if it doesn't start playing within --video-backup-wait
// of pressing play (or the video file can't be loaded at all), its frame shows a note in the
// handwriting-style font ("this is taking too long.. Luckily there's a backup link") for --video-backup-note-time,
// and then the same video comes up from YouTube in its place, with the YouTube loader (youtube-loader.js).
// The player says which YouTube video is its backup: data-youtube-backup="<the YouTube video's id>".

(function () {
  const rootStyle = getComputedStyle(document.documentElement);
  const wait = parseFloat(rootStyle.getPropertyValue('--video-backup-wait')) * 1000;     // 10 seconds
  const noteTime = parseFloat(rootStyle.getPropertyValue('--video-backup-note-time')) * 1000; // 3 seconds

  for (const player of document.querySelectorAll('.video-player[data-youtube-backup]')) {
    const video = player.querySelector('video');
    let waitTimer = null;
    let isSwitching = false;

    // Pressing play: start counting; if it plays in time, stop counting
    video.addEventListener('play', () => {
      clearTimeout(waitTimer);
      waitTimer = setTimeout(switchToBackup, wait);
    });
    video.addEventListener('playing', () => clearTimeout(waitTimer));
    video.addEventListener('pause', () => clearTimeout(waitTimer));

    // The file can't be loaded at all: no need to wait
    video.addEventListener('error', switchToBackup);
    const source = video.querySelector('source');
    if (source) source.addEventListener('error', switchToBackup);

    function switchToBackup() {
      if (isSwitching) return;
      isSwitching = true;
      clearTimeout(waitTimer);
      video.pause();

      // If it was enlarged on the computer, make it small again first (video-player.js)
      player.classList.remove('is-enlarged');
      const backdrop = document.querySelector('.video-backdrop');
      if (backdrop) backdrop.classList.remove('is-visible');

      // The note, over the video, in its frame
      const note = document.createElement('div');
      note.className = 'video-backup-note';
      note.setAttribute('role', 'status');
      // two lines, broken after "too long.." on every screen
      for (const line of ['this is taking too long..', 'Luckily there’s a backup link']) {
        const part = document.createElement('span');
        part.className = 'video-backup-note-line';
        part.textContent = line;
        note.appendChild(part);
      }
      player.appendChild(note);

      // After a moment: the YouTube video in place of the player
      setTimeout(() => {
        const youtube = document.createElement('iframe');
        youtube.className = 'youtube-video';
        youtube.setAttribute('data-loader-frame', '');
        // autoplay: it was asked to play, so it starts by itself when it can
        youtube.src = `https://www.youtube-nocookie.com/embed/${player.dataset.youtubeBackup}?enablejsapi=1&rel=0&playsinline=1&autoplay=1`;
        youtube.title = video.getAttribute('aria-label') || 'Video';
        youtube.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
        youtube.allowFullscreen = true;

        player.classList.remove('video-player', 'is-playing');
        player.classList.add('is-backup');
        player.replaceChildren(youtube);
        if (window.addYouTubeLoader) window.addYouTubeLoader(youtube); // "video is loading" and the count
      }, noteTime);
    }
  }
})();
