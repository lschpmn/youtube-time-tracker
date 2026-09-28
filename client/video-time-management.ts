import { throttle } from 'lodash';
import { io, Socket } from 'socket.io-client';
import { host } from './endpoints';
import { MediaPlayer } from './types';
import { getPlayer, getVideoId, log, showPlayerControls } from './utils';

class VideoTimeManagement {
  private readonly isMobile: boolean;
  private lastTime: number = -1;
  private player: MediaPlayer;
  private socket: Socket;
  private videoId: string | null = null;

  private heartbeatPromise: Promise<void> | null = null;

  private ready: boolean = false;
  private _timeReady: boolean = false;
  private _didInteract: boolean = false;

  constructor() {
    document.addEventListener('keydown', ({ key }) => {
      if (key === ' ') this._didInteract = true;
    });

    this.isMobile = window.location.href.includes('m.youtube');
  }

  heartbeat() {
    if (!this.heartbeatPromise) {
      log('start heartbeat');

      this.heartbeatPromise = this.repeatingCall()
        .finally(() => {
          log('heartbeat done, resting');

          setTimeout(() => {
            this.heartbeatPromise = null;
            this.heartbeat();
          }, 1000);
        });
    }
  }

  private async repeatingCall() {
    log('repeatingCall');
    const player = getPlayer();
    const videoId = getVideoId();

    if (!videoId) return;

    if (videoId !== this.videoId) {
      this.videoId = videoId;
      this.reset();
    }

    if (player !== this.player) {
      this.setupAttachments();
    }

    if (!this.ready) await this.firstCall();
    else await this.regularCall();

    this.writePercentToTitle();
  }

  private setupAttachments() {
    log('attachToVideo');
    const player = getPlayer();
    if (!player) return;
    if (player === this.player) return;

    this.player = player;

    this.player.addEventListener('onStateChange', (state: number) => {
      const currentTime = this.player.getCurrentTime();
      const isPlaying = state === 1 || state === 3;
      log(`onStateChange, state: ${state}, time: ${currentTime}`);
      showPlayerControls(state !== 1);

      if (this.ready) {
        return;
      }

      if ([1, 2, 3].includes(state)) {
        this._timeReady = Math.abs(currentTime - this.lastTime) < 1;
      }

      if (this._timeReady && this._didInteract) {
        this.ready = true;
        this.player.unMute();
      }

      if (!this.ready && isPlaying) this.player.pauseVideo();
    });

    // SOCKET.IO

    this.socket = io(host);

    this.socket.on('connect', () => log('socket connected'));
    this.socket.on('disconnect', () => {
      log('socket disconnected');
      this.reset();
    });

    this.socket.on('time-update', (id: string, time: number) => this.incomingUpdate(id, time));
  }

  private async firstCall() {
    log('firstCall');
    if (!this.isMobile) this.player.pauseVideo();
    this.player.mute();
    this.player.onclick = () => this._didInteract = true;

    if (this.lastTime === -1) {
      const time = await this.socket.emitWithAck('get', this.videoId);
      if (!time) {
        this.socket.emit('set', this.videoId, 0.01);
      }

      this.lastTime = time || 0.01;
    }

    this.player.seekTo(this.lastTime, true);
  }

  private async regularCall() {
    log('regularCall');
    const currentTime = this.player.getCurrentTime();

    if (this.isPlaying()) {
      log(`video playing, recording time: ${currentTime}`);
      this.socket.emit('set', this.videoId, currentTime);
      this.lastTime = currentTime;
    }
  }

  private incomingUpdate(id: string, time: number) {
    if (id !== this.videoId) return;
    log(`setting time to ${time}`);
    this.lastTime = time;
    if (!this.isPlaying()) this.player.seekTo(this.lastTime, true);
  }

  private reset() {
    this.ready = false;
    this._timeReady = false;
    this._didInteract = this.isMobile; // disable interact check on mobile
    this.lastTime = -1;
  }

  private isPlaying = () => {
    const playerState = this.player.getPlayerState();
    return playerState === 1 || playerState === 3;
  };

  private writePercentToTitle = throttle(() => {
    const percent = this.player.getCurrentTime() / this.player.getDuration() * 100;
    const title = document.title.replace(/^\d?\d?\d%\s/, '');
    log(`percent: ${percent}`);

    document.title = `${Math.round(percent)}% ${title}`;
  }, 2000, { trailing: true, leading: true });
}

export default new VideoTimeManagement();