

export function getVideo(): HTMLVideoElement {
  return document.querySelector('video');
}

export function getVideoId(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

export function log(message: string) {
  console.log('see me, ' + message);
}

export function showPlayerControls(show: boolean) {
  const elem = document.querySelector('.ytp-chrome-bottom');
  if (elem) {
    if (show) {
      // @ts-ignore
      document.querySelector('.ytp-chrome-bottom').style.opacity = '1';
    } else {
      // @ts-ignore
      document.querySelector('.ytp-chrome-bottom').style.removeProperty('opacity');
    }

  }
}