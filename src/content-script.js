if (document.body.childElementCount == 1) {
    chrome.runtime.onMessage.addListener((result, sender) => {
        var tarea = document.activeElement;
        if (tarea) {
            tarea.value = tarea.value + result.msg;
            tarea.dispatchEvent(new Event('input', { bubbles: true }));
        }

    });
    chrome.runtime.sendMessage({ type: "content script" });
}
