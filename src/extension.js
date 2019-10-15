const vscode = require('vscode');


function getActiveDoc() {
    try {
        return vscode.window.activeTextEditor.document;
    } catch(exp) {}

    return null;
}

function handleDocOpen(activeDoc) {
    try {
        if(activeDoc && activeDoc.languageId !== "postman_log") {
            var data = activeDoc.getText();
            var lines = data.split("\n");
            var isPostmanLog = 0;
            var maxLines = (lines.length > 5 ? 5 : lines.length);
            for(var idx = 0; idx < maxLines; idx++) {
                if(/^\[[0-9]+\]\[[0-9]{13,13}\]\[[a-zA-Z]+\]\[[a-zA-Z]+\]\[.*\]/g.test(lines[idx])) {
                    isPostmanLog++;
                }
            }
            if(isPostmanLog === maxLines ) {
                vscode.languages.setTextDocumentLanguage(activeDoc, "postman_log");
            } 
        }
    } catch(exp) {
        console.log(exp);
    }
}

function activate(context) {
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(handleDocOpen));
    setTimeout( function () {
        handleDocOpen(getActiveDoc());
    }, 1000);
}

function deactivate() {
}

exports.activate = activate;
exports.deactivate = deactivate;