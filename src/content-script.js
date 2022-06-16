if (document.body.childElementCount == 1) {
    chrome.runtime.onMessage.addListener((result, sender) => {
        var tarea = document.querySelector(".PSPDFKit-Comment-Thread .PSPDFKit-Comment-Editor .PSPDFKit-Comment-Editor-Input");
        if (tarea) {
            tarea.value = tarea.value + result.msg;
        }
    });
    chrome.runtime.sendMessage({ msg: "content script" });
}
