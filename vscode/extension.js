// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var dgram = require('dgram');
var UDP_HOST =  "127.0.0.1", UDP_PORT = 49369;
var pluginId = 'vscode_v0.0.3';

// this method is called when your extension is activated
function activate(context) {
    var socket = dgram.createSocket('udp4');

    vscode.workspace.onDidOpenTextDocument(function (document) {
      const editor = vscode.window.activeTextEditor;
      const filename = editor ? editor._documentData._document.fileName : null;  // `document.fileName` appends `.git` to paths for no apparent reason
      const selectedLineNumbers = editor ? getSelectedLineNumbers(editor.selections) : [];
      const data = { filename, selectedLineNumbers, plugin_id: pluginId };
      const message = JSON.stringify(data);
      socket.send(message, 0, message.length, UDP_PORT, UDP_HOST);
    });

    vscode.window.onDidChangeTextEditorSelection(function (event) {
      const filename = event.textEditor._documentData._document.fileName;
      const selectedLineNumbers = getSelectedLineNumbers(event.selections);
      const data = { filename, selectedLineNumbers, plugin_id: pluginId };
      const message = JSON.stringify(data);
      socket.send(message, 0, message.length, UDP_PORT, UDP_HOST);
    });
}
exports.activate = activate;

function getSelectedLineNumbers(selections) {
  return selections.reduce((acc, selection) => {
    var startLine = selection.start.line, startChar = selection.start.character;
    var endLine = selection.end.line, endChar = selection.end.character;
    if (startLine === endLine && startChar === endChar) return acc;
    if (endLine > 0 && endChar === 0) endLine -= 1;
    var numbers = [...Array(endLine - startLine + 1).keys()].map(key => key + startLine + 1);
    acc.push(...numbers);
    return acc;
  }, []);
}

function getSelected (lines, selection) {
  var start = selection.start.line, end = selection.end.line;
  var text = lines.slice(start, end + 1).join('\n');
  return(text);
}

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
