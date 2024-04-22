import * as vscode from 'vscode';
import * as selection from './selection';
import * as folding from './folding';
import * as events from './events';

export function registerCommands(context: vscode.ExtensionContext) {
    console.log('Registering commands');
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.selectLineUp', (args: {}) => {
            selection.selectLineUp(args);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.selectLineDown', (args: {}) => {
            selection.selectLineDown(args);
        }));
    context.subscriptions.push(vscode.commands.registerCommand(
        'bmx-local.multiStateFold', async(args: {}) => {
            await folding.multiStateFold(args);
        }));
    events.subscribeToEvents(context);
}
