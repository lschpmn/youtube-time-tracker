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

// TODO: see when video ends and send delete command to server

const host = 'http://127.0.0.1:50300';
let canContinue = false;
let checks = 1;
let lastId = '';
let lastTimeSent = -1;
let globalVideo;

(function () {
  'use strict';
  singularCallCheckTime(25);

  async function checkTime() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('v');
    const video = document.querySelector('video');

    if (id && video) {
      if (lastId !== id) {
        await firstLoad(id);
      }

      if (!canContinue) return;

      const currentTime = Math.floor(video.currentTime);
      await sendTimeToServer(id, currentTime);

      if (globalVideo !== video) {
        globalVideo = video;
        video.addEventListener('play', () => {
          singularCallCheckTime(25);
        });
      }

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
   * @param {String} id
   * @returns {Promise<void>}
   */
  async function firstLoad(id) {
    lastId = id;
    const time = await getTimeFromServer(id);
    const url = new URL(window.location.href);
    const timeStr = url.searchParams.get('t');
    const videoTime = +timeStr?.slice(0, -1);

    log(`server time: ${time}, video time: ${videoTime}`);
    if (!!time && time !== videoTime) {
      url.searchParams.set('t', `${time}s`);
      window.location.href = url.href;
    } else {
      canContinue = true;
    }
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
    clearTimeout(window._timeoutId);
    window._timeoutId = setTimeout(() => checkTime().catch(log), timeout);
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