import { phrases } from "./phrases.js";

chrome.runtime.onInstalled.addListener(() => {

    /* Use phrases.js as default when installed */
    chrome.storage.local.set({ "phrases": phrases });
    chrome.storage.local.set({ "phraseMap": flattenPhrases(phrases) });

    // Create context menus
    loadmenus(phrases);
});

chrome.runtime.onConnect.addListener(port => {
    /* Get tab id for content script */
    if (port.name == "content-script") {
        chrome.storage.local.set({ "csTab": port.sender.tab.id });

        /* Clear id when content script disconnects */
        port.onDisconnect.addListener(() => {
            chrome.storage.local.set({ "csTab": null });
        });
    }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        const result = await chrome.storage.local.get(["phraseMap", "csTab"]);
        const phraseMap = new Map(result.phraseMap);
        let ptext = phraseMap.get(info.menuItemId);

        if (result.csTab) {
            chrome.tabs.sendMessage(result.csTab, { type: "phrase", msg: ptext });
        }
        else {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: addtext,
                args: [ptext],
            });
        }
    } catch (error) {
        console.log(error);
    }
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
    /* Update context menus when phrases change */
    if (changes.phrases) {
        let result = await chrome.storage.local.get(["phrases"]);

        // Generate new map
        let phraseMap = flattenPhrases(result.phrases);
        chrome.storage.local.set({ "phraseMap": phraseMap });

        chrome.contextMenus.removeAll();
        loadmenus(result.phrases);
    }
});

/**
 * Generate context menus for phrases
 * @param phraseobj Phrases to load
 */
function loadmenus(phraseobj) {
    for (const group of phraseobj.groups) {
        createCM(group.gid, null, group.gtitle);

        for (const pgroup of group.phrasegroups) {
            // If phrasegroup id is null, set group id as parent
            const pparent = (pgroup.pgid ? pgroup.pgid : group.gid);

            // Create menu for phrasegroup if there is one
            if (pgroup.pgid) {
                createCM(pgroup.pgid, group.gid, pgroup.pgtitle);
            }

            // Create menus for phrases in phrasegroup
            for (const phrase of pgroup.phrases) {
                createCM(phrase.pid, pparent, phrase.ptitle);
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
 * Append text to document's active element
 * @param {string} t Text to append
 */
function addtext(t) {
    try {
        const menubar = document.getElementById("previewerInner");

        if (menubar) {
            const oldactive = document.activeElement;

            let oldphrase = document.getElementById("phrase-box");
            if (oldphrase) {
                oldphrase.remove();
            }

            let tbox = document.createElement('textarea');
            tbox.id = "phrase-box";
            tbox.value = t;
            tbox.style.boxSizing = "border-box";
            tbox.style.width = "100%";
            document.getElementById("previewerInner").prepend(tbox);
            tbox.focus();
            tbox.select();
            document.execCommand('copy');
            oldactive.focus();

        } else {
            document.activeElement.value = document.activeElement.value + t;
        }

    } catch (error) {
        console.log(error);
    }
}

/**
 * Map phrase ids to phrase text
 * @param phrases Phrase data
 * @returns Array of key-value pairs
 */
function flattenPhrases(phrases) {
    let phraseMap = Array();
    for (const group of phrases.groups) {
        for (const phrasegroup of group.phrasegroups) {
            for (const phrase of phrasegroup.phrases) {
                phraseMap.push([phrase.pid, phrase.ptext]);
            }
        }
    }
    return phraseMap;
}
