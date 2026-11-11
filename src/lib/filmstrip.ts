"use client";

/**
 * Draws evenly spaced frames from a video into the given canvases, using a hidden copy of the video.
 * Calls `onReady` when every frame is drawn. Returns a function that stops it.
 */
export function drawFilmstrip(src: string, canvases: (HTMLCanvasElement | null)[], onReady: () => void) {
  let cancelled = false;
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = src;
  const once = (event: string) => new Promise((resolve) => video.addEventListener(event, resolve, { once: true }));

  (async () => {
    await once("loadeddata");
    for (let i = 0; i < canvases.length && !cancelled; i++) {
      video.currentTime = (video.duration * (i + 0.5)) / canvases.length;
      await once("seeked");
      const c = canvases[i];
      c?.getContext("2d")?.drawImage(video, 0, 0, c.width, c.height);
    }
    if (!cancelled) onReady();
  })();

  return () => {
    cancelled = true;
    video.removeAttribute("src");
    video.load();
  };
}
