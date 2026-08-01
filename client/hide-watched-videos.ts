import { getWatchedVideos } from './endpoints';

let timeout = null;
let previousLength: number = 0;
let newLength: number = 0;

// Public

export function start(waitTime: number = 1000) {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(async () => {
    await hideWatchedVideos();

    let newWaitTime: number;

    if (previousLength === newLength) {
      newWaitTime = waitTime + 1000;
    } else {
      newWaitTime = 1000;
    }

    previousLength = newLength;

    start(Math.min(newWaitTime, 20 * 1000));
  }, waitTime);
}

export function stop() {
  clearTimeout(timeout);
  timeout = null;
}

// Private

async function hideWatchedVideos() {
  if (isForbiddenPage()) return;
  const videoMap = getVideoIdMap();
  const watchedVideoIds = await getWatchedVideos(Object.keys(videoMap));

  for (let videoId of watchedVideoIds) {
    // @ts-ignore
    videoMap[videoId].remove();
  }
}

function getVideoIdMap(): { string: Element } {
  const map = {} as { string: Element };
  let videoElements = [...document.getElementsByTagName('ytd-rich-item-renderer')];

  if (!videoElements.length) {
    videoElements = [...document.getElementsByTagName('yt-lockup-view-model')];
  }

  if (!videoElements.length) {
    videoElements = [...document.getElementsByTagName('ytm-video-with-context-renderer')];
  }

  newLength = videoElements.length;

  for (let videoElement of videoElements) {
    const link = Array(...videoElement.getElementsByTagName('a'))
      .find(e => !!e.href)?.href;
    if (!link) continue;

    if (link.includes('t=')) {
      // @ts-ignore
      videoElement.remove();
    } else {
      const url = new URL(link);
      map[url.searchParams.get('v')] = videoElement;
    }
  }

  return map;
}

// Util

function isForbiddenPage(): boolean {
  const forbiddenUrls = ['/feed/history', 'results?search_query'];
  return forbiddenUrls.some(u => window.location.href.includes(u))
}
