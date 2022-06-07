import { phrases } from "./phrases.js";

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
        chrome.contextMenus.create({
            id: group.gid,
            title: group.gtitle,
            type: 'normal',
            contexts: ['editable']
        });

        for (const pgroup of group.phrasegroups) {
            let pparent = group.gid;
            if (pgroup.pgid) {
                chrome.contextMenus.create({
                    id: pgroup.pgid,
                    parentId: group.gid,
                    title: pgroup.pgtitle,
                    type: 'normal',
                    contexts: ['editable']
                });
                pparent = pgroup.pgid;
            }

            for (const phrase of pgroup.phrases) {
                chrome.contextMenus.create({
                    id: phrase.pid,
                    parentId: pparent,
                    title: phrase.ptitle,
                    type: 'normal',
                    contexts: ['editable']
                });

                chrome.contextMenus.onClicked.addListener((info, tab) => {
                    if (info.menuItemId == phrase.pid) {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: addtext,
                            args: [phrase.ptext],
                        });
                    }
                });
            }
        }
    }
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
        chrome.contextMenus.removeAll();
        loadmenus(result.phrases);
    });
});
