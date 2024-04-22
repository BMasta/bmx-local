import * as vscode from 'vscode';

enum Action {
    Primary,
    Secondary,
    Tertiarty,
    Quaternary
}

let foldingAction: Action = Action.Primary; 

// Helpers ------------------------------------------------------------------------------------- //
function printFoldingRanges(msg: string, ranges: vscode.FoldingRange[]) {
    let rangesStr: string[] = [];
    ranges.forEach(r => {
        rangesStr.push("".concat(String(r.start), "-", String(r.end)));
    });
    console.log(msg.concat(": ", rangesStr.join(", ")));
}

function filterFoldingRangesByKind(
    foldingRanges: vscode.FoldingRange[],
    allowed: (vscode.FoldingRangeKind | undefined) []
) {
    let defaultAllowed = allowed.includes(undefined);
    return foldingRanges.filter((r: vscode.FoldingRange) => {
        if (r.kind === undefined && defaultAllowed) {
            return true;
        }
        if (allowed.includes(r.kind)) {
            return true;
        }
        return false;
    });
}

function filterFoldingRangesBySize(foldingRanges: vscode.FoldingRange[], size: number) {
    return foldingRanges.filter((r: vscode.FoldingRange) => {
        if (r.end - r.start + 1 < size) {
            return false;
        }
        return true;
    });
}

async function getAllFoldingRanges() {
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return [];
    }

    let ranges: vscode.FoldingRange[] = await
        vscode.commands.executeCommand('vscode.executeFoldingRangeProvider', editor.document.uri);
    if (!Array.isArray(ranges)) {
        return [];
    }
    return ranges;
}

async function getValidFoldingRanges(
    foldComments: boolean,
    foldImports: boolean,
    minSize: number
) {
    let ranges = await getAllFoldingRanges();

    ranges = filterFoldingRangesBySize(ranges, minSize);
    let allowedKinds: (vscode.FoldingRangeKind | undefined)[] = [undefined];
    if (foldComments) {
        allowedKinds.push(vscode.FoldingRangeKind.Comment);
    }
    if (foldImports) {
        allowedKinds.push(vscode.FoldingRangeKind.Imports);
    }
    ranges = filterFoldingRangesByKind(ranges, allowedKinds);

    return ranges;
}

function getCurrentTopLevelFoldingRange(foldingRanges: vscode.FoldingRange[], cursor: number) {
    let curEnd: number | undefined = undefined;

    for (let r of foldingRanges) {
        if (curEnd === undefined || r.end > curEnd) {
            if (r.start <= cursor && cursor <= r.end) {
                return r;
            }
            curEnd = r.end;
        }
    };
    return foldingRanges[0];
}

function getCurrentFoldingRange(
    foldingRanges: vscode.FoldingRange[],
    cursor: number
) {
    let current = foldingRanges[0];
    let size: number|undefined;

    // find smallest 
    for (const r of foldingRanges) {
        if (r.start <= cursor && cursor <= r.end) {
            if (size === undefined || size > r.end - r.start + 1) {
                size = r.end - r.start + 1;
                current = r;
            }
        }
    }
    return current;
}

function getChildfoldingRanges(
    foldingRanges: vscode.FoldingRange[],
    parent: vscode.FoldingRange,
    includeItself: boolean
) {
    return foldingRanges.filter((r: vscode.FoldingRange) => {
        if (parent.start <= r.start && r.end <= parent.end) {
            if (includeItself || !(parent.start === r.start && r.end === parent.end)) {
                return true;
            }
        }
        return false;
    });
}

function getParentFoldingRanges(
    foldingRanges: vscode.FoldingRange[],
    child: vscode.FoldingRange,
    includeItself: boolean
) {
    return foldingRanges.filter((r: vscode.FoldingRange) => {
        if (r.start <= child.start && child.end <= r.end) {
            if (includeItself || !(child.start === r.start && r.end === child.end)) {
                return true;
            }
        }
        return false;
    });
}

function fold_unfold(rangesToFold: vscode.FoldingRange[], rangesToUnfold: vscode.FoldingRange[]) {
    let linesToUnfold = rangesToUnfold.map((r: vscode.FoldingRange) => {return r.start;});
    let linesToFold = rangesToFold.map((r: vscode.FoldingRange) => {return r.start;});
    if (linesToUnfold.length > 0) {
        vscode.commands.executeCommand('editor.unfold', {'levels': 1, 'selectionLines': linesToUnfold});
    }
    if (linesToFold.length > 0) {
        vscode.commands.executeCommand('editor.fold', {'levels': 1, 'selectionLines': linesToFold});
    }
}

// Events -------------------------------------------------------------------------------------- //
export function onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
    // folding command does different things based on how many times it is triggered
    // when we move cursor, the number of triggers resets to 0 (primary)
    // since folding can also move the cursor, we ensure it was moved manually
    if (e.kind !== vscode.TextEditorSelectionChangeKind.Command) {
        foldingAction = Action.Primary;
    }
}

// Commands ------------------------------------------------------------------------------------ //
export async function multiStateFold(args: {}) {
    // parse args
    let foldComments = false;
    let foldImports = false;
    let minSize = 3;
    if (args !== undefined) {
        if ('foldComments' in args && typeof(args['foldComments']) === 'boolean') {
            foldComments = args['foldComments'];
        }
        if ('foldImports' in args && typeof(args['foldImports']) === 'boolean') {
            foldImports = args['foldImports'];
        }
        if ('minSize' in args && typeof(args['minSize']) === 'number') {
            minSize = args['minSize'];
        }
    }

    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        return;
    }

    // we only trigger cursor-based actions if
    // selection is available and is contained on a single line
    let cursor = editor.selection.active.line;
    if (cursor !== editor.selection.anchor.line) {
        // fold all instead
        foldingAction = Action.Tertiarty;
    }
    
    // calculate which ranges to fold and which to unfold based on the number of triggers
    let ranges = await getValidFoldingRanges(foldComments, foldImports, minSize);
    printFoldingRanges('All valid ranges', ranges);
    let rangesToUnfold: vscode.FoldingRange[] = [];
    let rangesToFold: vscode.FoldingRange[] = [];
    switch (foldingAction) {
        // 1st trigger: fold all except current, its parents and its children
        case Action.Primary:
            let cur = getCurrentFoldingRange(ranges, cursor);
            let children = getChildfoldingRanges(ranges, cur, false);
            let parents = getParentFoldingRanges(ranges, cur, false);
            rangesToUnfold = children.concat(cur, parents);
            rangesToFold = ranges.filter((r: vscode.FoldingRange) => {
                return !rangesToUnfold.includes(r);
            });
            foldingAction = Action.Secondary;
            break;
        // 2nd trigger: fold all except all children of the current top-level block
        case Action.Secondary:
            let currentTLR = getCurrentTopLevelFoldingRange(ranges, cursor);
            rangesToUnfold = getChildfoldingRanges(ranges, currentTLR, true);
            printFoldingRanges('Current top-level range', [currentTLR]);
            printFoldingRanges('Its children + itself', rangesToUnfold);
            rangesToFold = ranges.filter((r: vscode.FoldingRange) => {
                return !rangesToUnfold.includes(r);
            });
            foldingAction = Action.Tertiarty;
            break;
        // 3rd trigger: fold all
        case Action.Tertiarty:
            rangesToFold = ranges;
            foldingAction = Action.Quaternary;
            break;
        // 4th trigger: unfold all
        case Action.Quaternary:
            // we want to unfold even invalid ranges since they could've been
            // folded by other commands on manual action
            rangesToUnfold = await getAllFoldingRanges();
            foldingAction = Action.Primary;
            break;
    }

    fold_unfold(rangesToFold, rangesToUnfold);
}
