if (document.body.childElementCount == 1) {
    var port = chrome.runtime.connect({ name: "content-script" });
    chrome.runtime.onMessage.addListener((result, sender) => {
        var tarea = document.activeElement;
        if (tarea) {
            tarea.value = tarea.value + result.msg;
            tarea.dispatchEvent(new Event('input', { bubbles: true }));
        }

    });
}
