// TODO: Change approach
// TODO: Every time on load, check video and if new attach event to play
// TODO: In play event is where it should auto pause and forward to proper video place

import { getTime, setTime } from './socket';
import { getVideo, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  firstLoad: number = 10;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  constructor() {
    this.watch(5);
  }

  watch(time: number) {
    log(`watch for ${time}`);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {

      if (this.firstLoad) this.firstLoadCall().catch(console.error);
      else this.regularCall();

    }, time);
  }

  private async firstLoadCall() {
    log('first call');
    this.videoId = getVideoId();
    const video = getVideo();
    log(`has video? ${!!video}`);

    if (!video) return;
    video.pause();
    video.onplay = function() {
      video.pause();
    };

    const time = await getTime(this.videoId);
    this.firstLoad--;

    if (time) {
      video.currentTime = time;
    } else {
      setTime(this.videoId, 1);
    }

    if (isNaN(video.duration)) {
      this.firstLoad = 10;
      this.watch(100);
      return;
    }

    if (this.firstLoad > 0) this.watch(50);
    else this.watch(1000);
  }

  private regularCall() {
    log('regular call');
    const video = getVideo();
    const videoId = getVideoId();

    if (videoId !== this.videoId) {
      this.firstLoad = 10;
      log('video id is different');
      this.watch(25);
      return;
    }

    if (video.currentTime > 5 && !video.paused) {
      log('video playing, recording time');
      setTime(videoId, video.currentTime);
    }

    if (video.paused) showPlayerControls(true);
    else showPlayerControls(false);

    this.watch(1000);
  }

}

export default new VideoTimeManagement();