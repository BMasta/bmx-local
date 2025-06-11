# BMX - Local
My personal VSCode extension designed to run on the local machine.

## Commands

### cursorUp and cursorDown
When select=true, selects entire lines of text similar to vim's visual mode. Overrides default shift+up
and ctrl+shift+up when a text editor is focused.

When select=false, moves the cursor instead of selecting.

The number of lines to move/select is based on `amount` or `amountPercent`. If `amountPercent` is used,
a minimum number of lines can be specified with `amountMin` and `amountMax`.

```jsonc
// defaults
{
  "command": "bmx-local.cursorUp",
  "key": "shift+up",
  "args": {
    "select": true
  },
  "when": "editorFocus"
},
{
  "command": "bmx-local.cursorDown",
  "key": "shift+down",
  "args": {
    "select": true
  },
  "when": "editorFocus"
},
{
  "command": "bmx-local.cursorUp",
  "args": {
    "amount": 10,
    "select": true
  },
  "key": "ctrl+shift+up",
  "when": "editorFocus"
},
{
  "command": "bmx-local.cursorDown",
  "args": {
    "amount": 10,
    "select": true
  },
  "key": "ctrl+shift+down",
  "when": "editorFocus"
},
{
  "command": "bmx-local.cursorUp",
  "args": {
    "amountPercent": 10,
    "amountMin": 20
  },
  "key": "ctrl+alt+shift+up",
  "when": "editorFocus"
},
{
  "command": "bmx-local.cursorDown",
  "args": {
    "amountPercent": 10,
    "amountMin": 20
  },
  "key": "ctrl+alt+shift+down",
  "when": "editorFocus"
}
```

### multiStateFold
Multi-state fold is a command that folds/unfolds regions in a document based
on how many times it is triggered. \
Moving the cursor will reset the trigger count. Overrides workbench.action.quickOpenView by default.

- <b>1st trigger:</b> Unfold the smallest region that contains the cursor and
all of its child regions. \
Fold everything else. Only operates on relevant regions.
- <b>2nd trigger:</b> Unfold the biggest region that contains the cursor and
all of its child regions. \
Fold everything else. Only operates on relevant regions.
- <b>3rd trigger:</b> Fold everything. Only operates on relevant regions.
- <b>4th trigger:</b> Unfold everything. Operates on <b>all</b> regions.

<b>Relevant regions</b> are specified in args:
```jsonc
{
    "key": "ctrl+q",
    "command": "bmx-local.multiStateFold",
    "args": {
        "foldComments": false,
        "foldImports": false,
        "minSize": 3
    }
}
```

## Keybindings

### Toggle sidebar visibility
Overrides the default ctrl+b keybinding.

<b>When the sidebar is open</b>, pressing ctrl+b will hide both the sidebar and the activity bar. \
<b>When the sidebar is hidden</b>, pressing ctrl+b will open both the sidebar and the activity bar. \
<b>When the sidebar is hidden</b>, pressing any other shortcut that opens it will not open the activity bar (e.g. ctrl+shift+e for explorer).
