let type = {
    watched: 'watched',
    popup:'popup'
}

let tabBadgeMap = new Map()

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(sender.tab));

    switch (request.type) {
        case type.watched:
            tabBadgeMap.set(sender.tab.id, type.watched)
            badgeShow()
            break;
    }
});

chrome.tabs.onSelectionChanged.addListener(function (id) {
    if (tabBadgeMap.has(id)) {
        badgeShow()
    }
    else {
        badgeHide()
    }
});

function badgeShow() {
    chrome.browserAction.setBadgeText({text: 'w'})
    chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]})
}

function badgeHide() {
    chrome.browserAction.setBadgeText({text: ''})
    chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]})
}

function sendTestMsg(tabId, msg) {
    chrome.tabs.sendMessage(tabId, msg, function (response) {
        if (callback) callback(response);
    });
}