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
pluginId = 'sublime-text_v0.0.3'

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

        selected_line_numbers = []
        for r in view.sel():
            start = view.rowcol(r.a)
            end = view.rowcol(r.b)
            if start[0] == end[0] and start[1] == end[1]:
                continue
            elif start[0] <= end[0]:
                selected_line_numbers += range(start[0] + 1, end[0] + 2)
            else:
                selected_line_numbers += range(end[0] + 1, start[0] + 2)

        json_body = json.dumps({
            'source': 'sublime-text',
            'action': action,
            'filename': realpath(view.file_name()),
            'plugin_id': pluginId,
            'selectedLineNumbers': selected_line_numbers
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
