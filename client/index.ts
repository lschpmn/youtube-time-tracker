// TODO: better error handling so failed calls aren't spammed
// TODO: probably add alert if calls fail

import hideWatchedVideos from './hide-watched-videos';
import { getVideoId } from './utils';
import videoTimeManagement from './video-time-management';

(function () {
  'use strict';
  hideWatchedVideos.watch(1000);
  videoTimeManagement.watch(1);

  const url = new URL(window.location.href);
  if (url.searchParams.get('t')) {
    url.searchParams.delete('t');
    window.location.href = url.href;
  }

  const videoId = getVideoId();

  // @ts-ignore
  navigation.addEventListener('navigate', () => {
    const newVideoId = getVideoId();
    if (newVideoId !== videoId) window.location.reload();
  });

})();

