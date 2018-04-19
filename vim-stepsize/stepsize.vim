function! s:get_visual_selection()
  let [lnum1, col1] = getpos("v")[1:2]
  let [lnum2, col2] = getpos(".")[1:2]
  if lnum1 <= lnum2
    let lines = getline(lnum1, lnum2)
  else
    let lines = getline(lnum2, lnum1)
  endif
  return [join(lines, "\n"), lnum1, lnum2]
endfunction

function! PyStepsizeEvent(action)
    let l:filename = expand("%:p")
    let currentmode = mode()
    if currentmode =~? '.*v'
      let l:selected = s:get_visual_selection()
    else
      "let l:selected = getline('.')
      let l:selected = ''
    endif
python << endpython
import vim
import os
import json
import socket

pluginId = 'vim_v0.0.3'

def cursor_pos(buf, pos):
    (line, col) = pos
    return sum(len(l) for l in buf[:line-1]) + col + (line-1)

def realpath(p):
    try:
        return os.path.realpath(p)
    except:
        return p

def send_event(action, filename):
    realname = realpath(filename) if filename else None
    pos = cursor_pos(list(vim.current.buffer),
                    vim.current.window.cursor)
    selections = [{'start': pos, 'end': pos}]
    selected = vim.eval("l:selected")
    selected_line_numbers = []
    if selected == '0':
      selected = ''
    elif type(selected) is list:
      selected_line_numbers = [int(selected[1]), int(selected[2])]
      if selected_line_numbers[0] <= selected_line_numbers[1]:
        selected_line_numbers = range(selected_line_numbers[0], selected_line_numbers[1] + 1)
      else:
        selected_line_numbers = range(selected_line_numbers[1], selected_line_numbers[0] + 1)
      selected = selected[0]

    event = {
        'source': 'vim',
        'action': action,
        'filename': realname,
        'selectedLineNumbers': selected_line_numbers,
        'plugin_id': pluginId
    }

    SOCK_ADDRESS = ('localhost', 49369)
    SOCK_BUF_SIZE = 2 << 20
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, SOCK_BUF_SIZE)
    sock.sendto(json.dumps(event), SOCK_ADDRESS)

send_event(vim.eval("a:action"), vim.eval("l:filename"))
endpython
endfunction

function! Py3StepsizeEvent(action)
    let l:filename = expand("%:p")
    let currentmode = mode()
    if currentmode =~? '.*v'
      let l:selected = s:get_visual_selection()
    else
      "let l:selected = getline('.')
      let l:selected = ''
    endif
py3 << endpython
import vim
import os
import json
import socket

pluginId = 'vim_v0.0.3'

def cursor_pos(buf, pos):
    (line, col) = pos
    return sum(len(l) for l in buf[:line-1]) + col + (line-1)

def realpath(p):
    try:
        return os.path.realpath(p)
    except:
        return p

def send_event(action, filename):
    realname = realpath(filename) if filename else None
    pos = cursor_pos(list(vim.current.buffer),
                    vim.current.window.cursor)
    selections = [{'start': pos, 'end': pos}]
    selected = vim.eval("l:selected")
    selected_line_numbers = []
    if selected == '0':
      selected = ''
    elif type(selected) is list:
      selected_line_numbers = [int(selected[1]), int(selected[2])]
      if selected_line_numbers[0] <= selected_line_numbers[1]:
        selected_line_numbers = list(range(selected_line_numbers[0], selected_line_numbers[1] + 1))
      else:
        selected_line_numbers = list(range(selected_line_numbers[1], selected_line_numbers[0] + 1))
      selected = selected[0]

    event = {
        'source': 'vim',
        'action': action,
        'filename': realname,
        'selectedLineNumbers': selected_line_numbers,
        'plugin_id': pluginId
    }

    SOCK_ADDRESS = ('localhost', 49369)
    SOCK_BUF_SIZE = 2 << 20
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, SOCK_BUF_SIZE)
    sock.sendto(json.dumps(event).encode(), SOCK_ADDRESS)


send_event(vim.eval("a:action"), vim.eval("l:filename"))
endpython
endfunction

if has('python')
    augroup StepsizePlugin
        autocmd CursorMoved  * :call PyStepsizeEvent('selection')
        autocmd CursorMovedI * :call PyStepsizeEvent('edit')
        autocmd BufEnter     * :call PyStepsizeEvent('focus')
        autocmd BufLeave     * :call PyStepsizeEvent('lost_focus')
    augroup END
elseif has ('python3')
    augroup StepsizePlugin
        autocmd CursorMoved  * :call Py3StepsizeEvent('selection')
        autocmd CursorMovedI * :call Py3StepsizeEvent('edit')
        autocmd BufEnter     * :call Py3StepsizeEvent('focus')
        autocmd BufLeave     * :call Py3StepsizeEvent('lost_focus')
    augroup END
endif