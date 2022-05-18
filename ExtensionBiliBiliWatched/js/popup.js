let type = {
    watched: 'watched',
    popup: 'popup'
}

let title = $('.title')

function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

sendMessageToContentScript({type: type.popup}, function (response) {
    console.log(response);

    if (response.length === 0) {
        title.text('没看过这个')
    } else {
        title.text('看过这个了')
        for (const i in response) {
            if (response.hasOwnProperty(i)) {
                let record = response[i]
                $('.record-list').append('<li>\n' +
                    '        <span>' + record.time + '</span>\n' +
                    '        <span>观看至：' + record.now + '&nbsp;|&nbsp;' + record.total + '</span>\n' +
                    '    </li>')
            }
        }
    }
});