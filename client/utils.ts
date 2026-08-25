

let lastVideo: HTMLVideoElement;
let lastVideoTime = 0;

export function getVideo(): HTMLVideoElement {
  const now = Date.now();
  if (now - lastVideoTime < 250) return lastVideo;

  lastVideoTime = now;
  return lastVideo = document.querySelector('video');
}

export function getVideoId(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

export function log(message: string) {
  console.log('see me, ' + message);
}