// TODO: disable on history page and search page

import { getWatchedVideos } from './endpoints';

declare global {
  interface Window {
    _timeoutId: NodeJS.Timeout | null;
    timeout: NodeJS.Timeout | null;
  }
}


window.timeout = null;
let previousLength: number;
let newLength: number;

export function start(waitTime: number = 1000) {
  if (window.timeout) clearTimeout(window.timeout);
  window.timeout = setTimeout(async () => {
    await hideWatchedVideos();

    let newWaitTime: number;

    if (previousLength === newLength) {
      newWaitTime = waitTime + 1000;
    } else {
      newWaitTime = 1000;
    }

    previousLength = newLength;

    start(Math.min(newWaitTime, 30 * 1000));
  }, waitTime);
}

export function stop() {
  clearTimeout(window.timeout);
  window.timeout = null;
}

async function hideWatchedVideos() {
  const videoMap = getVideoIdMap();
  const watchedVideoIds = await getWatchedVideos(Object.keys(videoMap));

  for (let videoId of watchedVideoIds) {
    // @ts-ignore
    videoMap[videoId].style.display = 'none';
  }
}

function getVideoIdMap(): { string: Element } {
  const map = {} as { string: Element };
  let videoElements = [...document.getElementsByTagName('ytd-rich-item-renderer')];

  if (!videoElements.length) {
    videoElements = [...document.getElementsByTagName('yt-lockup-view-model')];
  }

  newLength = videoElements.length;

  for (let videoElement of videoElements) {
    const link = Array(...videoElement.getElementsByTagName('a'))
      .find(e => !!e.href)?.href;
    if (!link) continue;

    if (link.includes('t=')) {
      // @ts-ignore
      videoElement.style.display = 'none';
    } else {
      const url = new URL(link);
      map[url.searchParams.get('v')] = videoElement;
    }
  }

  return map;
}
