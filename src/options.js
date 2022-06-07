const gselect = document.getElementById("groups-list");
const pgselect = document.getElementById("phrase-groups-list");
const pselect = document.getElementById("phrases-list");
const ptext = document.getElementById('selected-phrase-text');

const filein = document.getElementById('file-input');

const newbtn = document.getElementById("new-phrase-btn");
const addpdiv = document.getElementById("add-phrase");
const newpid = document.getElementById("new-phrase-pid");
const newtitle = document.getElementById("new-phrase-title");
const newtext = document.getElementById("new-phrase-text");
const savebtn = document.getElementById("save-new-phrase");

const editbtn = document.getElementById("edit-btn");
const updatetext = document.getElementById("update-phrase-text");
const updatebtn = document.getElementById("save-update");

loadphrases();

/**
 * Populate select lists with phrase data
 */
function loadphrases() {

    /* Clear all three select lists */
    clearselect(gselect, pgselect, pselect);
    hideElements(newbtn);
    gselect.item(0).text = "Select Group";

    /* Get phrases from storage */

    chrome.storage.local.get(["phrases"], async (result) => {

        /* Loop through groups, adding to group list */

        for (const group of result.phrases.groups) {
            let gopt = new Option(group.gtitle, group.gid);

            gselect.add(gopt);

            /* Add event listener for new group being selected */

            gselect.addEventListener('change', async (event) => {
                if (gselect.value == group.gid) {

                    clearselect(pgselect, pselect);
                    hideElements(newbtn, addpdiv, updatetext, updatebtn);

                    pgselect.item(0).text = "Select Phrase Group";

                    /* Loop through phrasegroups, adding to phrasegroup list */

                    for (const phrasegroup of group.phrasegroups) {

                        // Handle phrases not in phrasegroup
                        let pgid = phrasegroup.pgid;
                        if (!pgid) { pgid = "null"; }
                        let pgopt = new Option(phrasegroup.pgtitle, pgid);
                        if (!pgopt.text) { pgopt.text = "n/a"; }

                        pgselect.add(pgopt);

                        /* Add event listener for new phrasegroup being selected */

                        pgselect.addEventListener('change', async (event) => {
                            if (pgselect.value == pgid) {

                                clearselect(pselect);
                                hideElements(addpdiv, updatetext, updatebtn);
                                unhideElements(newbtn);

                                pselect.item(0).text = "Select Phrase";

                                /* Add phrases in phrasegroup */

                                for (const phrase of phrasegroup.phrases) {
                                    let popt = new Option(phrase.ptitle, phrase.pid);
                                    pselect.add(popt);

                                    /* Display text of selected phrase */

                                    pselect.addEventListener('change', async (event) => {
                                        if (pselect.value == phrase.pid) {
                                            hideElements(addpdiv, updatetext, updatebtn);
                                            unhideElements(ptext);
                                            ptext.innerText = phrase.ptext;
                                            editbtn.disabled = false;
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
 * @param {...HTMLSelectElement} lists Select lists to clear
 */
function clearselect(...lists) {
    for (const select of lists) {
        for (let i = select.length - 1; i > 0; i--) { select.remove(i); }
        select.item(0).text = "--------------------------";
        select.selectedIndex = 0;
        sizeselects();
        ptext.innerText = null;
        editbtn.disabled = true;
    }
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
    unhideElements(addpdiv);
    hideElements(ptext, updatetext, updatebtn);
    editbtn.disabled = true;
});

/**
 * Add the new phrase and save updated object to storage
 */
savebtn.addEventListener('click', async (event) => {

    /** New phrase to be inserted */
    let newphrase = {
        pid: newpid.value,
        ptitle: newtitle.value,
        ptext: newtext.value
    };

    chrome.storage.local.get(["phrases"], async (result) => {

        /** Current phrases in storage */
        let pdata = await result.phrases;

        let newobj = addPhrase(pdata, gselect.value, pgselect.value, newphrase);

        /* Clear form */

        clearValues(newpid, newtitle, newtext);
        hideElements(addpdiv);
        unhideElements(ptext);

        /* Save updated object, refresh select lists */
        chrome.storage.local.set({ "phrases": newobj }, async (result) => { loadphrases(); });
    });

});

/**
 * Add a new phrase
 * @param pdata Phrase object
 * @param {string} group Group of new phrase
 * @param {string} pgroup Phrasegroup of new phrase
 * @param newp Phrase to be inserted
 * @returns Updated phrase object
 */
function addPhrase(pdata, group, pgroup, newp) {

    /** Array index of selected group */
    let g = pdata.groups.findIndex(function (gr) {
        return gr.gid == group;
    })

    /** Array index of selected phrase group */
    let pg = pdata.groups[g].phrasegroups.findIndex(function (pgr) {
        return (pgroup == "null" ? !pgr.pgid : pgr.pgid == pgroup);
    })

    pdata.groups[g].phrasegroups[pg].phrases.push(newp);

    return pdata;
}

/** Show form to edit phrase */
editbtn.addEventListener('click', async (event) => {
    unhideElements(updatetext, updatebtn);
    updatetext.value = ptext.innerText;
    hideElements(ptext);
})

/**
 * Hide elements
 * @param  {...HTMLElement} args Elements to hide
 */
function hideElements(...args) {
    for (const e of args) {
        if (e.style.display != "none") {
            e.style.display = "none";
        }
    }
}

/**
 * Unhide elements
 * @param  {...HTMLElement} args Elements to unhide
 */
function unhideElements(...args) {
    for (const e of args) {
        if (e.style.display == "none") {
            e.style = "";
        }
    }
}

/** Save the updated phrase */
updatebtn.addEventListener('click', async (event) => {
    chrome.storage.local.get(["phrases"], async (result) => {

        /** Current phrases in storage */
        let pdata = await result.phrases;

        let newobj = updatePhrase(pdata, gselect.value, pgselect.value, pselect.value, updatetext.value);

        /* Clear form */

        hideElements(updatetext, updatebtn);
        unhideElements(ptext);

        /* Save updated object, refresh select lists */
        chrome.storage.local.set({ "phrases": newobj }, async (result) => { loadphrases(); });
    });

})

/**
 * Update the text of a phrase
 * @param pdata Phrase object
 * @param {string} group Group ID
 * @param {string} pgroup Phrasegroup ID
 * @param {string} prid Phrase ID
 * @param {string} newtext New phrase text
 * @returns Updated phrase object
 */
function updatePhrase(pdata, group, pgroup, prid, newtext) {

    /** Array index of selected group */
    let g = pdata.groups.findIndex(function (gr) {
        return gr.gid == group;
    })

    /** Array index of selected phrase group */
    let pg = pdata.groups[g].phrasegroups.findIndex(function (pgr) {
        return (pgroup == "null" ? !pgr.pgid : pgr.pgid == pgroup);
    })

    let p = pdata.groups[g].phrasegroups[pg].phrases.findIndex(function (pr) {
        return pr.pid == prid;
    })

    pdata.groups[g].phrasegroups[pg].phrases[p].ptext = newtext;

    return pdata;

}

/**
 * Clear the value of elements
 * @param  {...HTMLElement} args Elements to clear
 */
function clearValues(...args) {
    for (const e of args) {
        e.value = "";
    }
}
