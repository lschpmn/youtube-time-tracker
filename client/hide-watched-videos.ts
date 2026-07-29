import { getWatchedVideos } from './endpoints';

declare global {
  // Note the capital "W"
  interface Window { timeout: NodeJS.Timeout | null; }
}


window.timeout = null;

export function start(waitTime: number = 2000) {
  if (window.timeout) clearTimeout(window.timeout);
  window.timeout = setTimeout(async () => {
    await hideWatchedVideos();
    start(Math.min(waitTime + 1000, 30 * 1000));
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
  const videoElements = [
      ...document.getElementsByTagName('ytd-rich-item-renderer'),
      ...document.getElementsByTagName('yt-lockup-view-model'),
  ];

  for (let videoElement of videoElements) {
    const link = Array(...videoElement.getElementsByTagName('a'))
      .find(e => !!e.href)?.href;
    if (!link) continue;
    const url = new URL(link);
    map[url.searchParams.get('v')] = videoElement;

    if (link.includes('t=')) {
      // @ts-ignore
      videoElement.style.display = 'none';
    }
  }

  return map;
}
