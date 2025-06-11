import * as vscode from 'vscode';

enum Location {
    Start,
    Middle,
    End,
}

function show(msg: any) {
    vscode.window.showInformationMessage(String(msg));
}

function endChar(editor: vscode.TextEditor, line: number) {
    return editor.document.lineAt(line).range.end.character;
}

function getActiveLineRange(editor: vscode.TextEditor) {
    let activeLine = editor.selection.active.line;
    let activeLineEndChar = endChar(editor, activeLine);
    return new vscode.Range(
        new vscode.Position(activeLine, 0),
        new vscode.Position(activeLine, activeLineEndChar));
}

function adjustedPositionAt(editor: vscode.TextEditor, line: number, location: Location) {

    let lastLine = editor.document.lineCount - 1;
    let newLine;
    let newChar;

    // adjust values if line is out of boundaries
    if (line < 0) {
        newLine = 0;
        newChar = 0;
    } else if (line > lastLine) {
        newLine = lastLine;
        newChar = endChar(editor, lastLine);
    }
    // no adjustments needed
    else {
        if (location === Location.Start) {
            newLine = line;
            newChar = 0;
        } else if (location === Location.End) {
            newLine = line;
            newChar = endChar(editor, line);
        } else {
            newLine = line;
            newChar = editor.selection.active.character;
        }
    }

    return new vscode.Position(newLine, newChar);
}

function isPartialSelection(editor: vscode.TextEditor, dir: number) {
    return !editor.selection.contains(getActiveLineRange(editor));
}

function selectLine(editor: vscode.TextEditor, dir: number, amount: number) {
    let anchorLine = editor.selection.anchor.line;
    let activeLine = editor.selection.active.line;

    // if current line is not fully selected, select one less line in total
    let adjustedAmount = amount;
    if (isPartialSelection(editor, dir)) {
        adjustedAmount -= 1;
    }
    let newActiveLine = activeLine + dir * amount;

    let isNewSelectionReversed = (
        // when selection is within one line and selecting up
        (newActiveLine === anchorLine && dir < 0) ||
        // when active line < anchor line
        (newActiveLine < anchorLine)
    );

    let newSelection;
    if (isNewSelectionReversed) {
        newSelection = new vscode.Selection(
            adjustedPositionAt(editor, anchorLine, Location.End),
            adjustedPositionAt(editor, activeLine + dir * adjustedAmount, Location.Start));
    } else {
        newSelection = new vscode.Selection(
            adjustedPositionAt(editor, anchorLine, Location.Start),
            adjustedPositionAt(editor, activeLine + dir * adjustedAmount, Location.End));
    }

    if (editor.selection.isEmpty ||
        (editor.selection.isReversed === newSelection.isReversed) ||
        (amount === 1)
    ) {
        editor.selection = newSelection;
    } else {
        // for large selections we want to go back to anchor when selection flips
        editor.selection = new vscode.Selection(
            editor.selection.anchor,
            editor.selection.anchor
        );
    }
    editor.revealRange(getActiveLineRange(editor));
}

function moveCursor(editor: vscode.TextEditor, dir: number, amount: number) {
    let newActiveLine = editor.selection.active.line + dir * amount;
    let newActiveChar = editor.selection.active.character;

    // adjust values if line is out of boundaries
    let lastLine = editor.document.lineCount - 1;
    if (newActiveLine < 0) {
        newActiveLine = 0;
        newActiveChar = 0;
    } else if (newActiveLine > lastLine) {
        newActiveLine = lastLine;
        newActiveChar = endChar(editor, lastLine);
    }

    editor.selection = new vscode.Selection(
        new vscode.Position(newActiveLine, newActiveChar),
        new vscode.Position(newActiveLine, newActiveChar)
    );
    editor.revealRange(getActiveLineRange(editor));
}

function cursor(args: {}, dir: number) {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    // Parse args
    let amount = 1;
    let select = false
    if (args !== undefined) {
        // Calculate requested amount
        if ('amount' in args && typeof (args['amount']) === 'number'
            && args['amount'] > 0
        ) {
            amount = args['amount'];
        } else if ('amountPercent' in args && typeof (args['amountPercent']) === 'number' &&
            args['amountPercent'] > 0 && args['amountPercent'] <= 100
        ) {
            amount = Math.round(editor.document.lineCount * args['amountPercent'] / 100)
        }

        // Clamp amount to appropriate range
        if ('amountMin' in args && typeof (args['amountMin']) === 'number'
            && args['amountMin'] > 0
        ) {
            amount = (amount >= args['amountMin']) ? amount : args['amountMin'];
        }
        if ('amountMax' in args && typeof (args['amountMax']) === 'number'
            && args['amountMax'] > 0
        ) {
            amount = (amount <= args['amountMax']) ? amount : args['amountMax'];
        }

        // Should select?
        if ('select' in args && typeof (args['select']) === 'boolean') {
            select = args['select'];
        }
    }

    // Delegate to appropriate function
    if (select) {
        selectLine(editor, dir, amount);
    } else {
        moveCursor(editor, dir, amount);
    }
}

export function cursorUp(args: {}) {
    cursor(args, -1)
}

export function cursorDown(args: {}) {
    cursor(args, 1)
}
