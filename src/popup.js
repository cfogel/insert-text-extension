const phraseData = await chrome.storage.local.get(["phrases"]);

for (const group of phraseData.phrases.groups) {
    let select = document.createElement('select');
    select.id = group.gid;

    let title = new Option(`---${group.gtitle}---`, '', true, true);
    title.disabled = true;
    select.add(title);

    for (const phrasegroup of group.phrasegroups) {
        let pparent = select;
        if (phrasegroup.pgid) {
            pparent = document.createElement('optgroup');
            pparent.id = phrasegroup.pgid;
            pparent.label = phrasegroup.pgtitle;
        }

        for (const phrase of phrasegroup.phrases) {
            let option = new Option(phrase.ptitle, phrase.pid);

            pparent.append(option);

            select.addEventListener('change', async (event) => {
                if (select.value == phrase.pid) {
                    let tbox = document.createElement('textarea');
                    tbox.value = phrase.ptext;
                    let cTab = await chrome.storage.local.get(["csTab"]);
                    chrome.tabs.sendMessage(cTab.csTab, { type: "phrase", msg: phrase.ptext });
                    document.body.append(tbox);
                    tbox.focus();
                    tbox.select();
                    document.execCommand('copy');
                }
            });
        }

        if (phrasegroup.pgid) { select.add(pparent); }
    }

    document.body.append(select);
}
