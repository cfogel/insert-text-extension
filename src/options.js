const gselect = document.getElementById("groups-list");
const pgselect = document.getElementById("phrase-groups-list");
const pselect = document.getElementById("phrases-list");
const seltext = document.getElementById('selected-phrase-text');

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


/*
 * Button event listeners
 */

// Show form to add new phrase
newbtn.addEventListener('click', async (event) => {
    unhideElements(addpdiv);
    clearValues(newpid, newtitle, newtext);
    hideElements(seltext, updatetext, updatebtn);
    editbtn.disabled = true;
});

// Add the new phrase and save it to storage
savebtn.addEventListener('click', async (event) => {

    /** New phrase to be inserted */
    const newphrase = {
        pid: newpid.value,
        ptitle: newtitle.value,
        ptext: newtext.value
    };

    chrome.storage.local.get(["phrases"], async (result) => {

        /** Current phrases in storage */
        const pdata = await result.phrases;

        const newobj = addPhrase(pdata, gselect.value, pgselect.value, newphrase);

        /* Clear form */

        clearValues(newpid, newtitle, newtext);
        hideElements(addpdiv);
        unhideElements(seltext);

        // Save updated object, refresh select lists
        chrome.storage.local.set({ 
            "phrases": newobj 
        }, async (result) => {
            loadphrases();
        });
    });
});

// Show form to edit phrase
editbtn.addEventListener('click', async (event) => {

    unhideElements(updatetext, updatebtn);

    // Put current text of phrase in textarea
    updatetext.value = seltext.innerText;
    hideElements(seltext);
});

// Save the updated phrase
updatebtn.addEventListener('click', async (event) => {
    
    chrome.storage.local.get(["phrases"], async (result) => {

        /** Current phrases in storage */
        const pdata = await result.phrases;

        const newobj = updatePhrase(pdata, gselect.value, pgselect.value, pselect.value, updatetext.value);

        /* Clear form */

        hideElements(updatetext, updatebtn);
        unhideElements(seltext);

        // Save updated object, refresh select lists
        chrome.storage.local.set({ 
            "phrases": newobj 
        }, async (result) => {
            loadphrases();
        });
    });
});

// Open new file, load phrase data from JSON
filein.addEventListener('change', async (event) => {

    let [file] = filein.files;
    file.text().then((res) => {
        chrome.storage.local.set({ 
            "phrases": JSON.parse(res) 
        }, async (result) => {
            loadphrases();
        });
    });
});


/*
  Button functions
*/

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
    const g = pdata.groups.findIndex(function (gr) {
        return gr.gid == group;
    });

    /** Array index of selected phrase group */
    const pg = pdata.groups[g].phrasegroups.findIndex(function (pgr) {
        return (pgroup == "null" ? !pgr.pgid : pgr.pgid == pgroup);
    });

    pdata.groups[g].phrasegroups[pg].phrases.push(newp);

    return pdata;
}

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
    const g = pdata.groups.findIndex(function (gr) {
        return gr.gid == group;
    });

    /** Array index of selected phrase group */
    const pg = pdata.groups[g].phrasegroups.findIndex(function (pgr) {
        return (pgroup == "null" ? !pgr.pgid : pgr.pgid == pgroup);
    });

    /** Array index of phrase being updated */
    const p = pdata.groups[g].phrasegroups[pg].phrases.findIndex(function (pr) {
        return pr.pid == prid;
    });

    pdata.groups[g].phrasegroups[pg].phrases[p].ptext = newtext;

    return pdata;
}


/*
  Select list functions
*/

/** Populate select lists with phrase data */
function loadphrases() {

    // Clear all three select lists
    clearselect(gselect, pgselect, pselect);
    hideElements(newbtn);
    gselect.item(0).text = "Select Group";

    /* Get phrases from storage */
    chrome.storage.local.get(["phrases"], async (result) => {

        /* Add groups to group list */
        for (const group of result.phrases.groups) {

            const gopt = new Option(group.gtitle, group.gid);
            gselect.add(gopt);

            /* Event listener for new group being selected */
            addGroupSelectEvent(group.gid, group.phrasegroups);
        }
        sizeselects();
    });
}

/**
 * Add event listener for group being selected
 * @param {string} gid Group ID
 * @param phrasegroups Phrasegroups in group
 */
function addGroupSelectEvent(gid, phrasegroups) {

    gselect.addEventListener('change', async (event) => {
        if (gselect.value == gid) {

            // Clear phrase and phrasegroup lists
            clearselect(pgselect, pselect);

            // Hide new phrase button
            hideElements(newbtn);

            pgselect.item(0).text = "Select Phrase Group";

            /* Add phrasegroups to phrasegroup list */
            addPhrasegroupSelectItems(phrasegroups);
        }
    });
}

/**
 * Add phrasegroups to phrasegroup select list
 * @param phrasegroups Phrasegroups to add
 */
function addPhrasegroupSelectItems(phrasegroups) {
    for (const phrasegroup of phrasegroups) {

        // Handle phrases not in a phrasegroup
        const pgid = (phrasegroup.pgid ? phrasegroup.pgid : "null");
        const pgt = (phrasegroup.pgtitle ? phrasegroup.pgtitle : "n/a");

        // Add option to list
        const pgopt = new Option(pgt, pgid);
        pgselect.add(pgopt);

        /* Event listener for new phrasegroup being selected */
        addPhrasegroupSelectEvent(pgid, phrasegroup.phrases);
    }
    sizeselects();
}

/**
 * Add event listener for phrasegroup being selected
 * @param {string} pgid Phrasegroup ID
 * @param phrases Phrases in phrasegroup
 */
function addPhrasegroupSelectEvent(pgid, phrases) {

    pgselect.addEventListener('change', async (event) => {
        if (pgselect.value == pgid) {

            // Clear phrase list
            clearselect(pselect);

            // Unhide new button
            unhideElements(newbtn);

            pselect.item(0).text = "Select Phrase";

            /* Add phrases in phrasegroup */
            addPhraseSelectItems(phrases);
        }
    });
}

/**
 * Add phrases to phrase select list
 * @param phrases Phrases to add
 */
function addPhraseSelectItems(phrases) {
    for (const phrase of phrases) {

        // Add option to list
        const popt = new Option(phrase.ptitle, phrase.pid);
        pselect.add(popt);

        /* Event listener for new phrase being selected */
        addPhraseSelectEvent(phrase.pid, phrase.ptext);
    }
    sizeselects();
}

/**
 * Add event listener to display text of selected phrase
 * @param {string} pid Phrase ID
 * @param {string} ptext Phrase text
 */
function addPhraseSelectEvent(pid, ptext) {

    pselect.addEventListener('change', async (event) => {
        if (pselect.value == pid) {

            // Hide new/edit forms
            hideElements(addpdiv, updatetext, updatebtn);
            unhideElements(seltext);

            // Display text of selected phrase
            seltext.innerText = ptext;

            // Enable edit button
            editbtn.disabled = false;
        }
    });
}


/*
  Utility functions
*/

/**
 * Remove all items from list, select blank disabled option
 * @param {...HTMLSelectElement} lists Select lists to clear
 */
function clearselect(...lists) {
    // Clear all items except first
    for (const select of lists) {
        for (let i = select.length - 1; i > 0; i--) {
            select.remove(i);
        }

        select.item(0).text = "--------------------------";
        select.selectedIndex = 0;
    }

    sizeselects();

    // Hide new/edit forms
    hideElements(addpdiv, updatetext, updatebtn);
    unhideElements(seltext, editbtn);

    // Clear selected phrase text
    seltext.innerText = null;
    editbtn.disabled = true;
}

/** Set all lists to length of largest, max of 8 */
function sizeselects() {
    const max = Math.max(gselect.length, pgselect.length, pselect.length);
    gselect.size = pgselect.size = pselect.size = (max > 8 ? 8 : max);
}

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

/**
 * Clear the value of elements
 * @param  {...HTMLElement} args Elements to clear
 */
function clearValues(...args) {
    for (const e of args) {
        e.value = "";
    }
}
