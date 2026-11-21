// Loader for the YouTube videos (Hamotzi, Lets Talk About It): while a YouTube video loads,
// its frame shows the same loader as the whole page (page-loader.js): cream, "video is loading" and a count up to 100%
// in the handwriting-style font, at 100% the mouse picture for a moment, and then it fades away.
//
// YouTube doesn't say how much of a video has loaded, so the number counts up slowly by itself
// (never past 90%) until YouTube says the video is ready, and then it goes on to 100%:
//   - a video that plays by itself (autoplay in its address, Lets Talk): ready when it starts playing
//     (or a few seconds after its player is ready, if it doesn't start).
//   - a video that waits for a click (Hamotzi): ready when its player has loaded.
// YouTube tells this through messages, so the video's address has enablejsapi=1 in it.

(function () {
  const rootStyle = getComputedStyle(document.documentElement);
  const pictureTime = parseFloat(rootStyle.getPropertyValue('--loader-picture-time')) * 1000;
  const longestWait = 15000;   // if YouTube never says it's ready, take the loader away anyway after this long
  const notPlayingWait = 4000; // a video that should play by itself: how long to wait for it to start, once its player is ready

  for (const video of document.querySelectorAll('iframe.youtube-video')) {
    const playsByItself = video.src.includes('autoplay=1');

    // The loader, on top of the video, in the same frame
    const loader = document.createElement('div');
    // (data-loader-frame on the video: the loader also draws a frame around it, so the video's edges show while it loads)
    loader.className = 'page-loader video-loader is-visible';
    if (video.hasAttribute('data-loader-frame')) loader.classList.add('has-frame');
    loader.setAttribute('aria-hidden', 'true');
    // "video is loading" above the number (only here, not in the whole page's loader)
    loader.innerHTML = '<span class="video-loader-words"><span class="video-loader-text">video is loading</span>' +
      '<span class="page-loader-number">0%</span></span>' +
      '<img class="page-loader-picture" src="images/cursor-about.webp" width="195" height="303" alt="">';
    video.after(loader);
    const number = loader.querySelector('.page-loader-number');

    let shown = 0;       // the number on the screen
    let isReady = false; // YouTube said the video is ready

    // The number: slowly toward 90% while waiting, quickly to 100% once ready.
    // It goes by the time that passed, so it moves at the same speed on every screen.
    let lastTime = performance.now();
    function countUp(now) {
      const seconds = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      if (isReady) shown += Math.max(100 - shown, 20) * seconds * 4; // about a quarter of a second to 100%
      else shown += (90 - shown) * seconds * 0.5;                      // most of the way to 90% in a few seconds
      shown = Math.min(shown, isReady ? 100 : 90);
      number.textContent = `${Math.floor(shown)}%`;
      if (shown >= 100) { showPicture(); return; }
      requestAnimationFrame(countUp);
    }
    requestAnimationFrame(countUp);

    // At 100%: the mouse picture for a moment, then the video
    function showPicture() {
      loader.classList.add('is-at-picture');
      setTimeout(() => {
        loader.classList.add('is-gone');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }, pictureTime);
    }

    function ready() {
      if (isReady) return;
      isReady = true;
      window.removeEventListener('message', listen);
    }

    // Messages from YouTube: "onReady" when the player is ready, and playerState 1 when the video plays
    function listen(event) {
      if (event.source !== video.contentWindow) return;
      let message;
      try { message = JSON.parse(event.data); } catch (error) { return; }
      const playing = message.info && message.info.playerState === 1;
      if (playing || (!playsByItself && message.event === 'onReady')) ready();
      // A video that should play by itself but doesn't start (a phone in low power mode doesn't let it):
      // a few seconds after its player is ready, show it anyway (with YouTube's play button)
      if (playsByItself && message.event === 'onReady') setTimeout(ready, notPlayingWait);
    }
    window.addEventListener('message', listen);

    // Ask YouTube to send its messages. The player may not be there yet (or may have loaded before
    // this script ran), so ask again every quarter of a second until it answers.
    let isHeard = false;
    window.addEventListener('message', (event) => { if (event.source === video.contentWindow) isHeard = true; });
    const asking = setInterval(() => {
      if (isHeard || isReady) { clearInterval(asking); return; }
      video.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
    }, 250);

    setTimeout(ready, longestWait);
  }
})();
