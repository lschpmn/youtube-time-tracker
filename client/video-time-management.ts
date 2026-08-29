// TODO: set times should go into some kind of queue so multiple can't pile up,
// TODO: maybe only have current and next, and delete next if a new "next" comes.

// TODO: have separate 'play' and 'pause' firstLoad methods
// TODO: both have to show the timing is correct before play is allowed, if one has the timing wrong, it resets both

// TODO: maybe go back to firstCall mode if it's been paused for longer than 30 seconds

// TODO: use player: https://developers.google.com/youtube/iframe_api_reference#Playback_status

import { throttle } from 'lodash';
import { getTime, postTime } from './endpoints';
import { getVideo, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  grabVideoTime: () => Promise<number>;
  isMobile: boolean;
  lastTime: number = -1;
  video: HTMLVideoElement;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  ready: boolean = false;
  _timeReadyPause: boolean = false;
  _timeReadyPlay: boolean = false;
  _timeReadyUpdate: boolean = false;
  _didInteract: boolean = false;

  constructor() {
    document.onkeydown = ({ key }) => {
      if (key === ' ') this._didInteract = true;
    };

    this.isMobile = window.location.href.includes('m.youtube');
    log(`hey is this mobile? ${this.isMobile}`);
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
      this.reset();
    }

    if (video !== this.video) {
      this.attachToVideo();
    }

    if (!this.ready) this.firstCall().catch(console.log);
    else this.regularCall();
  }

  private attachToVideo() {
    log('attachToVideo');
    const video = getVideo();
    if (!video) return this.watch(33);
    if (video === this.video) return;

    this.video = video;
    this.video.click();
    if (this.lastTime === -1) this.pauseIt();

    const timeSetting = (theTitle) => Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime').set.call(this.video, theTitle);
    const timeGetting = () => Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime').get.call(this.video);

    // Override the setter for document.title to prevent further changes
    Object.defineProperty(this.video, 'currentTime', {
      get: function() {
        return timeGetting();
      },
      set: (newTitle) => {
        console.log(newTitle, 'this');
        if (this.ready || +newTitle == this.lastTime) {
          timeSetting(newTitle);
          log('setting this time')
        }
      }
    });



    // for mobile, the paused view that goes away
    // also happens on click :(
    this.video.addEventListener('blur', () => this.attachToVideo());

    this.video.addEventListener('click', () => this._didInteract = true);

    this.video.addEventListener('seeked', (e) => console.log('seeked', e.target.currentTime));
    this.video.addEventListener('seeking', (e) => console.log('seeking', e.target.currentTime));

    this.video.addEventListener('timeupdate', (event) => {
      const targetVideo = event.target as HTMLVideoElement
      log(`currentTime update: ${targetVideo.currentTime}`);
      this._timeReadyUpdate = this.checkTime(video, false);

      this.pauseIt();
    });

    this.video.addEventListener('play', (event) => {
      showPlayerControls(false);
      const targetVideo = event.target as HTMLVideoElement
      log(`currentTime play: ${targetVideo.currentTime}`);
      this._timeReadyPlay = this.checkTime(video);

      this.pauseIt();
    });

    this.video.addEventListener('pause', (event) => {
      showPlayerControls(true);
      const targetVideo = event.target as HTMLVideoElement
      log(`currentTime pause: ${targetVideo.currentTime}`);
      this._timeReadyPause = this.checkTime(video);
    });
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
      //this.video.currentTime = time === 1 ? 0.0125 : time;
      const player = document.getElementById('movie_player');
      player.seekTo(time === 1 ? 0.0125 : time)
      //this.video.fastSeek(time === 1 ? 0.0125 : time);
    } else {
      postTime(this.videoId, 1).catch(console.log);
    }

    this.watch(1000);
  }

  private regularCall() {
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

  private checkTime(video: HTMLVideoElement, shouldSet: boolean = true): boolean {
    if (Math.abs(video.currentTime - this.lastTime) < 2 ) {
      return true;
    } else if (!this.ready) {
      //shouldSet && (video.currentTime = this.lastTime);
      //shouldSet && this.video.fastSeek(this.lastTime);
      const player = document.getElementById('movie_player');
      shouldSet && player.seekTo(this.lastTime)
      shouldSet && this.watch(50);
      return false;
    }
  }

  private reset() {
    this.ready = false;
    this._timeReadyPlay = false;
    this._timeReadyPause = false;
    this._timeReadyUpdate = false;
    this._didInteract = this.isMobile; // disable interact check on mobile
    this.lastTime = -1;
    this.grabVideoTime = throttle(async () => {
        log('grabbing time!')
        return getTime(this.videoId);
      },
      5000, { leading: true, trailing: false });
  }

  private pauseIt() {
    if (!this.ready && this._timeReadyPause && this._timeReadyPlay && this._timeReadyUpdate && this._didInteract) {
      this.ready = true;
      this.video.volume = 1;
      log('READY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }

    if (!this.ready && this.video) {
      this.video.pause();
      this.video.volume = 0;
    }
  }

}

export default new VideoTimeManagement();