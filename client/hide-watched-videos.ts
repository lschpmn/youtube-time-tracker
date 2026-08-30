import { throttle } from 'lodash';
import { getWatchedVideos } from './endpoints';

const FORBIDDEN_URLS = ['/feed/history', '/results', '/playlist'];

class HideWatchedVideos {
  private timeout: NodeJS.Timeout = null;

  constructor() {
    document.addEventListener('scroll', throttle(() => {
      this.watch(10);
    }, 1500, { leading: true, trailing: true }));
  }

  watch(waitTime: number) {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.hideWatchedVideos().catch(console.log);
    }, waitTime);
  }

  private async hideWatchedVideos() {
    if (FORBIDDEN_URLS.some(u => window.location.href.includes(u))) return;
    const videoMap = this.getVideoIdMap();
    const watchedVideoIds = await getWatchedVideos(Object.keys(videoMap));

    for (let videoId of watchedVideoIds) {
      // @ts-ignore
      hideElement(videoMap[videoId]);
    }

    this.watch(30 * 1000);
  }

  private getVideoIdMap(): { string: Element } {
    const map = {} as { string: Element };
    let videoElements = [...document.getElementsByTagName('ytd-rich-item-renderer')];

    if (!videoElements.length) {
      videoElements = [...document.getElementsByTagName('yt-lockup-view-model')];
    }

    if (!videoElements.length) {
      videoElements = [...document.getElementsByTagName('ytm-video-with-context-renderer')];
    }

    for (let videoElement of videoElements) {
      const link = Array(...videoElement.getElementsByTagName('a'))
        .find(e => !!e.href)?.href;
      if (!link) continue;

      if (link.includes('t=')) {
        // @ts-ignore
        hideElement(videoElement);
      } else {
        const url = new URL(link);
        map[url.searchParams.get('v')] = videoElement;
      }
    }

    return map;
  }
}

export default new HideWatchedVideos();

// Util

function hideElement(element: HTMLElement) {
  element.style.display = 'none';
}
