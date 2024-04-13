import * as vscode from 'vscode';
import * as csel from './selection';

export function registerCommands(context: vscode.ExtensionContext) {
    console.log('Registering commands');
    context.subscriptions.push(vscode.commands.registerTextEditorCommand(
            'bmx-local.selectLineUp', (editor, edit, args: {}) => {
                //console.log(args);
                csel.select_line(editor, edit, -1);}));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand(
            'bmx-local.selectLineDown', (editor, edit, args) => {
                csel.select_line(editor, edit, 1);}));
}
