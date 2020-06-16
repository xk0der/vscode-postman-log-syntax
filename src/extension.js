const vscode = require('vscode');

function findTimestamps(doc) {
    let matches = new Array();
    for(let idx = 0; idx < doc.lineCount; idx++) {
        const line = doc.lineAt(idx);
        regex = /^\[[0-9]+\]\[([0-9]+)\]/;
        if(match = regex.exec(line.text)) {
            let startPos = line.text.indexOf(match[1]);
            let endPos = startPos + match[1].length;
            matches.push({
                ts: match[1],
                dateText: new Date(match[1]*1),
                position: {
                    start: startPos,
                    end: endPos,
                    line: idx
                }  
            });
        
        }    
    }
    return matches;
}

function toggleTimestamps() {
    var doc = getActiveDoc();
    config = vscode.workspace.getConfiguration();
    var val = config.inspect('editor.codeLens');
    var value = val.globalValue !== undefined ? val.globalValue : val.defaultValue;
    config.update('editor.codeLens', !value, true);
}

function dummy() {

}

var xkCodelensProvider =  {

    provideCodeLenses: async function (doc, token) {
        const matches = findTimestamps(doc);
       
        cl = matches.map( match => new vscode.CodeLens(new vscode.Range(match.position.line, match.position.start, match.position.line, match.position.end), {
            title: match.dateText,
            tooltip: 'Hide timestamp (Toggles editor.Codelens)',
            command: 'extension.dummy',
        }));
        return cl;
    },

    resolveCodeLens: function (lense, token) {
        return [];
    }

};



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
    context.subscriptions.push(vscode.commands.registerCommand('extension.toggleTimestamps', toggleTimestamps));
    context.subscriptions.push(vscode.commands.registerCommand('extension.dummy', dummy));
    setTimeout( function () {
        handleDocOpen(getActiveDoc());
        vscode.languages.registerCodeLensProvider({language: "postman_log", scheme: "file"}, xkCodelensProvider)
    }, 1000);

}

function deactivate() {
}

exports.activate = activate;
exports.deactivate = deactivate;