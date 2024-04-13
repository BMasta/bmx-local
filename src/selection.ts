import * as vscode from 'vscode';

export function select_line(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, amount: number) {
    if (amount === 0) {
        return;
    }

    // the goal is to calculate these parameters and create a new selection out of them
    let newActiveLine;
    let newAnchorLine;
    let newActiveCharacter;
    let newAnchorCharacter;

    // calculate new active line --------------------------------------------------------------- //
    newActiveLine = editor.selection.active.line + amount;
    let activeRange = editor.document.lineAt(editor.selection.active.line).range;

    // selecting multiple lines down and cursor not at end of line
    let c1 = ( 
        editor.selection.start.character !== activeRange.start.character &&
        editor.selection.anchor.line > activeRange.start.line);
    // selecting multiple lines up and cursor not at start of line
    let c2 = (
        editor.selection.end.character !== activeRange.end.character &&
        editor.selection.anchor.line < activeRange.end.line);
    // selecting one line and cursor+anchor are not at boundaries of current line
    let c3 = (
        editor.selection.anchor.line === editor.selection.active.line && (
            editor.selection.start.character !== activeRange.start.character ||
            editor.selection.end.character !== activeRange.end.character));
    
    // if any of these conditions are true, the current line is not fully selected
    if (c1 || c2 || c3) {
        // current line also needs to be selected so we adjust the line delta by one
        newActiveLine -= Math.sign(amount);     
    }
    // finally, we ensure the new active line is within the boundaries of the document
    newActiveLine = Math.min(editor.document.lineCount-1, Math.max(0, newActiveLine));

    // calculate new anchor line --------------------------------------------------------------- //
    newAnchorLine = editor.selection.anchor.line;

    // calculate new active/anchor characters -------------------------------------------------- //
    // new active character is 0 if selecting up, end of line otherwise
    // new anchor character is 0 if selecting down, end of line otherwise
    if (newActiveLine > newAnchorLine) {
        newActiveCharacter = editor.document.lineAt(newActiveLine).range.end.character;
        newAnchorCharacter = 0;
    } else if (newActiveLine < newAnchorLine) {
        newActiveCharacter = 0;
        newAnchorCharacter = editor.document.lineAt(newAnchorLine).range.end.character;
    } else {
        if (amount < 0) {
            newActiveCharacter = 0;
            newAnchorCharacter = editor.document.lineAt(newAnchorLine).range.end.character;
        } else {
            newActiveCharacter = editor.document.lineAt(newActiveLine).range.end.character;
            newAnchorCharacter = 0;
        }
    }

    // create and pass the new selection ------------------------------------------------------- //
    editor.selection = new vscode.Selection(
        editor.document.validatePosition(new vscode.Position(newAnchorLine, newAnchorCharacter)),
        editor.document.validatePosition(new vscode.Position(newActiveLine, newActiveCharacter))
    );
}