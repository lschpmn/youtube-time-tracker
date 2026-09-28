import hideWatchedVideos from './hide-watched-videos';
import videoTimeManagement from './video-time-management';

(function () {
  'use strict';
  hideWatchedVideos.watch(1000);
  videoTimeManagement.heartbeat();

  const url = new URL(window.location.href);
  if (url.searchParams.get('t')) {
    url.searchParams.delete('t');
  } else if (url.searchParams.get('v') && url.searchParams.get('app')) {
    url.searchParams.delete('app');
  }

  if (url.href !== window.location.href) {
    window.location.href = url.href;
  }

})();

