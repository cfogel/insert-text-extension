import { phrases } from "./phrases.js";

var events = Array();

/** Use phrases.js as default when installed */
chrome.runtime.onInstalled.addListener(async () => {

    // Save it to storage
    chrome.storage.local.set({ "phrases": phrases });

    // Create context menus
    loadmenus(phrases);
});

/**
 * Generate context menus for phrases
 * @param phraseobj Phrases to load
 */
function loadmenus(phraseobj) {
    for (const group of phraseobj.groups) {
        createCM(group.gid, null, group.gtitle);

        for (const pgroup of group.phrasegroups) {
            const pparent = (pgroup.pgid ? pgroup.pgid : group.gid);
            if (pgroup.pgid) {
                createCM(pgroup.pgid, group.gid, pgroup.pgtitle);
            }

            for (const phrase of pgroup.phrases) {
                createCM(phrase.pid, pparent, phrase.ptitle);
                addContextMenuListener(phrase.pid, phrase.ptext);
            }
        }
    }
}

/**
 * Create context menu with type 'normal' and context 'editable'
 * @param {string} id Context menu id
 * @param {string} parentId Context menu parentID
 * @param {string} title Context menu title
 */
function createCM(id, parentId, title) {
    chrome.contextMenus.create({
        id,
        parentId,
        title,
        type: 'normal',
        contexts: ['editable']
    });
}

/**
 * Add context menu listener for phrase
 * @param {string} pid Phrase ID
 * @param {string} ptext Phrase text
 */
function addContextMenuListener(pid, ptext) {
    let l = events.push((info, tab) => {
        if (info.menuItemId == pid) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: addtext,
                args: [ptext],
            });
        }
    });
    chrome.contextMenus.onClicked.addListener(events[l - 1]);
}

/**
 * Append text to document's active element
 * @param {string} t Text to append
 */
function addtext(t) {
    document.activeElement.value = document.activeElement.value + t;
}

/** Message handling */
chrome.runtime.onMessage.addListener(
    function (msg, sender, sendResponse) {
        if (msg.cmd == "ins") {
            chrome.scripting.executeScript({
                target: { tabId: msg.tabId },
                func: addtext,
                args: [msg.ptext],
            });
        }
        return true;
    }
);

/** Update context menus when phrases change */
chrome.storage.onChanged.addListener(() => {
    chrome.storage.local.get(["phrases"], async (result) => {
        for (const e of events) {
            chrome.contextMenus.onClicked.removeListener(e);
        }
        chrome.contextMenus.removeAll();
        loadmenus(result.phrases);
    });
});
