// TODO: set times should go into some kind of queue so multiple can't pile up,
// TODO: maybe only have current and next, and delete next if a new "next" comes.

// V2

import { throttle } from 'lodash';
import { getTime, postTime } from './endpoints';
import { MediaPlayer } from './types';
import { getPlayer, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  isMobile: boolean;
  lastTime: number = -1;
  player: MediaPlayer;
  videoId: string | null = null;
  timeout: NodeJS.Timeout = null;

  ready: boolean = false;
  _timeReady: boolean = false;
  _didInteract: boolean = false;

  constructor() {
    document.addEventListener('keydown', ({ key }) => {
      if (key === ' ') this._didInteract = true;
    });

    this.isMobile = window.location.href.includes('m.youtube');
  }

  watch(time: number) {
    log(`watch for ${time}`);
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {

      this.repeatingCall();
      this.writePercentToTitle();
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
    else this.regularCall().catch(console.log);
  }

  private attachToPlayer() {
    log('attachToVideo');
    const player = getPlayer();
    if (!player) return this.watch(33);
    if (player === this.player) return;

    this.player = player;
    if (this.lastTime === -1) this.player.mute();

    this.player.addEventListener('onStateChange', (state: number) => {
      const currentTime = this.player.getCurrentTime();
      log(`onStateChange, state: ${state}, time: ${currentTime}`);
      showPlayerControls(state !== 1);

      if (this.ready) {
        if (state === 1 || state === 3) this.watch(1500);
        else if (state === 2) this.watch(5500);
        return;
      }

      if (currentTime === this.lastTime && [1, 2, 3].includes(state)) {
        this._timeReady = true;
      }

      if (this._timeReady && this._didInteract) {
        this.ready = true;
        this.player.unMute();
      }

      this.watch(10);
    });
  }

  private async firstCall() {
    log('firstCall');
    if (!this.isMobile) this.player.pauseVideo();
    this.player.onclick = () => this._didInteract = true;
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

  private async regularCall() {
    log('regularCall');
    const playing = this.player.getPlayerState() === 1;
    const currentTime = this.player.getCurrentTime();

    if (playing) {
      if (Math.abs(this.lastTime - currentTime) > 1.1) {
        log(`video playing, recording time: ${currentTime}`);
        this.pushVideoTime(currentTime).catch(console.log);
      }

      this.lastTime = currentTime;
      this.watch(1500);
    } else {
      const time = await this.grabVideoTime();
      if (Math.abs(currentTime - time) > 4) {
        log('seeking to time');
        this.player.seekTo(time, true);
        this.lastTime = time;
        this.watch(5501);
      } else {
        this.watch(30 * 1001);
      }
    }
  }

  private reset() {
    this.ready = false;
    this._timeReady = false;
    this._didInteract = this.isMobile; // disable interact check on mobile
    this.lastTime = -1;
  }

  private grabVideoTime = throttle(async () => {
      return getTime(this.videoId);
    }, 5000, { leading: true, trailing: false });


  private pushVideoTime = throttle(async (time: number) => {
      return postTime(this.videoId, time);
    }, 1000, { leading: true, trailing: false });


  private writePercentToTitle = throttle(() => {
    const percent = this.player.getCurrentTime() / this.player.getDuration() * 100;
    const title = document.title.replace(/^\d?\d?\d%\s/, '');
    log(`percent: ${percent}`);

    document.title = `${Math.round(percent)}% ${title}`
  }, 2000, { trailing: true, leading: true});

  // use to set server time, it should have the functionality described in the TODOs, with current and next calls
  private serverSetTime() {
  }
}

export default new VideoTimeManagement();