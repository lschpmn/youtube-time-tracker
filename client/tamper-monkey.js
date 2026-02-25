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

// TODO: use navigation api to respond to youtube page changes: https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
// TODO: add singular function to call 'checkTime' and clear timeout ids so only one is running
// TODO: add 'onplay' listener to respond to user playing video, keep timeout as fallback

const host = 'http://127.0.0.1:50300';
let checks = 1;
let lastId = '';

(function() {
  'use strict';
  checkTime().catch(console.log);

  async function checkTime() {
    const id = grabVideoId();
    const video = document.querySelector('video');

    if (id && video) {
      if (lastId !== id) {
        lastId = id;
        // first time!
        const time = await getTimeFromServer(id);
        log('the time is ' + time);
        video.onplaying = () => {
          log('attempting to set time to ' + time);
          video.currentTime = +time;
          video.onplaying = null;
          video.pause();
        }

      }

      const currentTime = Math.floor(video.currentTime);
      await sendTimeToServer(id, currentTime);

      if (!video.paused) {
        checks = 1;
        setTimeout(checkTime, 1000);
        showPlayerControls(false);
        return
      }
    }

    setTimeout(checkTime, Math.min(30, 2 * checks++) * 1000);
    showPlayerControls(true);
  }

  /**
   *
   * @param {string} id
   * @returns {Promise<string>}
   */
  async function getTimeFromServer(id) {
    const response = await fetch(`${host}/api/time/${id}`);

    return await response.text();
  }

  /**
   *
   * @param {string} id
   * @param {number} time
   */
  async function sendTimeToServer(id, time) {
    log(`current time: ${time}`);

    const response = await fetch(`${host}/api/time/${id}`, {
      method: 'POST',
      body: `{ "time": ${time} }`,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   *
   * @returns {string | null}
   */
  function grabVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('v');
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

})();

function log(message) {
  console.log('see me, ' + message);
}