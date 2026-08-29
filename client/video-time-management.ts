// TODO: set times should go into some kind of queue so multiple can't pile up,
// TODO: maybe only have current and next, and delete next if a new "next" comes.

// TODO: have separate 'play' and 'pause' firstLoad methods
// TODO: both have to show the timing is correct before play is allowed, if one has the timing wrong, it resets both

// TODO: maybe go back to firstCall mode if it's been paused for longer than 30 seconds

// TODO: use player: https://developers.google.com/youtube/iframe_api_reference#Playback_status

// TODO: rework things so more happens in onStateChange event

import { throttle } from 'lodash';
import { getTime, postTime } from './endpoints';
import { MediaPlayer } from './types';
import { getPlayer, getVideo, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  grabVideoTime: () => Promise<number>;
  pushVideoTime: (time: number) => Promise<void>;
  isMobile: boolean;
  lastTime: number = -1;
  player: MediaPlayer;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  ready: boolean = false;
  _timeReady: boolean = false;
  _didInteract: boolean = false;

  constructor() {
    document.onkeydown = ({ key }) => {
      if (key === ' ') this._didInteract = true;
    };

    this.isMobile = window.location.href.includes('m.youtube');
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
    const player = getPlayer();
    const videoId = getVideoId();

    if (!videoId) return;

    if (videoId !== this.videoId) {
      this.videoId = videoId;
      this.reset();
    }

    if (player !== this.player) {
      this.attachToPlayer();
    }

    if (!this.ready) this.firstCall().catch(console.log);
    else this.regularCall();
  }

  private attachToPlayer() {
    log('attachToVideo');
    const player = getPlayer();
    if (!player) return this.watch(33);
    if (player === this.player) return;

    this.player = player;
    if (this.lastTime === -1) this.pauseIt();

    /*// for mobile, the paused view that goes away
    // also happens on click :(
    this.player.addEventListener('blur', () => this.attachToPlayer());*/

    getVideo()?.addEventListener('click', () => this._didInteract = true);

    this.player.addEventListener('onStateChange', (state: number) => {
      const currentTime = this.player.getCurrentTime();

      if (currentTime === this.lastTime && [1, 2, 3].includes(state)) {
        this._timeReady = true;
        this.pauseIt();
      } else if (state !== 2 && !this.ready) {
        this.pauseIt();
        this.player.seekTo(this.lastTime, true);
        this.watch(50);
      }

      console.log('onStateChange', state, this.player.getCurrentTime());

      showPlayerControls(state !== 1);


    });

    /*this.player.addEventListener('timeupdate', () => {
      log(`currentTime update: ${player.getCurrentTime()}`);
      this._timeReadyUpdate = this.checkTime(false);

      this.pauseIt();
    });

    this.player.addEventListener('play', () => {
      showPlayerControls(false);
      log(`currentTime play: ${player.getCurrentTime()}`);
      this._timeReadyPlay = this.checkTime();

      this.pauseIt();
    });

    this.player.addEventListener('pause', () => {
      showPlayerControls(false);
      log(`currentTime pause: ${player.getCurrentTime()}`);
      this._timeReadyPause = this.checkTime();
    });*/
  }

  // use to set server time, it should have the functionality described in the TODOs, with current and next calls
  private serverSetTime() {
  }

  private async firstCall() {
    log('firstCall');
    this.player.pauseVideo();
    const time = await this.grabVideoTime();

    if (time) {
      log(`setting time to ${time}`);
      this.lastTime = time === 1 ? 0.0125 : time;
      this.player.seekTo(time === 1 ? 0.0125 : time, true);
    } else {
      this.pushVideoTime(1).catch(console.log);
    }

    this.watch(1000);
  }

  private regularCall() {
    log('regularCall');
    const playing = this.player.getPlayerState() === 1;
    const currentTime = this.player.getCurrentTime();

    if (playing && Math.abs(this.lastTime - currentTime) > 1.1) {
      this.lastTime = currentTime;
      log('video playing, recording time');
      this.pushVideoTime(currentTime).catch(console.log);
      this.watch(1500);
    } else {
      this.watch(5000);
    }
  }

  private checkTime(shouldSet: boolean = true): boolean {
    if (Math.abs(this.player.getCurrentTime() - this.lastTime) < 2 ) {
      return true;
    } else if (!this.ready) {
      shouldSet && this.player.seekTo(this.lastTime, true);
      shouldSet && this.watch(50);
      return false;
    }
  }

  private reset() {
    this.ready = false;
    this._timeReady = false;
    this._didInteract = this.isMobile; // disable interact check on mobile
    this.lastTime = -1;

    this.grabVideoTime = throttle(async () => getTime(this.videoId),
      5000, { leading: true, trailing: false });

    this.pushVideoTime = throttle(async (time: number) => postTime(this.videoId, time),
      1000, { leading: true, trailing: false });
  }

  private pauseIt() {
    if (!this.ready && this._timeReady && this._didInteract) {
      this.ready = true;
      this.player.unMute();
      log('READY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }

    if (!this.ready && this.player) {
      this.player.pauseVideo();
      this.player.mute();
      showPlayerControls(true);
    }
  }

}

export default new VideoTimeManagement();