import { phrases } from "./phrases.js";

var events = Array();
var cTab = 0;

chrome.runtime.onMessage.addListener((result, sender) => {
    if (result.msg == "content script") {
        cTab = sender.tab.id;
    }
    if (result.type == "phrase") {
        chrome.tabs.sendMessage(cTab, result);
    }
});

/** Use phrases.js as default when installed */
chrome.runtime.onInstalled.addListener(() => {

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

/** Update context menus when phrases change */
chrome.storage.onChanged.addListener(async () => {
    let result = await chrome.storage.local.get(["phrases"]);
    for (const e of events) {
        chrome.contextMenus.onClicked.removeListener(e);
    }
    chrome.contextMenus.removeAll();
    loadmenus(result.phrases);
});
