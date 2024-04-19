import * as vscode from 'vscode';
import * as sel from './selection';

export function registerCommands(context: vscode.ExtensionContext) {
    console.log('Registering commands');
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.selectLineUp', (args: {}) => {
            sel.selectLineUp(args);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.selectLineDown', (args: {}) => {
            sel.selectLineDown(args);
        }));
}
