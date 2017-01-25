# Contents of this plugin will be reset by Stepsize on start. Changes you make
# are not guaranteed to persist.

import json
import os
import pprint
import sublime
import sublime_plugin
import socket
import sys
import time
import threading
import traceback
import hashlib
import base64


PYTHON_VERSION = sys.version_info[0]
pluginId = 'sublime-text_v0.0.2'

class SublimeStepsize(sublime_plugin.EventListener, threading.Thread):
    SOCK_ADDRESS = ('localhost', 49369)
    SOCK_BUF_SIZE = 2 << 20  # 2MB

    # Write to TCP socket with UDP protocol
    def _get_sock(self):
        sock = getattr(self, '_sock', None)
        if sock is None:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET,
                            socket.SO_SNDBUF, self.SOCK_BUF_SIZE)
            setattr(self, '_sock', sock)
        return sock

    def _write_sock(self, payload):
        try:
            sock = self._get_sock()
            sock.sendto(payload, self.SOCK_ADDRESS)
        except Exception as e:
            print("sock.sento exception: %s" % e)

    # Events
    def on_modified(self, view):
        self._update('edit', view)

    def on_selection_modified(self, view):
        self._update('selection', view)

    def on_activated(self, view):
        self._update('focus', view)

    def on_deactivated(self, view):
        self._update('lost_focus', view)

    def _update(self, action, view):
        # Check view group and index to determine if in source code buffer
        w = view.window()
        group, index = w.get_view_index(view)
        if group == -1 and index == -1:
            return

        full_region = sublime.Region(0, view.size())
        full_text = view.substr(full_region)
        selections = [{'start': r.a, 'end': r.b} for r in view.sel()]
        selected = ''
        for sel in selections:
            start = min(sel['start'], sel['end'])
            end = max(sel['start'], sel['end'])
            selected += full_text[start:end]

        # skip content over 1mb
        if len(selected) > (1 << 20): # 1mb
            action = 'skip'
            selected = 'file_too_large'

        selected_line_numbers = []
        for r in view.sel():
            start = view.rowcol(r.a)[0] + 1
            end = view.rowcol(r.b)[0] + 1
            if start <= end:
                selected_line_numbers += range(start, end + 1)
            else:
                selected_line_numbers += range(end, start + 1)

        json_body = json.dumps({
            'source': 'sublime-text',
            'action': action,
            'filename': realpath(view.file_name()),
            'selections': selections,
            'selected': selected,
            'plugin_id': pluginId,
            'selectedLineNumbers': selected_line_numbers
        })

        if PYTHON_VERSION >= 3:
            json_body = bytes(json_body, "utf-8")

        self._write_sock(json_body)

    def _error(self, data):
        view = sublime.active_window().active_view()
        json_body = json.dumps({
            'source': 'sublime-text',
            'action': 'error',
            'filename': realpath(view.file_name()),
            'selected': json.dumps(data),
            'plugin_id': pluginId
        })

        if PYTHON_VERSION >= 3:
            json_body = bytes(json_body, "utf-8")

        self._write_sock(json_body)

def realpath(p):
    """
    realpath replaces symlinks in a path with their absolute equivalent
    """
    try:
        return os.path.realpath(p)
    except:
        return p
