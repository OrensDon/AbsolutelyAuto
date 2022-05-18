let type = {
    watched: 'watched',
    popup: 'popup'
}

let record = {
    href: location.href,
    bv: '',
    uid: '',
    now: '',
    total: '',
    records: [],
    data: function () {
        return {
            bv: this.bv,
            uid: this.uid,
            now: this.now,
            total: this.total,
        }
    },
    init: function () {
        var script = document.createElement('script')
        script.type = 'text/javascript'
        script.innerHTML += "    if(typeof innerLC === 'undefined')\n" +
            "    var innerLC = 0;\n" +
            "    if(typeof bLoop === 'undefined')\n" +
            "    var bLoop;\n" +
            "    bLoop = setInterval(function () {\n" +
            "        try {\n" +
            "            let fUrl = window.__playinfo__.dash.video[0].backupUrl[0];\n" +
            "            fUrl = fUrl.substring(fUrl.indexOf('&mid=') + 5);\n" +
            "            let fUid = fUrl.substring(0, fUrl.indexOf('&'));\n" +
            "            document.body.setAttribute('data-uid', fUid);\n" +
            "            clearInterval(bLoop);\n" +
            "        } catch (e) {\n" +
            "            innerLC++;\n" +
            "            //重复10s，仍未成功获取uid，判定为获取失败\n" +
            "            if (innerLC >= 100)\n" +
            "                clearInterval(bLoop);\n" +
            "        }\n" +
            "    }, 100)"
        document.head.appendChild(script)
        document.head.removeChild(script)

        let bLoop = setInterval(function () {
            try {
                let uid = document.body.getAttribute('data-uid')
                if (uid != null) {
                    let hrefParts = record.href.split('/')
                    record.bv = hrefParts[4].split('?')[0]
                    record.uid = uid

                    record.now = $('.bilibili-player-video-time-now').text()
                    clearInterval(bLoop)
                    record.run()
                }
            } catch (e) {
                loopCount++
                //重复10s，仍未成功获取uid，判定为获取失败
                if (loopCount >= 100) {
                    console.log('未能成功执行：contentScript')
                    clearInterval(bLoop)
                }
            }
        }, 100)
    },
    save: function () {
        // $.post('http://localhost:8090/record/add', this.data(), function (res) {
        $.post('http://119.91.29.230:8090/record/add', this.data(), function (res) {

        })
    },
    run: function () {

        // $(document.head).append('<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">')

        // $.post('http://localhost:8090/record/history', this.data(), function (res) {
        $.post('http://yoururl/record/history', this.data(), function (res) {
            if (res.code === 0) {
                if (res.data.length > 0) {
                    record.records = res.data
                    chrome.runtime.sendMessage({type: type.watched}, function (response) {

                    });
                }

                let saveLoop = setInterval(function () {
                    let now = $('.bilibili-player-video-time-now').text()
                    if (record.now !== now) {
                        record.now = now
                        record.total = $('.bilibili-player-video-time-total').text()
                        record.save()
                    }

                    //检测url变化
                    if (location.href !== record.href) {
                        record.href = location.href
                        clearInterval(saveLoop)
                        record.init()
                    }
                }, 5000)
            }
        })
    },
}

let loopCount = 0

setTimeout(function () {
    record.init()
}, 100)

function getCurrentTabId(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case type.popup:
            sendResponse(record.records)
            break;
    }
});
