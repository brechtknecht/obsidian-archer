'use strict';

var obsidian = require('obsidian');

// Order matters: check <- before -> to avoid interference on <->
const ARROWS = [
  ['<-', '←'],
  ['->', '→'],
];

class ArrowReplacerPlugin extends obsidian.Plugin {
  onload() {
    // Intercept paste: replace arrows in pasted text before inserting
    this.registerEvent(
      this.app.workspace.on('editor-paste', (evt, editor) => {
        const text = evt.clipboardData?.getData('text/plain');
        if (!text) return;

        const hasArrow = ARROWS.some(([arrow]) => text.includes(arrow));
        if (!hasArrow) return;

        evt.preventDefault();
        let replaced = text;
        for (const [arrow, replacement] of ARROWS) {
          replaced = replaced.split(arrow).join(replacement);
        }
        editor.replaceSelection(replaced);
      })
    );

    // Check the 2 chars before the cursor on every keystroke
    this.registerEvent(
      this.app.workspace.on('editor-change', (editor) => {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const ch = cursor.ch;

        if (ch < 2) return;

        const pair = line.slice(ch - 2, ch);

        for (const [arrow, replacement] of ARROWS) {
          if (pair === arrow) {
            editor.replaceRange(
              replacement,
              { line: cursor.line, ch: ch - 2 },
              { line: cursor.line, ch }
            );
            return;
          }
        }
      })
    );
  }

  onunload() {}
}

module.exports = ArrowReplacerPlugin;
