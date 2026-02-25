// ==UserScript==
// @name         Add time to my server
// @namespace    http://tampermonkey.net/
// @version      2024-06-21
// @description  try to take over the world!
// @author       You
// @match        https://*.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

// TODO:

const host = 'http://127.0.0.1:50300';
let checks = 1;
let firstLoadDone = false;
let timeoutId = 0;
let lastId = '';
let lastTimeSent = -1;
let globalVideo;

(function() {
  'use strict';
  singularCallCheckTime(25);

  async function checkTime() {
    const url = new URL(window.location.href);
    const id= url.searchParams.get('v');
    const video = document.querySelector('video');

    if (id && video) {
      if (lastId !== id) {
        window.video = globalVideo = video;
        await firstLoad(id, video);
        singularCallCheckTime(500);
        return;
      }

      if (!firstLoadDone) {
        if (globalVideo !== video) {
          window.video = globalVideo = video;
          await firstLoad(id, video);
        }
        singularCallCheckTime(500);
        return;
      }

      const currentTime = Math.floor(video.currentTime);
      await sendTimeToServer(id, currentTime);

      if (!video.paused) {
        checks = 1;
        singularCallCheckTime(1000);
        showPlayerControls(false);
        return
      }
    }

    singularCallCheckTime(Math.min(30, 2 * checks++) * 1000);
    showPlayerControls(true);
  }

  /**
   *
   * @param {string} id
   * @param {object} video
   */
  async function firstLoad(id, video) {
    lastId = id;
    // first time!
    const time = await getTimeFromServer(id);
    log('the time is ' + time);
    const onPlaying = () => {
      firstLoadDone = true;
      log('attempting to set time to ' + time);
      video.pause();
      if (time) {
        video.currentTime = time;
      }
      video.onplaying = null;
      video.removeEventListener('timeupdate', onPlaying);
      singularCallCheckTime(1000);
      showPlayerControls(true);
    }
    video.addEventListener('timeupdate', onPlaying);

    video.addEventListener('play', () => {
      singularCallCheckTime(25);
    });
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<number>}
   */
  async function getTimeFromServer(id) {
    const response = await fetch(`${host}/api/time/${id}`);
    const time = await response.text();

    return lastTimeSent = +time;
  }

  /**
   *
   * @param {string} id
   * @param {number} time
   */
  async function sendTimeToServer(id, time) {
    log(`current time: ${time}`);
    if (time === lastTimeSent) return;
    lastTimeSent = time;

    await fetch(`${host}/api/time/${id}`, {
      method: 'POST',
      body: `{ "time": ${time} }`,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   *
   * @param {number} timeout
   */
  function singularCallCheckTime(timeout) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => checkTime().catch(log), timeout);
  }

  /**
   *
   * @param {Boolean} show
   */
  function showPlayerControls(show) {
    const elem = document.querySelector('.ytp-chrome-bottom');
    log('has element ' + !!elem)
    if (elem) {
      if (show) {
        document.querySelector('.ytp-chrome-bottom').style.opacity = '1';
      } else {
        document.querySelector('.ytp-chrome-bottom').style.removeProperty('opacity');
      }

    }
  }

  navigation.addEventListener("navigate", () => {
    singularCallCheckTime(25);
  });

})();

function log(message) {
  console.log('see me, ' + message);
}