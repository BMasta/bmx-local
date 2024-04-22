import * as vscode from 'vscode';
import * as folding from './folding';

export function subscribeToEvents(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(folding.onDidChangeTextEditorSelection));
}