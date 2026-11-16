// TODO: In the middle of adding times to tabs automatically

const UNLOAD_TIMEOUT = 30 * 60 * 1000;
const REFRESH_TIME = 15 * 60 * 1000;
//const HOST = 'http://127.0.0.1:50300';

async function main() {
  /** @type {Tab[]} */
  const tabs = await browser.tabs.query({ url: 'https://*.youtube.com/watch*' });

  const now = Date.now();
  const oldTabs = tabs
    .filter(tab => now - tab.lastAccessed > UNLOAD_TIMEOUT && !tab.discarded)
    .map(tab => {
      console.log(`Will unload - ${tab.title}`)
      return tab.id;
    });
  if (oldTabs.length) await browser.tabs.discard(oldTabs);

  const videoIds = tabs
    .map(tab => {
      const url = new URL(tab.url);
      return url.searchParams.get('v');
    })
    .filter(Boolean);

  const videoObjs = await getTabTimes(videoIds);

  for (let [id, videoObj] of Object.entries(videoObjs)) {
    if (!videoObj.time || !videoObj.duration) continue;
    console.log(id, videoObj);
    console.log(`${
      Math.round(videoObj.time / videoObj.duration)
    }%${getRemainingTime(videoObj.time, videoObj.duration)}`)
  }

  const sleepyTabs = (await browser.tabs.query({ discarded: true }))
    .sort((a, b) => a.lastAccessed - b.lastAccessed);
  console.log(sleepyTabs);
  console.log(new Date(sleepyTabs[0].lastAccessed));
  console.log(new Date(sleepyTabs[sleepyTabs.length -1].lastAccessed));

  console.log(sleepyTabs[0])
  console.log(sleepyTabs[0].url)
  browser.tabs.reload(sleepyTabs[0].id)
  /*await browser.tabs.executeScript(sleepyTabs[0].id, {
    code: 'document.title = "hey buddy!"'
  });*/
}

main().catch(console.log);
setInterval(() => main().catch(console.log), REFRESH_TIME);


/**
 *
 * @param {string[]} tabIds
 * @returns {Promise<void>}
 */
async function getTabTimes(tabIds) {
  const response = await fetch(`${HOST}/api/video-times`, {
    method: 'POST',
    body: JSON.stringify(tabIds),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

function getRemainingTime(currentTime, duration) {
  const remaining = duration - currentTime;

  if (remaining > 3600) {
    return `${Math.floor(remaining / 3600)}H`;
  } else if (remaining > 60) {
    return `${Math.floor(remaining / 60)}M`;
  } else {
    return `${Math.floor(remaining )}S`;
  }
}

/**
 * @typedef {Object} MutedInfo
 * @property {boolean} muted
 * @property {"user" | "capture" | "extension"} [reason]
 * @property {string} [extensionId]
 */

/**
 * @typedef {Object} Tab
 * @property {boolean} active
 * @property {boolean} [attention]
 * @property {boolean} [audible]
 * @property {boolean} [autoDiscardable]
 * @property {string} [cookieStoreId]
 * @property {boolean} [discarded]
 * @property {string} [favIconUrl]
 * @property {number} [groupId]
 * @property {number} [height]
 * @property {boolean} hidden
 * @property {boolean} highlighted
 * @property {number} [id]
 * @property {boolean} incognito
 * @property {number} index
 * @property {boolean} isArticle
 * @property {boolean} isInReaderMode
 * @property {number} [lastAccessed]
 * @property {MutedInfo} [mutedInfo]
 * @property {number} [openerTabId]
 * @property {string} pendingUrl
 * @property {boolean} pinned
 * @property {boolean} selected
 * @property {string} [sessionId]
 * @property {number} [splitViewId]
 * @property {"loading" | "complete"} [status]
 * @property {number} [successorTabId]
 * @property {string} [title]
 * @property {string} [url]
 * @property {number} [width]
 * @property {number} windowId
 */