import { phrases } from "./phrases.js";

chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.local.set({ "phrases": phrases });

    loadmenus(phrases);

});

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
                            args: [phrase.ptext]
                        });
                    }
                });
            }
        }
    }
}

function addtext(t) {
    document.activeElement.value = document.activeElement.value + t;
}

chrome.runtime.onMessage.addListener(
    function (msg, sender, sendResponse) {
        chrome.scripting.executeScript({
            target: { tabId: msg.tabId },
            func: addtext,
            args: [msg.ptext]
        });
        return true;
    }
);

chrome.storage.onChanged.addListener(() => {
    chrome.storage.local.get(["phrases"], async (result) => {
        chrome.contextMenus.removeAll();
        loadmenus(result.phrases);
    });
});
