//

// docs https://developers.google.com/youtube/iframe_api_reference
export type MediaPlayer = {

  getCurrentTime: () => number,

  getDuration: () => number,

  mute: () => void,

  playVideo: () => void,

  pauseVideo: () => void,

  stopVideo: () => void,

  seekTo: (seconds: number, allowSeekAhead: boolean) => void,

  unMute: () => void,

  addEventListener: (eventName: string, callback: (e: any) => void) => void;

  onclick: () => void,

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