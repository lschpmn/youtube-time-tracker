import { clearTimeout } from 'node:timers';
import { getWatchedVideos } from './endpoints';


let timeout: NodeJS.Timeout | null;

export function start() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(async () => {
    await hideWatchedVideos();
    start();
  }, 5000);
}

export function stop() {
  clearTimeout(timeout);
  timeout = null;
}

async function hideWatchedVideos() {
  const videoMap = getVideoIdMap();
  const watchedVideoIds = await getWatchedVideos(Object.keys(videoMap));

  for (let videoId of watchedVideoIds) {
    // @ts-ignore
    videoMap[videoId]?.style?.display = 'none';
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
