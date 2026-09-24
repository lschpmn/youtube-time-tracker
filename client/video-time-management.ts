import { throttle } from 'lodash';
import { getTime, postTime } from './endpoints';
import { MediaPlayer } from './types';
import { getPlayer, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  private readonly isMobile: boolean;
  private lastTime: number = -1;
  private player: MediaPlayer;
  private videoId: string | null = null;
  private timeout: NodeJS.Timeout = null;

  private getTimePromise: Promise<number> | null = null;
  private setTimePromise: Promise<void> | null = null;

  private ready: boolean = false;
  private _timeReady: boolean = false;
  private _didInteract: boolean = false;

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

    this.player.addEventListener('onStateChange', (state: number) => {
      const currentTime = this.player.getCurrentTime();
      log(`onStateChange, state: ${state}, time: ${currentTime}`);
      showPlayerControls(state !== 1);

      if (this.ready) {
        this.watch(900);
        return;
      }

      if ([1, 2, 3].includes(state)) {
        this._timeReady = currentTime === this.lastTime;
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
    this.player.mute();
    this.player.onclick = () => this._didInteract = true;
    const time = await this.safeGrabVideoTime();

    if (time) {
      log(`setting time to ${time}`);
      this.lastTime = time === 1 ? 0.0125 : time;
      this.player.seekTo(time === 1 ? 0.0125 : time, true);
    } else {
      this.safeSetVideoTime(1).catch(console.log);
    }

    this.watch(1000);
  }

  private async regularCall() {
    log('regularCall');
    const playerState = this.player.getPlayerState();
    const currentTime = this.player.getCurrentTime();
    const isPlaying = playerState === 1 || playerState === 3;
    const isPaused = playerState === 2;

    if (isPlaying) {
      if (Math.abs(this.lastTime - currentTime) > 0.5) {
        log(`video playing, recording time: ${currentTime}`);
        this.safeSetVideoTime(currentTime).catch(console.log);
        this.lastTime = currentTime;
      }
      this.watch(901);
    } else if (isPaused) {
      const time = await this.safeGrabVideoTime();
      if (Math.abs(currentTime - time) > 1) {
        log('seeking to time');
        this.player.seekTo(time, true);
        this.lastTime = time;
      }

      this.watch(2000);
    }
  }

  private reset() {
    this.ready = false;
    this._timeReady = false;
    this._didInteract = this.isMobile; // disable interact check on mobile
    this.lastTime = -1;
  }

  safeGrabVideoTime(): Promise<number> {
    if (!this.getTimePromise) {
      return this.getTimePromise = getTime(this.videoId)
        .finally(() => this.getTimePromise = null);
    } else {
      return this.getTimePromise;
    }
  }

  safeSetVideoTime(time: number): Promise<void> {
    if (!this.setTimePromise) {
      return this.setTimePromise = postTime(this.videoId, time)
        .finally(() => this.setTimePromise = null);
    } else {
      return this.setTimePromise;
    }
  }


  private writePercentToTitle = throttle(() => {
    const percent = this.player.getCurrentTime() / this.player.getDuration() * 100;
    const title = document.title.replace(/^\d?\d?\d%\s/, '');
    log(`percent: ${percent}`);

    document.title = `${Math.round(percent)}% ${title}`;
  }, 2000, { trailing: true, leading: true });
}

export default new VideoTimeManagement();