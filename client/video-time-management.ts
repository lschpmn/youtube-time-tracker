// TODO: grab video time on load, and use the pause response for setting that time
// TODO: have something going every second that should make sure video saved is the right one (for mobile)
// TODO: this can also attempt to set the proper time over and over until the pause event confirms it's set
// TODO: also maybe disable video playback until interacted with (on click or space bar pressed)
// TODO: set times should go into some kind of queue so multiple can't pile up,
// TODO: maybe only have current and next, and delete next if a new "next" comes.

// more ideas now
// TODO: regular watcher can have 'paused' and 'playing' modes
// TODO: for paused, it checks every 5 seconds with time on server, and updates video time if there's a difference
// TODO: for playing, it just records the video time

// TODO: block playing until interaction

import { throttle } from 'lodash';
import { getTime, postTime } from './endpoints';
import { getVideo, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  didInteract: boolean = false;
  firstLoad: boolean = true;
  grabVideoTime: () => Promise<number>;
  lastTime: number = -1;
  video: HTMLVideoElement;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  constructor() {
    document.onkeydown = ({ key }) => {
      if (key === ' ') this.didInteract = true;
    };
  }

  watch(time: number) {
    log(`watch for ${time}`);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {

      this.repeatingCall();

    }, time);
  }

  private repeatingCall() {
    log('repeatingCall');
    const video = getVideo();
    const videoId = getVideoId();

    if (!videoId) return;

    if (videoId !== this.videoId) {
      this.videoId = videoId;
      this.didInteract = false;
      this.firstLoad = true;
      this.lastTime = -1;
      this.grabVideoTime = throttle(async () => getTime(videoId),
                              5000, { leading: true, trailing: false });
    }

    if (video !== this.video) {
      this.attachToVideo();
    }

    if (this.firstLoad) this.firstCall().catch(console.log);
    else this.regularCalll();
  }

  private attachToVideo() {
    log('attachToVideo');
    const video = getVideo();
    if (!video) return this.watch(33);
    if (video === this.video) return;

    this.video = video;
    this.video.pause();

    const pauseIt = () => {
      if (this.firstLoad || !this.didInteract) this.video.pause();
    };

    // for mobile, the paused view that goes away
    // also happens on click :(
    this.video.addEventListener('blur', () => this.attachToVideo());

    this.video.addEventListener('click', () => this.didInteract = true);

    this.video.addEventListener('timeupdate', () => {
      pauseIt();
      if (!this.firstLoad) this.regularCalll();
    });

    this.video.addEventListener('play', (event) => {
      showPlayerControls(false);
      log(`currentTime: ${(event.target as HTMLVideoElement).currentTime}`);
      if ((event.target as HTMLVideoElement).currentTime === this.lastTime) {
        log('firstLoad = false');
        this.firstLoad = false;
      }

      pauseIt();
    });

    this.video.addEventListener('pause', () => showPlayerControls(true));
  }

  // use to set server time, it should have the functionality described in the TODOs, with current and next calls
  private serverSetTime() {
  }

  private async firstCall() {
    log('firstCall');
    this.video.pause();
    const time = await this.grabVideoTime();

    if (time) {
      log(`setting time to ${time}`);
      this.lastTime = time === 1 ? 0.0125 : time;
      this.video.currentTime = time === 1 ? 0.0125 : time;
    } else {
      postTime(this.videoId, 1).catch(console.log);
    }

    this.watch(1000);
  }

  private regularCalll() {
    log('regularCall');
    if (!this.video.paused && Math.abs(this.lastTime - this.video.currentTime) > 1.1) {
      this.lastTime = this.video.currentTime;
      log('video playing, recording time');
      postTime(this.videoId, this.video.currentTime).catch(console.log);
      this.watch(1500);
    } else {
      this.watch(5000);
    }
  }

}

export default new VideoTimeManagement();