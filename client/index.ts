// TODO: better error handling so failed calls aren't spammed
// TODO: probably add alert if calls fail
// TODO: when doing a get for time, set the video ID, before sending any time, re-check the video ID
// TODO: Only upload time when video is playing
// TODO: Put percent of currently watched video into title

import { start } from './hide-watched-videos';
import { getVideoId } from './utils';
import videoTimeManagement from './video-time-management';

(function () {
  'use strict';
  start();
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

