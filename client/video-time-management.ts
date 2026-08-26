import { getTime, setTime } from './socket';
import { getVideo, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  firstLoad: boolean = true;
  lastTime: number = -1;
  video: HTMLVideoElement;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  constructor() {
    this.watch(1);
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

      video.addEventListener('pause', () => {
        console.log('paused');
        showPlayerControls(true);
        if (!this.firstLoad) return;

        if (video.currentTime === this.lastTime // return load
          || (video.currentTime === 0.0125 && this.lastTime === 1)) { // first load
          this.firstLoad = false;
        } else {
          this.firstLoadCall().catch(console.log);
        }
      });

      video.addEventListener('play', () => this.firstLoad && video.pause());

      video.addEventListener('timeupdate', () => {
        console.log('time update');
        if (this.firstLoad) video.pause();
        else this.regularCall();
      });
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
      log(`setting time to ${time}`);
      this.lastTime = time;
      this.video.currentTime = time === 1 ? 0.0125 : time; // prevent accidental autoplay
    } else {
      setTime(this.videoId, 1);
    }
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

    if (video !== this.video) {
      this.findVideo();
      return;
    }

    if (!video.paused && Math.abs(this.lastTime - video.currentTime) > 1) {
      this.lastTime = video.currentTime;
      log('video playing, recording time');
      setTime(videoId, video.currentTime);
    }

    if (video.paused) showPlayerControls(true);
    else showPlayerControls(false);
  }

}

export default new VideoTimeManagement();