import { getTime, setTime } from './socket';
import { getVideo, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  firstLoad: boolean = true;
  video: HTMLVideoElement;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  constructor() {
    this.watch(5);
  }

  watch(time: number) {
    log(`watch for ${time}`);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {

      if (this.firstLoad) this.findVideo();
      else this.regularCall();

    }, time);
  }

  private findVideo() {
    const video = getVideo();
    const videoId = getVideoId();

    if (!videoId) return;

    if (!video) {
      this.watch(100);
      return;
    }

    if (video !== this.video) {
      this.video = video;
      video.onplay = () => this.firstLoadCall();
    }
  }

  private async firstLoadCall() {
    log('first call');
    const videoId = getVideoId();

    if (videoId === this.videoId && !this.firstLoad) return;

    this.videoId = videoId;
    this.video.pause();

    const time = await getTime(this.videoId);

    if (time) {
      this.video.currentTime = time;
    } else {
      setTime(this.videoId, 1);
    }

    this.firstLoad = false;
    this.watch(1000);
  }

  private regularCall() {
    log('regular call');
    const video = getVideo();
    const videoId = getVideoId();

    if (videoId !== this.videoId) {
      log('video id is different');
      this.firstLoad = true;
      video.pause();
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