if (document.body.childElementCount == 1) {
    chrome.storage.onChanged.addListener(() => {
        var tarea = document.querySelector(".PSPDFKit-Comment-Thread .PSPDFKit-Comment-Editor .PSPDFKit-Comment-Editor-Input");
        if (tarea) {
            var phrase = await chrome.storage.local.get(['text']);
            tarea.value = tarea.value + phrase.text;
        }
    });
}