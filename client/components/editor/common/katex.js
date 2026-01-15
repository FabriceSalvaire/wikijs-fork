// Test if potential opening or closing delimieter
// Assumes that there is a "$" at state.src[pos]
function is_valid_delim (state, pos) {
  let prev_char
  let next_char
  let max = state.posMax
  let can_open = true
  let can_close = true

  prev_char = pos > 0 ? state.src.charCodeAt(pos - 1) : -1
  next_char = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1

  // Check non-whitespace conditions for opening and closing, and
  // check that closing delimeter isn't followed by a number
  if (prev_char === 0x20/* " " */ || prev_char === 0x09/* \t */ ||
    (next_char >= 0x30/* "0" */ && next_char <= 0x39/* "9" */))
    can_close = false
  if (next_char === 0x20/* " " */ || next_char === 0x09/* \t */)
    can_open = false

  return {
    can_open: can_open,
    can_close: can_close
  }
}

export default {
  // ---------------------------------------------
  katexInline (state, silent) {
    let start, match, token, res, pos

    if (state.src[state.pos] !== '$')
      return false

    res = is_valid_delim(state, state.pos)
    if (!res.can_open) {
      if (!silent)
        state.pending += '$'
      state.pos += 1
      return true
    }

    // First check for and bypass all properly escaped delimieters
    // This loop will assume that the first leading backtick can not
    // be the first character in state.src, which is known since
    // we have found an opening delimieter already.
    start = state.pos + 1
    match = start
    while ((match = state.src.indexOf('$', match)) !== -1) {
      // Found potential $, look for escapes, pos will point to
      // first non escape when complete
      pos = match - 1
      while (state.src[pos] === '\\')
        pos -= 1

      // Even number of escapes, potential closing delimiter found
      if (((match - pos) % 2) === 1)
        break
      match += 1
    }

    // No closing delimter found.  Consume $ and continue.
    if (match === -1) {
      if (!silent)
        state.pending += '$'
      state.pos = start
      return true
    }

    // Check if we have empty content, ie: $$.  Do not parse.
    if (match - start === 0) {
      if (!silent)
        state.pending += '$$'
      state.pos = start + 1
      return true
    }

    // Check for valid closing delimiter
    res = is_valid_delim(state, match)
    if (!res.can_close) {
      if (!silent)
        state.pending += '$'
      state.pos = start
      return true
    }

    if (!silent) {
      token = state.push('katex_inline', 'math', 0)
      token.markup = '$'
      token.content = state.src
        // Extract the math part without the $
        .slice(start, match)
        // Escape the curly braces since they will be interpreted as
        // attributes by markdown-it-attrs (the "curly_attributes" core rule)
        .replaceAll("{", "{{")
        .replaceAll("}", "}}")
    }

    state.pos = match + 1
    return true
  },

  // ---------------------------------------------
  katexBlock (state, start, end, silent) {
    let first_line; let last_line; let next; let last_pos; let found = false; let token
    let pos = state.bMarks[start] + state.tShift[start]
    let max = state.eMarks[start]

    if (pos + 2 > max)
      return false
    if (state.src.slice(pos, pos + 2) !== '$$')
      return false

    pos += 2
    first_line = state.src.slice(pos, max)

    if (silent)
      return true
    if (first_line.trim().slice(-2) === '$$') {
      // Single line expression
      first_line = first_line.trim().slice(0, -2)
      found = true
    }

    for (next = start; !found;) {
      next++

      if (next >= end)
        break

      pos = state.bMarks[next] + state.tShift[next]
      max = state.eMarks[next]

      if (pos < max && state.tShift[next] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        break
      }

      if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
        last_pos = state.src.slice(0, max).lastIndexOf('$$')
        last_line = state.src.slice(pos, last_pos)
        found = true
      }
    }

    state.line = next + 1

    token = state.push('katex_block', 'math', 0)
    token.block = true
    token.content = (first_line && first_line.trim() ? first_line + '\n' : '') +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (last_line && last_line.trim() ? last_line : '')
    token.map = [ start, state.line ]
    token.markup = '$$'
    return true
  }
}
