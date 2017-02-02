'use babel';

// Contents of this plugin will be reset by Stepsize on start. Changes you make
// are not guaranteed to persist.

var dgram = require('dgram');
var fs = require('fs');

var DEBUG = false;
var pluginId = 'atom_v0.0.2';

// StepsizeOutgoing contains logic for sending events to Stepsize in response to
// editor actions. We track edit, selections, and focus. These events
// are sent to a UDP server listening on 127.0.0.1:49369.
var StepsizeOutgoing = {
  UDP_HOST: "127.0.0.1",
  UDP_PORT: 49369,

  // NOTE: Ideally we'd set this w/ a 2MB socket buffer. Can't do this in nodejs AFAIK.
  OUTGOING_SOCK: dgram.createSocket("udp4"),

  PENDING_EVENTS: [],
  MERGE_CALLED: false,

  // setup callbacks for events we want to track for each editor instance
  observeEditor: function(editor) {
    editor.onDidChange(this.onEdit.bind(this, editor));
    editor.onDidChangeSelectionRange(this.onSelection.bind(this, editor));
  },

  // send an event to Stepsize. Because Atom likes to fire many selection and buffer
  // change events (and in strange orders), we actually accumulate all the events
  // and use setTimeout with a 0ms timeout to indicate when the events have stopped
  // firing. This works because nodejs is single-threaded and the setTimeout gets
  // scheduled after all other pending events have been handled. Once this happens,
  // we can call mergeEvents, which will pick the last event, and mark it as edit
  // if any of the events that occured for that keystroke was in fact an edit.
  send: function(event) {
    this.PENDING_EVENTS.push(event);
    if (!this.MERGE_CALLED) {
      this.MERGE_CALLED = true;
      setTimeout(this.mergeEvents.bind(this), 0);
    }
  },

  reset: function() {
    this.MERGE_CALLED = false;
    this.PENDING_EVENTS = [];
  },

  // called after a string of events have fired for a particular keystroke. We use this
  // to debounce the events - pick the last event and set it to edit of any of the events
  // we accumulated was in fact an edit.
  mergeEvents: function() {
    var event = this.PENDING_EVENTS[this.PENDING_EVENTS.length-1];
    for (var i = 0; i < this.PENDING_EVENTS.length; i++) {
      if (this.PENDING_EVENTS[i].action === "edit") {
        event.action = "edit";
      }
    }
    if (DEBUG) {
      console.log(event.action, event.selections[0]);
    }
    var msg = JSON.stringify(event);
    this.OUTGOING_SOCK.send(msg, 0, msg.length, this.UDP_PORT, this.UDP_HOST);
    this.reset();
  },

  // sendError - sends error message to Stepsize
  sendError: function(data) {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    var event = {
      'source': 'atom',
      'action': "error",
      'filename': fs.realpathSync(editor.getPath()),
      'selected': JSON.stringify(data),
      'plugin_id': pluginId
    };
    var msg = JSON.stringify(event);
    this.OUTGOING_SOCK.send(msg, 0, msg.length, this.UDP_PORT, this.UDP_HOST);
  },

  // callback handlers to track edit/selection/focus events
  onFocus: function(item) {
    // HACK(tarak): Check to see if the item is in fact a TextEditor object by
    // checking if it has the "buffer" property. This ensures we only handle focus
    // events on editor objects, instead of Settings, etc. which return DOM elements for
    // this event.
    if (item && item.buffer) {
      this.send(this.buildEvent(item, "focus"));
    }
  },
  onEdit: function(editor) {
    this.send(this.buildEvent(editor, "edit"));
  },
  onSelection: function(editor) {
    this.send(this.buildEvent(editor, "selection"));
  },

  // buildEvent constructs an event from the provided editor. It sets the
  // "action" field of the event to the provided value.
  buildEvent: function(editor, action) {
    var text = editor.getText();
    var cursorPoint = editor.getCursorBufferPosition();
    var cursorOffset = this.pointToOffset(text, cursorPoint);
    var selectedLineNumbers = editor.getSelectedBufferRanges().reduce((acc, range) => {
      if (range.start.row === range.end.row && range.start.column === range.end.column) return acc;
      if (range.end.column === 0 && range.end.row > 0) range.end.row -= 1;
      var numbers = [...Array(range.end.row - range.start.row + 1).keys()]
        .map(key => key + range.start.row + 1);
      acc.push(...numbers);
      return acc;
    }, []);
    return {
      "source": "atom",
      "action": action,
      "filename": editor.getPath(),
      "selections": [{
        "start": cursorOffset,
        "end": cursorOffset,
      }],
      "selected": editor.getSelectedText(),
      'plugin_id': pluginId,
      selectedLineNumbers,
    };
  },
  // pointToOffet takes the contents of the buffer and a point object
  // representing the cursor, and returns a byte-offset for the cursor
  pointToOffset: function(text, point) {
    var lines = text.split("\n");
    var total = 0;
    for (var i = 0; i < lines.length && i < point.row; i++) {
      total += lines[i].length;
    }
    total += point.column + point.row; // we add point.row to add in all newline characters
    return total;
  },
};

// ----------------

module.exports = {
  outgoing: StepsizeOutgoing,
  activate: function() {
    // observeTextEditors takes a callback that fires whenever a new
    // editor window is created. We use this to call "observeEditor",
    // which registers edit/selection based callbacks.
    atom.workspace.observeTextEditors(this.outgoing.observeEditor.bind(this.outgoing));

    // focus is tracked at the workspace level.
    atom.workspace.onDidChangeActivePaneItem(this.outgoing.onFocus.bind(this.outgoing));
  },
};
