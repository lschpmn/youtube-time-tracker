// TODO: better error handling so failed calls aren't spammed
// TODO: probably add alert if calls fail

// TODO: remove 'app=desktop' from url if playing video
// TODO: Look into server side events

import hideWatchedVideos from './hide-watched-videos';
import videoTimeManagement from './video-time-management';

(function () {
  'use strict';
  hideWatchedVideos.watch(1000);
  videoTimeManagement.watch(1);

  const url = new URL(window.location.href);
  if (url.searchParams.get('t')) {
    url.searchParams.delete('t');
    window.location.href = url.href;
  } else if (url.searchParams.get('v') && url.searchParams.get('app')) {
    url.searchParams.delete('app');
    window.location.href = url.href;
  }

})();

