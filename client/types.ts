//

export type MediaPlayer = {

  getCurrentTime: () => number,

  mute: () => void,

  playVideo: () => void,

  pauseVideo: () => void,

  stopVideo: () => void,

  seekTo: (seconds: number, allowSeekAhead: boolean) => void,

  unMute: () => void,

  addEventListener: (eventName: string, callback: (e: any) => void) => void;

  /**
   * -1 – unstarted
   *
   * 0 – ended
   *
   * 1 – playing
   *
   * 2 – paused
   *
   * 3 – buffering
   *
   * 5 – video cued
   */
  getPlayerState: () => number,

};