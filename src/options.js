const gselect = document.getElementById("groups-list");
const pgselect = document.getElementById("phrase-groups-list");
const pselect = document.getElementById("phrases-list");
const ptext = document.getElementById('selected-phrase-text');

const filein = document.getElementById('file-input');
const fileres = document.getElementById("filedata");

const newbtn = document.getElementById("new-phrase-btn");
const addpdiv = document.getElementById("add-phrase");
const newpid = document.getElementById("new-phrase-pid");
const newtitle = document.getElementById("new-phrase-title");
const newtext = document.getElementById("new-phrase-text");
const savebtn = document.getElementById("save-new-phrase");

loadphrases();

/**
 * Populate select lists with phrase data
 */
function loadphrases() {
    clearselect(gselect);
    clearselect(pgselect);
    clearselect(pselect);
    gselect.item(0).text = "Select Group";

    /* Get phrases from storage */

    chrome.storage.local.get(["phrases"], async (result) => {

        /* Loop through groups, adding to group list */

        for (const group of result.phrases.groups) {
            let gopt = new Option(group.gtitle, group.gid);

            gselect.add(gopt);

            /* Add event listener for new option being selected */

            gselect.addEventListener('change', async (event) => {
                if (gselect.value == group.gid) {

                    clearselect(pgselect);
                    clearselect(pselect);
                    newbtn.style.display = "none";

                    pgselect.item(0).text = "Select Phrase Group";

                    /* Loop through phrasegroups, adding to phrasegroup list */

                    for (const phrasegroup of group.phrasegroups) {

                        // Handle phrases not in phrasegroup
                        let pgid = phrasegroup.pgid;
                        if (!pgid) { pgid = "null"; }
                        let pgopt = new Option(phrasegroup.pgtitle, pgid);
                        if (!pgopt.text) { pgopt.text = "n/a"; }

                        pgselect.add(pgopt);

                        /* Add event listener for new option being selected */

                        pgselect.addEventListener('change', async (event) => {
                            if (pgselect.value == pgid) {

                                clearselect(pselect);
                                newbtn.style = "";

                                pselect.item(0).text = "Select Phrase";

                                /* Add phrases in phrasegroup */

                                for (const phrase of phrasegroup.phrases) {
                                    let popt = new Option(phrase.ptitle, phrase.pid);
                                    pselect.add(popt);

                                    /* Display text of selected phrase */

                                    pselect.addEventListener('change', async (event) => {
                                        if (pselect.value == phrase.pid) {
                                            addpdiv.style.display = "none";
                                            ptext.style = "";
                                            ptext.innerText = phrase.ptext;
                                        }
                                    });
                                }
                                sizeselects();
                            }
                        });
                    }
                    sizeselects();
                }
            })
        }
        sizeselects();
    });
}

/**
 * Remove all items from list, select blank disabled option
 * 
 * @param {HTMLSelectElement} select The select list to clear
 */
function clearselect(select) {
    for (let i = select.length - 1; i > 0; i--) { select.remove(i); }
    select.item(0).text = "--------------------------";
    select.selectedIndex = 0;
    sizeselects();
    ptext.innerText = null;
}

/**
 * Set all lists to length of largest, max of 8
 */
function sizeselects() {
    let max = Math.max(gselect.length, pgselect.length, pselect.length);
    gselect.size = pgselect.size = pselect.size = (max > 8 ? 8 : max);
}

/**
 * Open new file, load phrase data from JSON
 */
filein.addEventListener('change', async (event) => {
    let [file] = filein.files;
    file.text().then((res) => {
        chrome.storage.local.set({ "phrases": JSON.parse(res) }, async (result) => { loadphrases(); });
    });
});

/**
 * Show form to add new phrase
 */
newbtn.addEventListener('click', async (event) => {
    addpdiv.style = "";
    ptext.style.display = "none";
});

/**
 * Add the new phrase and save updated object to storage
 */
savebtn.addEventListener('click', async (event) => {

    /** Object for new phrase to be inserted */
    let newphrase = {
        pid: newpid.value,
        ptitle: newtitle.value,
        ptext: newtext.value
    };

    /* Get current phrase object from storage */

    chrome.storage.local.get(["phrases"], async (result) => {

        /** Copy of current phrases in storage */
        let newobj = await result.phrases;

        /* Find array indices for group and phrasegroup */

        let g = newobj.groups.findIndex(function (gelement) {
            if (gelement.gid == gselect.value) { return true; }
        });

        let pg = newobj.groups[g].phrasegroups.findIndex(function (pgelement) {
            if (pgelement.pgid == pgselect.value) { return true; }
            if ((pgselect.value == "null") && !pgelement.pgid) { return true; }
        });

        // Add new phrase to phrase array
        newobj.groups[g].phrasegroups[pg].phrases.push(newphrase);

        /* Clear form */

        newpid.value = "";
        newtitle.value = "";
        ptext.value = "";
        addpdiv.style.display = "none";
        ptext.style = "";

        /** Save updated object, refresh select lists */
        chrome.storage.local.set({ "phrases": newobj }, async (result) => { loadphrases(); });
    });

});
