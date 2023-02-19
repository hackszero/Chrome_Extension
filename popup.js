var editor;
var data;
var host;
var key;
var enabled;
var library;


function extractHostname(url) {
    var hostname;
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
}

function saveChanges(dont_run) {
    var _code = editor.getValue();
    var js = {'code':_code, 'enabled':enabled, 'library':library};

    if (_code == undefined || _code == 'undefined') {
        js = {'code':'','enabled':'true', 'library':'jquery_3_3_1'};
    }

    //set the library again...
    library = document.getElementById('slLibrary').value;

    var _data = new Object();
    _data['hzjavascript_'+host] = js;

    chrome.storage.sync.set(_data, function() {});

    if (typeof dont_run === 'undefined') {
        //stop toggleOnHost from running the script again!
    }
    else {
        if (enabled) {
            chrome.scripting.executeScript(null, {
                code: js.code
            });
        }
    }
    document.getElementById("lblUpdated").style.display = "inline-block";
    setTimeout(function() {
        document.getElementById("lblUpdated").style.display = "none";
    }, 2000);
}

function showRightToggleOnHostButton() {
    document.getElementById('chkToggleOnHost').checked = !(!enabled);
}

function toggleOnHost() {
    enabled = !enabled;
    showRightToggleOnHostButton();
    saveChanges(true);
}

function setLibrary() {
    library = document.getElementById('slLibrary').value;
    saveChanges(true);
}

function update_ace_placeholder() {
    var shouldShow = !editor.session.getValue().length;
    var node = editor.renderer.emptyMessageNode;

    var node2 = editor.renderer.emptyMessageNode2;
    if (!shouldShow && node) {
        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode);
        editor.renderer.emptyMessageNode = null;

        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode2);
        editor.renderer.emptyMessageNode2 = null;
        
        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode3);
        editor.renderer.emptyMessageNode3 = null;
    } else if (shouldShow && !node) {
        node = editor.renderer.emptyMessageNode = document.createElement("div");
        node.textContent = "Inject your Javascript here and click 'Save'"
        node.className = "ace_invisible ace_emptyMessage"
        node.style.padding = "0px 5px 5px 5px"
        editor.renderer.scroller.appendChild(node);

        node2 = editor.renderer.emptyMessageNode2 = document.createElement("div");
        node2.textContent = "jQuery is loaded"
        node2.className = "ace_invisible ace_emptyMessage"
        node2.style.padding = "10px 5px 5px 5px"
        editor.renderer.scroller.appendChild(node2);

        node3 = editor.renderer.emptyMessageNode3 = document.createElement("div");
        node3.textContent = "From now it will run on this domain"
        node3.className = "ace_invisible ace_emptyMessage"
        node3.style.padding = "20px 5px 5px 5px"
        editor.renderer.scroller.appendChild(node3);
    }
}

chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, function(tabs) {
    var tab = tabs[0];
    if (tab) {
        host = extractHostname(tab.url);
        key = 'hzjavascript_'+host;
        document.getElementById('_toggle_host_name').innerHTML = host;
        //setAndRenderEnabledOn(host);
        showRightToggleOnHostButton();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    editor = ace.edit("editor");
    document.getElementById('hzJavascript').addEventListener('click', saveChanges);
    document.getElementById('chkToggleOnHost').addEventListener('change', toggleOnHost);
    document.getElementById('slLibrary').addEventListener('change', setLibrary);

    chrome.storage.sync.get(function(obj) {
        var js = obj['hzjavascript_'+host];
        if (typeof js == 'string') {
            js = {'code':js,'enabled':'true','library':''};
        }
        if (typeof js == undefined) {
            js = {'code':'','enabled':'true','library':''};
        }
        enabled = js && js.enabled ? js.enabled : false;
        showRightToggleOnHostButton();
        editor.setValue(js && js.code ? js.code : "");
        library = js && js.library ? js.library : "";
        document.getElementById('slLibrary').value = library;
    });

    editor.on("input", update_ace_placeholder);
    setTimeout(update_ace_placeholder, 100);

});