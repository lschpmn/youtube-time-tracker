const UNLOAD_TIMEOUT = 30 * 60 * 1000;
const REFRESH_TIME = 15 * 60 * 1000;
const MAX_RELOADS = 3;

const HOST = 'http://127.0.0.1:50300';

const percentRegex = /^(\d+)%\d+[HMS]\s/;

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

  tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
  let count = 0;

  tabs.forEach(tab => {
    if (!tab.discarded || count >= MAX_RELOADS) return

    const result = percentRegex.exec(tab.title);

    if (!result) {
      console.log('reload- title', tab.title);
      reloadTab(tab.id, count);
      count++;
      return;
    }

    const id = (new URL(tab.url)).searchParams.get('v');
    const videoObj = videoObjs[id];

    if (!videoObj || !videoObj?.duration) {
      console.log('reload- duration', tab.title);
      reloadTab(tab.id, count);
      count++;
      return;
    }

    const percentTitle = +result[1];
    const percentServer = videoObj.time / videoObj.duration * 100;
    const percentDiff = percentServer - percentTitle;

    if (percentDiff > 10) {
      console.log('reload- percent diff', percentDiff, tab.title);
      reloadTab(tab.id, count);
      count++;
    }
  });
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

function reloadTab(tabId, count) {
  setTimeout(
    () => browser.tabs.reload(tabId),
    (count + 1) * 1000
  );
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