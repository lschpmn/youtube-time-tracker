import { MediaPlayer } from './types';


export function getVideo(): HTMLVideoElement {
  return document.querySelector('video');
}

export function getPlayer(): MediaPlayer {
  return document.getElementById('movie_player') as any as MediaPlayer;
}

export function getRemainingTime(currentTime: number, duration: number) {
  const remaining = duration - currentTime;

  if (remaining > 3600) {
    return `${Math.floor(remaining / 3600)}H`;
  } else if (remaining > 60) {
    return `${Math.floor(remaining / 60)}M`;
  } else {
    return `${Math.floor(remaining )}S`;
  }
}

export function getVideoId(): string {
  const url = new URL(window.location.href);
  return url.searchParams.get('v');
}

export function log(message: string) {
  console.log('see me, ' + message);
}

export function showPlayerControls(show: boolean) {
  const elem = document.querySelector('.ytp-chrome-bottom');
  if (elem) {
    if (show) {
      // @ts-ignore
      document.querySelector('.ytp-chrome-bottom').style.opacity = '1';
    } else {
      // @ts-ignore
      document.querySelector('.ytp-chrome-bottom').style.removeProperty('opacity');
    }

  }
}