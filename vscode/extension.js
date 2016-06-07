// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var dgram = require('dgram');
var UDP_HOST =  "127.0.0.1", UDP_PORT = 49369;

// this method is called when your extension is activated
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "stepsize" is now active!');

    var socket = dgram.createSocket("udp4"), pending = [];

    vscode.workspace.onDidOpenTextDocument(function (document) {
      var data = { filename: document.fileName, selected: '' }
      var message = JSON.stringify(data);
      socket.send(message, 0, message.length, UDP_PORT, UDP_HOST);
    })

    vscode.window.onDidChangeTextEditorSelection(function (event) {
      pending.push(event);
    })

    setInterval(function() {
      if (pending.length > 0) {
        var event = pending[pending.length - 1];
        var data = {
          filename: event.textEditor._documentData._document.fileName,
          selected: getSelected(event.textEditor._documentData._lines, event.selections[0])
        }
        var message = JSON.stringify(data);
        socket.send(message, 0, message.length, UDP_PORT, UDP_HOST);
        pending = [];
      }
    }, 500);

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

function getSelected (lines, selection) {
  var start = selection.start.line, end = selection.end.line;
  var text = lines.slice(start, end + 1).join('\n');
  return(text);
}

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
