import {phrases} from "./phrases.js";

for (const group of phrases.groups) {
    let select = document.createElement('select');
    select.id = group.gid;

    let title = new Option('---' + group.gtitle + '---', '', true, true);
    title.disabled = true;
    select.add(title);

    for (const phrase of group.phrases) {
        let option = new Option(phrase.ptitle, phrase.pid);

        select.add(option);

        select.addEventListener('change', async(event) => {
            if (select.value == phrase.pid) {
                let tbox = document.createElement('textarea');
                tbox.value = phrase.ptext;
                document.body.append(tbox);
                tbox.focus();
                tbox.select();
                document.execCommand('copy');
            }
        });
    }

    document.body.append(select);
}
