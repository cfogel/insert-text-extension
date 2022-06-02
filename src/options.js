import { phrases } from "./phrases.js";

const gselect = document.getElementById("groups-list");
const pgselect = document.getElementById("phrase-groups-list");
const pselect = document.getElementById("phrases-list");
const ptext = document.getElementById('selected-phrase-text');

for (const group of phrases.groups) {
    let gopt = new Option(group.gtitle, group.gid);

    gselect.add(gopt);

    gselect.addEventListener('change', async (event) => {
        if (gselect.value == group.gid) {

            clearselect(pgselect);
            clearselect(pselect)

            pgselect.item(0).text = "Select Phrase Group";

            for (const phrasegroup of group.phrasegroups) {
                let pgid = phrasegroup.pgid;
                if (!pgid) { pgid = "null" }
                let pgopt = new Option(phrasegroup.pgtitle, pgid);

                pgselect.add(pgopt);

                pgselect.addEventListener('change', async (event) => {
                    if (pgselect.value == pgid) {

                        clearselect(pselect);

                        pselect.item(0).text = "Select Phrase";

                        for (const phrase of phrasegroup.phrases) {
                            let popt = new Option(phrase.ptitle, phrase.pid);
                            pselect.add(popt);

                            pselect.addEventListener('change', async (event) => {
                                if (pselect.value == phrase.pid) {
                                    ptext.innerText = phrase.ptext;
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}

function clearselect(select) {
    for (let i = select.length - 1; i > 0; i--) { select.remove(i); }
    select.item(0).text = "--------------------------";
    select.selectedIndex = 0;
    ptext.innerText = null;
}