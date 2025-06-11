import * as vscode from 'vscode';
import * as cursor from './cursor';
import * as folding from './folding';
import * as events from './events';

export function registerCommands(context: vscode.ExtensionContext) {
    console.log('Registering commands');
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.cursorUp', (args: {}) => {
            cursor.cursorUp(args);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.cursorDown', (args: {}) => {
            cursor.cursorDown(args);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.multiStateFold', async(args: {}) => {
            await folding.multiStateFold(args);
        }));
    events.subscribeToEvents(context);
}
