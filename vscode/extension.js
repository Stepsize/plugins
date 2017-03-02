// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var dgram = require('dgram');
var UDP_HOST =  "127.0.0.1", UDP_PORT = 49369;
var pluginId = 'vscode_v0.0.2';

// this method is called when your extension is activated
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Stepsize Layer" is now active!');

    var socket = dgram.createSocket("udp4"), pending = [];

    vscode.workspace.onDidOpenTextDocument(function (document) {
      var data = {
        filename: document.fileName, selected: '', plugin_id: pluginId
      }
      var message = JSON.stringify(data);
      socket.send(message, 0, message.length, UDP_PORT, UDP_HOST);
    })

    vscode.window.onDidChangeTextEditorSelection(function (event) {
      var selectedLineNumbers = getSelectedLineNumbers(event.selections);
      var data = {
        selectedLineNumbers,
        filename: event.textEditor._documentData._document.fileName,
        selected: getSelected(event.textEditor._documentData._lines, event.selections[0]),
        plugin_id: pluginId
      };
      var message = JSON.stringify(data);
      socket.send(message, 0, message.length, UDP_PORT, UDP_HOST);
      pending.push(event);
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.send', function () {
        // The code you place here will be executed every time your command is executed
        //not used by stepsize right now just left it here as an example
    });

    context.subscriptions.push(disposable);
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
