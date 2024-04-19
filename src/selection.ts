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
            adjustedPositionAt(editor, activeLine + dir*adjustedAmount, Location.Start));
    } else {
        newSelection = new vscode.Selection(
            adjustedPositionAt(editor, anchorLine, Location.Start),
            adjustedPositionAt(editor, activeLine + dir*adjustedAmount, Location.End));
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

export function selectLineUp(args: {}) {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    let amount = 1;
    if (args !== undefined &&
        'amount' in args &&
        typeof(args['amount']) === 'number' &&
        args['amount'] > 0
    ) {
        amount = args['amount'];
    }

    selectLine(editor, -1, amount);
}

export function selectLineDown(args: {}) {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    let amount = 1;
    if (args !== undefined &&
        'amount' in args &&
        typeof(args['amount']) === 'number' &&
        args['amount'] > 0
    ) {
        amount = args['amount'];
    }

    selectLine(editor, 1, amount);

}
