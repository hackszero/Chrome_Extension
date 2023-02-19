chrome.browserAction.setBadgeText({text: "HZ"});

var _host;
var _key;

chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, function(tabs) {
    var tab = tabs[0];
    _host = extractHostname(tab.url);
    _key = 'hzjavascript_'+host;

    chrome.storage.sync.get(function(obj) {
        var js = obj[_key];
        if (typeof js == undefined) {
            js = {'code':'','enabled':'true','library':'jquery_3_3_1'};
        } else if (typeof js == 'string') {
            js = {'code':js,'enabled':'true','library':'jquery_3_3_1'};
        }
        if (js && js.enabled) {
            if (js.code && js.code!="") {
                chrome.scripting.executeScript(null, {
                    code: js.code
                });
            }
        }
    });

});


